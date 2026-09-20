import SearchResults from './SearchResults'
import ScrapedContent from './ScrapedContent'
import ResearchReport from './ResearchReport'
import CriticFeedback from './CriticFeedback'
import ResearchChat from './ResearchChat'

export default function Results({ results }) {
    if (!results) return null
    return <section className="results-section"><div className="section-kicker">Your research <span>06</span></div><div className="result-stack"><SearchResults content={results.search_results} /><ScrapedContent content={results.scraped_content} /><ResearchReport report={results.report} /><CriticFeedback feedback={results.feedback} /><ResearchChat researchId={results.researchId} /></div></section>
}