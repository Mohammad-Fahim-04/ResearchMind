import SearchResults from './SearchResults'
import ScrapedContent from './ScrapedContent'
import ResearchReport from './ResearchReport'
import CriticFeedback from './CriticFeedback'

export default function Results({ results }) {
    if (!results) return null
    return <section className="results-section"><div className="section-kicker">Your research <span>05</span></div><div className="result-stack"><SearchResults content={results.search_results} /><ScrapedContent content={results.scraped_content} /><ResearchReport report={results.report} /><CriticFeedback feedback={results.feedback} /></div></section>
}