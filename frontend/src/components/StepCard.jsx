const statusLabels = { waiting: 'Waiting', running: 'Running', done: 'Done', error: 'Error' }

export default function StepCard({ number, title, description, status }) {
    return (
        <article className={`step-card ${status}`}>
            <div className="step-top"><span className="step-number">{number}</span><span className="step-status">{status === 'done' && '✓ '}{statusLabels[status]}</span></div>
            <div className="step-icon">{status === 'done' ? '✓' : status === 'error' ? '!' : status === 'running' ? '◌' : number}</div>
            <h3>{title}</h3>
            <p>{description}</p>
        </article>
    )
}