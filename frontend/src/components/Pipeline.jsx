import StepCard from './StepCard'

const steps = [
    ['01', 'Search Agent', 'Gathers recent web information'],
    ['02', 'Reader Agent', 'Scrapes & extracts deep content'],
    ['03', 'Writer Chain', 'Drafts the full research report'],
    ['04', 'Critic Chain', 'Reviews & scores the report'],
]

export default function Pipeline({ statuses, isRunning, completed }) {
    const statusKeys = ['search', 'reader', 'writer', 'critic']
    const statusText = completed ? 'Pipeline complete' : isRunning ? 'Pipeline running' : Object.values(statuses).includes('ERROR') ? 'Pipeline stopped' : 'Ready when you are'
    return (
        <section className="pipeline-section">
            <div className="section-heading"><div><div className="section-kicker">The orchestration <span>02</span></div><h2>Four agents.<br /><em>One clear signal.</em></h2></div><span className="pipeline-status">{statusText}</span></div>
            <div className="pipeline-grid">{steps.map(([number, title, description], index) => <StepCard key={number} number={number} title={title} description={description} status={statuses[statusKeys[index]].toLowerCase()} />)}</div>
        </section>
    )
}