import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  message: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Chat', chatSchema);