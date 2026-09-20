import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..'
)

dotenv.config({ path: path.join(projectRoot, '.env') })

import express from 'express'
import cors from 'cors'
import researchRoutes from './routes/researchRoutes.js'
import connectDB from './config/db.js'

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://researchmind-mnv005jgo-mohammad-fahim-s-projects.vercel.app',
        'https://researchmind-frontend.onrender.com',
    ]
}))

app.use(express.json())

// Routes
app.use('/api/research', researchRoutes)

async function startServer() {
    await connectDB()

    app.listen(port, () => {
        console.log(
            `ResearchMind Express API listening on http://localhost:${port}`
        )
    })
}

startServer().catch(error => {
    console.error('Server startup failed:', error.message)
    process.exit(1)
})