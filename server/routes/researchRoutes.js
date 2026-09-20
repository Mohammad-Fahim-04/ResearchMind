import { Router } from 'express'
import { chatWithResearch, createResearch } from '../controllers/researchController.js'

const router = Router()

router.post('/', createResearch)
router.post('/:researchId/chat', chatWithResearch)

export default router