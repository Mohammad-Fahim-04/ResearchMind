import { useEffect, useState } from 'react'

import Hero from './components/Hero'
import ResearchInput from './components/ResearchInput'
import Pipeline from './components/Pipeline'
import Results from './components/Results'
import ResearchComparison from './components/ResearchComparison'
import CircuitLines from './components/CircuitLines'
import { runResearch } from './services/api'

export default function App() {
    const [topic, setTopic] = useState('')
    const [statuses, setStatuses] = useState({
        search: 'WAITING',
        reader: 'WAITING',
        writer: 'WAITING',
        critic: 'WAITING'
    })
    const [isRunning, setIsRunning] = useState(false)
    const [results, setResults] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        try {
            const saved = JSON.parse(
                localStorage.getItem('researchMindResult') || 'null'
            )

            if (saved?.results) {
                setTopic(saved.topic || '')
                setResults(saved.results)
                setStatuses(
                    saved.statuses || {
                        search: 'DONE',
                        reader: 'DONE',
                        writer: 'DONE',
                        critic: 'DONE'
                    }
                )
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

        setStatuses({
            search: 'RUNNING',
            reader: 'WAITING',
            writer: 'WAITING',
            critic: 'WAITING'
        })

        localStorage.removeItem('researchMindResult')

        try {
            const data = await runResearch(topic.trim())

            setResults(data)

            setStatuses(
                data.statuses || {
                    search: 'DONE',
                    reader: 'DONE',
                    writer: 'DONE',
                    critic: 'DONE'
                }
            )

            localStorage.setItem(
                'researchMindResult',
                JSON.stringify({
                    topic: topic.trim(),
                    results: data,
                    statuses: data.statuses
                })
            )
        } catch (requestError) {
            setError(
                `Research pipeline failed. ${requestError.message || 'Please try again.'
                }`
            )

            setStatuses({
                search: 'ERROR',
                reader: 'WAITING',
                writer: 'WAITING',
                critic: 'WAITING'
            })
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <main className="app-shell">

            {/* NAVBAR */}
            <nav className="topbar">
                <a href="#research" className="brand-mark">
                    <span>R</span>
                    ResearchMind
                </a>

                <div className="nav-links">
                    <a href="#research">Research</a>
                    <a href="#compare">Compare Research</a>
                    <a href="#research-chat">Chat with Research</a>
                    <a href="#pipeline">How It Works</a>
                </div>

                <div className="system-state">
                    <i />
                    System ready
                    <span>v1.0</span>
                </div>
            </nav>

            {/* HERO */}
            <section id="research">
                <Hero />

                <ResearchInput
                    topic={topic}
                    setTopic={setTopic}
                    onSubmit={handleRun}
                    isRunning={isRunning}
                />
            </section>

            {/* PIPELINE */}
            <section id="pipeline">
                <Pipeline
                    statuses={statuses}
                    isRunning={isRunning}
                    completed={Boolean(results)}
                />
            </section>

            {error && <div className="error-message">{error}</div>}

            {/* RESULTS / ARCHIVE */}
            <section id="archive">
                <Results results={results} />
            </section>

            {/* COMPARISON */}
            <section id="compare">
                <ResearchComparison />
            </section>

            <footer>
                <CircuitLines variant="c" placement="footer" />
                <span>ResearchMind</span>
                <span>Built for better questions.</span>
            </footer>

        </main>
    )
}