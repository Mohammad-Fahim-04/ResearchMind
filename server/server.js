import express from 'express'
import cors from 'cors'
import researchRoutes from './routes/researchRoutes.js'

const app = express()
const port = process.env.PORT || 5000

app.use(cors({ origin: [
    'http://localhost:5173',
    'https://researchmind-mnv005jgo-mohammad-fahim-s-projects.vercel.app',
] }))
app.use(express.json())
app.use('/api/research', researchRoutes)

app.listen(port, () => {
    console.log(`ResearchMind Express API listening on http://localhost:${port}`)
})