import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadResearchComparison } from '../utils/researchComparison.js'

const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../..'
)

function getPythonExecutable() {
    return process.platform === 'win32'
        ? path.join(root, '.venv', 'Scripts', 'python.exe')
        : path.join(root, '.venv', 'bin', 'python')
}

function parseComparison(output) {
    const sections = [
        'similarities',
        'differences',
        'key_findings',
        'conflicting_information',
    ]
    const text = output.trim()
    const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    const candidate = fencedMatch ? fencedMatch[1].trim() : text
    let comparison

    try {
        comparison = JSON.parse(candidate)
    } catch {
        const start = candidate.indexOf('{')
        const end = candidate.lastIndexOf('}')
        if (start === -1 || end <= start) {
            throw new Error('Comparison response was not valid JSON.')
        }
        try {
            comparison = JSON.parse(candidate.slice(start, end + 1))
        } catch {
            throw new Error('Comparison response was not valid JSON.')
        }
    }

    if (!comparison || typeof comparison !== 'object' || Array.isArray(comparison) ||
        sections.some(section => typeof comparison[section] !== 'string')) {
        throw new Error('Comparison response did not contain all required sections.')
    }

    return Object.fromEntries(
        sections.map(section => [section, comparison[section]])
    )
}

function compareReportsWithLlm(research) {
    const pythonCode = `
import json, sys
from agents import llm

input_data = json.loads(sys.stdin.read())
prompt = f"""
Compare the two research reports below using ONLY information explicitly contained in them.
Do not add outside facts, assumptions, or invented details.
Return ONLY one valid JSON object with exactly these four string keys and no
Markdown, code fences, commentary, or additional keys:
{{
    "similarities": "...",
    "differences": "...",
    "key_findings": "...",
    "conflicting_information": "..."
}}

Research 1:
{input_data['research1']['report']}

Research 2:
{input_data['research2']['report']}
"""
response = llm.invoke(prompt)
print(response.content)
`

    return new Promise((resolve, reject) => {
        const python = spawn(getPythonExecutable(), ['-u', '-c', pythonCode], {
            cwd: root,
            env: process.env,
            windowsHide: true,
        })
        let output = ''
        let error = ''

        python.stdout.on('data', chunk => { output += chunk.toString() })
        python.stderr.on('data', chunk => { error += chunk.toString() })
        python.on('error', startError => {
            reject(new Error(`Could not start comparison model: ${startError.message}`))
        })
        python.on('close', code => {
            if (code !== 0) {
                reject(new Error(error.trim() || output.trim() || `Comparison model exited with code ${code}`))
                return
            }

            try {
                const rawResponse = output.trim()
                console.log("RAW COMPARISON RESPONSE:", rawResponse)
                resolve(parseComparison(rawResponse))
            } catch (parseError) {
                reject(new Error(`Invalid comparison response: ${parseError.message}`))
            }
        })

        python.stdin.end(JSON.stringify(research))
    })
}

export async function compareResearches(researchId1, researchId2) {
    const research = await loadResearchComparison(researchId1, researchId2)
    return compareReportsWithLlm(research)
}