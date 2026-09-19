import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentFile = fileURLToPath(import.meta.url)
const serverDirectory = path.dirname(path.dirname(currentFile))
const projectRoot = path.resolve(serverDirectory, '..')

function getPythonExecutable() {
    return process.platform === 'win32'
        ? path.join(projectRoot, '.venv', 'Scripts', 'python.exe')
        : path.join(projectRoot, '.venv', 'bin', 'python')
}

function runPythonPipeline(topic) {
    const pythonCode = [
        'import json, sys',
        'from pipeline import run_research_pipeline',
        'result = run_research_pipeline(sys.argv[1])',
        'print(json.dumps(result))',
    ].join('; ')

    return new Promise((resolve, reject) => {
        const pythonExecutable = getPythonExecutable()
        if (!existsSync(pythonExecutable)) {
            reject(new Error(`Project Python executable was not found at ${pythonExecutable}`))
            return
        }

        const python = spawn(pythonExecutable, ['-u', '-c', pythonCode, topic], {
            cwd: projectRoot,
            env: process.env,
            windowsHide: true,
        })
        let stdout = ''
        let stderr = ''

        python.stdout.on('data', (chunk) => { stdout += chunk.toString() })
        python.stderr.on('data', (chunk) => { stderr += chunk.toString() })
        python.on('error', (error) => reject(new Error(`Could not start Python: ${error.message}`)))
        python.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(stderr.trim() || stdout.trim() || `Python exited with code ${code}`))
                return
            }

            const jsonLine = stdout.trim()
            if (!jsonLine) {
                reject(new Error(`Python returned no JSON output${stderr.trim() ? `: ${stderr.trim()}` : '.'}`))
                return
            }
            try {
                resolve(JSON.parse(jsonLine))
            } catch {
                reject(new Error(`Python returned invalid JSON.${stderr.trim() ? ` Details: ${stderr.trim()}` : ` Output: ${stdout.slice(-1000)}`}`))
            }
        })
    })
}

export async function createResearch(request, response) {
    const topic = request.body?.topic?.trim()
    if (!topic) {
        response.status(400).json({ success: false, error: 'A research topic is required.' })
        return
    }

    try {
        const result = await runPythonPipeline(topic)
        response.json({
            success: true,
            topic,
            search_results: result.search_results,
            scraped_content: result.scraped_content,
            report: result.report,
            feedback: result.feedback,
            statuses: result.statuses,
        })
    } catch (error) {
        console.error('Research pipeline failed:', error.message)
        response.status(500).json({ success: false, error: error.message })
    }
}