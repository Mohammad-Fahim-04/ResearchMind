import ReactMarkdown from 'react-markdown'

export default function ResearchReport({ report }) {
    function downloadReport() {
        const blob = new Blob([report], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const safeTopic = report.split('\n')[0].replace(/^#\s*/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'research-report'
        link.download = `${safeTopic}.md`
        link.click()
        URL.revokeObjectURL(url)
    }

    return <article className="report-card"><div className="report-heading"><div><div className="section-kicker">The finished thought <span>03</span></div><h2>Final research report</h2></div><button type="button" className="download-button" onClick={downloadReport}>↓ Download report</button></div><div className="markdown-content"><ReactMarkdown components={{ a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}>{report}</ReactMarkdown></div></article>
}