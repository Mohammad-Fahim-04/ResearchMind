import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Research from '../models/Research.js'
import { compareResearches as runResearchComparison } from '../services/researchComparisonService.js'

const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../..'
)

export async function getResearches(req, res) {
    try {
        const researches = await Research.find()
            .select('_id topic createdAt')
            .sort({ createdAt: -1 })
            .lean()

        return res.json({
            success: true,
            researches,
        })
    } catch (error) {
        console.error('GET RESEARCHES ERROR:', error.message)
        return res.status(500).json({
            success: false,
            error: 'Research list is temporarily unavailable.',
        })
    }
}

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

function runPythonChat(query) {
    const python = process.platform === 'win32'
        ? path.join(root, '.venv', 'Scripts', 'python.exe')
        : path.join(root, '.venv', 'bin', 'python')

    return new Promise((resolve, reject) => {
        const p = spawn(python, ['-u', '-c', `
import json, sys
from utils.rag import answer_with_rag
print(json.dumps({"answer": answer_with_rag(sys.argv[1])}))
        `, query], { cwd: root, env: process.env, windowsHide: true })

        let output = ''
        let error = ''
        p.stdout.on('data', chunk => { output += chunk.toString() })
        p.stderr.on('data', chunk => { error += chunk.toString() })
        p.on('error', startError => reject(new Error(`Could not start Python: ${startError.message}`)))
        p.on('close', code => {
            if (code !== 0) {
                reject(new Error(error.trim() || output.trim() || `Python exited with code ${code}`))
                return
            }
            try {
                resolve(JSON.parse(output.trim()))
            } catch (parseError) {
                reject(new Error(`Invalid chat response: ${parseError.message}`))
            }
        })
    })
}

export async function chatWithResearch(req, res) {
    const query = req.body?.query?.trim()
    if (!query) {
        return res.status(400).json({ success: false, error: 'A question is required.' })
    }

    try {
        const research = await Research.findById(req.params.researchId)
        if (!research) {
            return res.status(404).json({ success: false, error: 'Research not found.' })
        }

        const result = await runPythonChat(query)
        res.json({
            success: true,
            answer: result.answer,
            sources: research.searchResults,
        })
    } catch (error) {
        console.error('RESEARCH CHAT ERROR:', error.message)
        res.status(500).json({ success: false, error: 'Research chat is temporarily unavailable.' })
    }
}

export async function compareResearches(req, res) {
    const { researchId1, researchId2 } = req.body || {}

    if (!researchId1 || !researchId2) {
        return res.status(400).json({
            success: false,
            error: 'Both researchId1 and researchId2 are required.',
        })
    }

    try {
        const comparison = await runResearchComparison(researchId1, researchId2)
        return res.json({
            success: true,
            comparison,
        })
    } catch (error) {
        console.error('RESEARCH COMPARISON ERROR:', error.message)

        if (error.message.includes('valid MongoDB IDs')) {
            return res.status(400).json({ success: false, error: error.message })
        }

        if (error.message.includes('Research document not found')) {
            return res.status(404).json({ success: false, error: error.message })
        }

        return res.status(500).json({
            success: false,
            error: 'Research comparison is temporarily unavailable.',
        })
    }
}