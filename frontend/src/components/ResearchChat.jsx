import { useEffect, useRef, useState } from 'react'
import { chatWithResearch } from '../services/api'

export default function ResearchChat({ researchId }) {
    const [messages, setMessages] = useState([])
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    async function handleSubmit(event) {
        event.preventDefault()
        const trimmedQuery = query.trim()
        if (!trimmedQuery || isLoading || !researchId) return

        setMessages(current => [...current, { role: 'user', content: trimmedQuery }])
        setQuery('')
        setError('')
        setIsLoading(true)

        try {
            const response = await chatWithResearch(researchId, trimmedQuery)
            setMessages(current => [...current, {
                role: 'assistant',
                content: response.answer || 'I could not find an answer in this research.',
                sources: response.sources,
            }])
        } catch (requestError) {
            setError(requestError.message || 'The research chat could not be completed.')
        } finally {
            setIsLoading(false)
        }
    }

    return <section className="research-chat">
        <div className="chat-heading">
            <div>
                <div className="section-kicker">Research dialogue <span>06</span></div>
                <h2>Chat with Research</h2>
                <p>Ask questions about this research</p>
            </div>
        </div>
        <div className="chat-messages" aria-live="polite">
            {messages.length === 0 && !isLoading && <div className="chat-empty">Ask a question to explore the report.</div>}
            {messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                <div className="chat-bubble">{message.content}
                    {message.sources?.length > 0 && <div className="chat-sources"><span>Sources</span>{message.sources.map(source => <a href={source.url} target="_blank" rel="noopener noreferrer" key={source.url}>{source.title || source.url}</a>)}</div>}
                </div>
            </div>)}
            {isLoading && <div className="chat-message assistant"><div className="chat-bubble chat-loading">ResearchMind is thinking...</div></div>}
            <div ref={messagesEndRef} />
        </div>
        {error && <div className="chat-error" role="alert">{error}</div>}
        <form className="chat-form" onSubmit={handleSubmit}>
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ask something about this research..." disabled={isLoading || !researchId} aria-label="Ask something about this research" />
            <button type="submit" className="chat-send" disabled={!query.trim() || isLoading || !researchId}>Send <span>→</span></button>
        </form>
    </section>
}