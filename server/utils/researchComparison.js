import mongoose from 'mongoose'
import Research from '../models/Research.js'

export async function loadResearchComparison(researchId1, researchId2) {
    if (!mongoose.isValidObjectId(researchId1) || !mongoose.isValidObjectId(researchId2)) {
        throw new Error('Both research IDs must be valid MongoDB IDs.')
    }

    const [research1, research2] = await Promise.all([
        Research.findById(researchId1).select('topic report').lean(),
        Research.findById(researchId2).select('topic report').lean(),
    ])

    if (!research1 || !research2) {
        const missing = [
            !research1 && `research 1 (${researchId1})`,
            !research2 && `research 2 (${researchId2})`,
        ].filter(Boolean).join(' and ')
        throw new Error(`Research document not found: ${missing}.`)
    }

    return {
        research1: {
            topic: research1.topic,
            report: research1.report,
        },
        research2: {
            topic: research2.topic,
            report: research2.report,
        },
    }
}