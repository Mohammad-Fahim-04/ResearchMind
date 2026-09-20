import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Research from '../models/Research.js'

const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../..'
)

function runPython(topic) {
    const python = process.platform === 'win32'
        ? path.join(root, '.venv', 'Scripts', 'python.exe')
        : path.join(root, '.venv', 'bin', 'python')

    return new Promise((resolve, reject) => {
        const p = spawn(
            python,
            ['-u', '-c', `
import json, sys
from pipeline import run_research_pipeline

result = run_research_pipeline(sys.argv[1])
print(json.dumps(result))
            `, topic],
            { cwd: root, env: process.env }
        )

        let output = ''
        let error = ''

        p.stdout.on('data', data => output += data)
        p.stderr.on('data', data => error += data)

        p.on('close', code => {
            if (code !== 0) {
                return reject(new Error(error.trim() || output.trim() || `Python failed with code ${code}`))
            }

            try {
                resolve(JSON.parse(output.trim()))
            } catch (parseError) {
                reject(new Error(`Invalid Python response: ${parseError.message}. ${error.trim()}`))
            }
        })
    })
}

export async function createResearch(req, res) {
    console.log('CREATE RESEARCH CALLED')

    const topic = req.body?.topic?.trim()

    if (!topic) {
        return res.status(400).json({
            success: false,
            error: 'Topic required'
        })
    }

    try {
        console.log('RUNNING PIPELINE...')

        const result = await runPython(topic)

        console.log('PIPELINE COMPLETED')

        const research = await Research.create({
            topic,
            report: result.report || '',
            searchResults: result.search_results || [],
            scrapedContent: result.scraped_content || [],
            feedback: result.feedback || '',
            statuses: result.statuses || []
        })

        console.log('SAVED TO MONGODB:', research._id)

        res.json({
            success: true,
            researchId: research._id,
            ...result
        })

    } catch (error) {
        console.error('RESEARCH ERROR:', error.message)

        res.status(500).json({
            success: false,
            error: error.message
        })
    }
}