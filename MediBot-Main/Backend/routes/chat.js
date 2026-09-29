import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Chat from '../models/Chat.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


const HEALTH_PROMPT = `You are MediConnect Health Bot, an AI assistant focused on providing accurate health tips, dietary guidance, and emergency response advice. Answer the following query in a clear, concise, and professional manner, using markdown for formatting (e.g., **bold**, - lists). Focus on health-related topics like general wellness, nutrition, or emergency procedures (e.g., heart attack response). If the query is unrelated to health, politely decline and redirect to health topics. Do not provide appointment scheduling or unrelated services. Query: `;

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    
    const result = await model.generateContent(HEALTH_PROMPT + message);
    const botResponse = result.response.text();

   
    const chat = new Chat({
      message,
      response: botResponse,
    });
    await chat.save();

    res.json({ response: botResponse });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ timestamp: 1 });
    res.json(chats);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;