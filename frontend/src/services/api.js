const API_URL = import.meta.env.VITE_API_URL || (
    window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api/research'
        : 'https://researchmind-a0fe.onrender.com/api/research'
)

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

export async function chatWithResearch(researchId, query) {
    const response = await fetch(`${API_URL}/${researchId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    })

    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body.error || body.detail || 'The research chat could not be completed.')
    }

    return body
}

export async function getResearches() {
    const response = await fetch(API_URL)
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body.error || body.detail || 'The research list could not be loaded.')
    }
    return body
}

export async function compareResearch(researchId1, researchId2) {
    const response = await fetch(`${API_URL}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ researchId1, researchId2 }),
    })

    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body.error || body.detail || 'The research comparison could not be completed.')
    }
    return body
}
