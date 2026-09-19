export default function CriticFeedback({ feedback }) {
    const score = feedback.match(/Score:\s*(\d+\/\d+)/i)?.[1] || '—'

    return <article className="feedback-card"><div className="feedback-header"><div><div className="section-kicker">Quality control <span>04</span></div><h2>Critic feedback</h2></div><div className="score"><strong>{score.split('/')[0]}</strong><span>/10</span></div></div></article>
}