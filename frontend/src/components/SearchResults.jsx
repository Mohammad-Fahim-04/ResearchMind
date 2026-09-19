export default function SearchResults({ content }) {
    const results = Array.isArray(content) ? content : []
    return <details className="result-panel"><summary><span><b>01</b> Search results</span><span className="summary-hint">Web intelligence <i>⌄</i></span></summary><div className="panel-content source-list">{results.map((source) => <article key={source.url}><h3>{source.title}</h3><p>{source.content}</p><a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}</a></article>)}</div></details>
}