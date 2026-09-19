export default function ResearchInput({ topic, setTopic, onSubmit, isRunning }) {
    const examples = ['LLM agents 2025', 'CRISPR gene editing', 'Fusion energy progress']

    function handleSubmit(event) {
        event.preventDefault()
        onSubmit()
    }

    return (
        <section className="input-section">
            <div className="section-kicker">Start a new investigation <span>01</span></div>
            <form className="research-form" onSubmit={handleSubmit}>
                <label htmlFor="research-topic">Research topic</label>
                <div className="input-row">
                    <input id="research-topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Quantum computing breakthroughs in 2025" />
                    <button className="run-button" type="submit" disabled={isRunning || !topic.trim()}><span>⚡</span> {isRunning ? 'Pipeline running...' : 'Run research pipeline'}</button>
                </div>
            </form>
            <div className="examples"><span>Try an example</span>{examples.map((example) => <button type="button" key={example} onClick={() => setTopic(example)}>{example}</button>)}</div>
        </section>
    )
}