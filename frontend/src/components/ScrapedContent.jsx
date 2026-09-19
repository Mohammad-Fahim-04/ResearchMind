export default function ScrapedContent({ content }) {
    return <details className="result-panel"><summary><span><b>02</b> Scraped content</span><span className="summary-hint">Deep reading <i>⌄</i></span></summary><div className="panel-content"><p>{content}</p></div></details>
}