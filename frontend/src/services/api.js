const API_URL = 'https://researchmind-a0fe.onrender.com/api/research'

export async function runResearch(topic) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
    })

    if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || body.detail || 'The research request could not be completed.')
    }

    return response.json()
}
