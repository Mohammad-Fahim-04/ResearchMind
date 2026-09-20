import { useEffect, useState } from 'react'
import { compareResearch, getResearches } from '../services/api'

const comparisonSections = [
    ['similarities', 'Similarities'],
    ['differences', 'Differences'],
    ['key_findings', 'Key Findings'],
    ['conflicting_information', 'Conflicting Information'],
]

export default function ResearchComparison() {
    const [researches, setResearches] = useState([])
    const [researchId1, setResearchId1] = useState('')
    const [researchId2, setResearchId2] = useState('')
    const [comparison, setComparison] = useState(null)
    const [isLoadingResearches, setIsLoadingResearches] = useState(true)
    const [isComparing, setIsComparing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadResearches() {
            try {
                const data = await getResearches()
                setResearches(data.researches || [])
            } catch (requestError) {
                setError(requestError.message || 'The research list could not be loaded.')
            } finally {
                setIsLoadingResearches(false)
            }
        }

        loadResearches()
    }, [])

    async function handleCompare() {
        if (!researchId1 || !researchId2 || researchId1 === researchId2 || isComparing) return

        setIsComparing(true)
        setComparison(null)
        setError('')
        try {
            const data = await compareResearch(researchId1, researchId2)
            setComparison(data.comparison)
        } catch (requestError) {
            setError(requestError.message || 'The research comparison could not be completed.')
        } finally {
            setIsComparing(false)
        }
    }

    const renderOptions = (excludedId) => <>
        <option value="">Select a research report</option>
        {researches.map(research => <option key={research._id} value={research._id} disabled={research._id === excludedId}>{research.topic}</option>)}
    </>

    return <section className="comparison-section">
        <div className="section-kicker">Research comparison <span>07</span></div>
        <div className="comparison-card">
            <div className="comparison-heading">
                <div>
                    <h2>Compare Research</h2>
                    <p>Place two reports side by side to find patterns, distinctions, and tensions.</p>
                </div>
                <span className="comparison-count">{researches.length} reports available</span>
            </div>
            <div className="comparison-controls">
                <label>Research 1<select value={researchId1} onChange={event => setResearchId1(event.target.value)} disabled={isLoadingResearches || isComparing}>{renderOptions(researchId2)}</select></label>
                <label>Research 2<select value={researchId2} onChange={event => setResearchId2(event.target.value)} disabled={isLoadingResearches || isComparing}>{renderOptions(researchId1)}</select></label>
                <button type="button" className="compare-button" onClick={handleCompare} disabled={!researchId1 || !researchId2 || researchId1 === researchId2 || isComparing || isLoadingResearches}>{isComparing ? 'Comparing...' : 'Compare Research'} <span>→</span></button>
            </div>
            {isLoadingResearches && <p className="comparison-status">Loading saved research...</p>}
            {researches.length < 2 && !isLoadingResearches && !error && <p className="comparison-status">Create at least two research reports to compare them.</p>}
            {error && <div className="comparison-error" role="alert">{error}</div>}
            {comparison && <div className="comparison-results">{comparisonSections.map(([key, title]) => <article className="comparison-result" key={key}><div className="section-kicker">{title}</div><p>{comparison[key]}</p></article>)}</div>}
        </div>
    </section>
}