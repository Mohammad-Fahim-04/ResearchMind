import { Router } from 'express'
import { chatWithResearch, compareResearches, createResearch, getResearches } from '../controllers/researchController.js'

const router = Router()

router.post('/', createResearch)
router.get('/', getResearches)
router.post('/compare', compareResearches)
router.post('/:researchId/chat', chatWithResearch)

export default router