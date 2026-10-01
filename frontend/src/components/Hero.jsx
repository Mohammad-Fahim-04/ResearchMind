import CircuitLines from './CircuitLines'

export default function Hero() {
    return (
        <div className="hero">
            <CircuitLines variant="a" placement="hero" pulse />
            <header className="hero-copy">
                <div className="eyebrow"><span className="eyebrow-dot" /> Multi-Agent AI System</div>
                <h1>Research<span>Mind</span></h1>
                <p>Four specialized AI agents collaborate — searching, scraping, writing, and critiquing — to deliver a polished research report on any topic.</p>
                <div className="hero-meta"><span>01 / 04 agents online</span><span className="meta-line" /><span>Intelligence, orchestrated</span></div>
            </header>
            <figure className="hero-visual">
                <img
                    src="/assets/researchmind-ai-face.png"
                    alt="Cybernetic face emerging through orange glitch and circuit details"
                    width="1668"
                    height="943"
                    loading="eager"
                    fetchpriority="high"
                />
            </figure>
        </div>
    )
}