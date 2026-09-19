import { useEffect, useState } from 'react'
import Hero from './components/Hero'
import ResearchInput from './components/ResearchInput'
import Pipeline from './components/Pipeline'
import Results from './components/Results'
import { runResearch } from './services/api'

export default function App() {
    const [topic, setTopic] = useState('')
    const [statuses, setStatuses] = useState({ search: 'WAITING', reader: 'WAITING', writer: 'WAITING', critic: 'WAITING' })
    const [isRunning, setIsRunning] = useState(false)
    const [results, setResults] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('researchMindResult') || 'null')
            if (saved?.results) {
                setTopic(saved.topic || '')
                setResults(saved.results)
                setStatuses(saved.statuses || { search: 'DONE', reader: 'DONE', writer: 'DONE', critic: 'DONE' })
            }
        } catch {
            localStorage.removeItem('researchMindResult')
        }
    }, [])

    async function handleRun() {
        if (!topic.trim() || isRunning) return
        setIsRunning(true)
        setResults(null)
        setError('')
        setStatuses({ search: 'RUNNING', reader: 'WAITING', writer: 'WAITING', critic: 'WAITING' })
        localStorage.removeItem('researchMindResult')
        try {
            const data = await runResearch(topic.trim())
            setResults(data)
            setStatuses(data.statuses || { search: 'DONE', reader: 'DONE', writer: 'DONE', critic: 'DONE' })
            localStorage.setItem('researchMindResult', JSON.stringify({ topic: topic.trim(), results: data, statuses: data.statuses }))
        } catch (requestError) {
            setError(`Research pipeline failed. ${requestError.message || 'Please try again.'}`)
            setStatuses({ search: 'ERROR', reader: 'WAITING', writer: 'WAITING', critic: 'WAITING' })
        } finally {
            setIsRunning(false)
        }
    }

    return <main className="app-shell"><div className="topbar"><div className="brand-mark"><span>R</span> ResearchMind</div><div className="system-state"><i /> System ready <span>v1.0</span></div></div><Hero /><ResearchInput topic={topic} setTopic={setTopic} onSubmit={handleRun} isRunning={isRunning} /><Pipeline statuses={statuses} isRunning={isRunning} completed={Boolean(results)} />{error && <div className="error-message">{error}</div>}<Results results={results} /><footer><span>ResearchMind</span><span>Built for better questions.</span></footer></main>
}