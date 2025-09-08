import { Router } from 'express'
import { TypebotService } from '../services/typebot.service'

const router = Router()
const typebotService = new TypebotService()

// Create new conversation
router.post('/conversations', async (req, res) => {
  const { userId, serviceType } = req.body
  const conversation = await typebotService.createConversation(userId, serviceType)
  res.json(conversation)
})

// Handle WhatsApp webhook via Typebot
router.post('/webhooks/typebot', async (req, res) => {
  const { sessionId, message } = req.body
  const response = await typebotService.processMessage(sessionId, message)
  res.json(response)
})

export default router
