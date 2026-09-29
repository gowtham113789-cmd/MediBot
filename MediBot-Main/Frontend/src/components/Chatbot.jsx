import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPaperPlane } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import bot from './bot.png';

const parseMarkdown = (text) => {
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  text = text.replace(/^- (.*?)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
  text = text.replace(/\n/g, '<br />');
  return text;
};

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(true); // Open by default
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    const timer = setTimeout(() => setIsInitialLoad(false), 5000);
    return () => clearTimeout(timer);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { text: input, sender: 'user', id: Date.now() };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const res = await axios.post(`https://mediconnect-backend-production.up.railway.app/api/chat`, { message: input });
      const formattedResponse = parseMarkdown(res.data.response);
      setMessages((prev) => [...prev, { text: formattedResponse, sender: 'bot', id: Date.now() + 1 }]);
    } catch (error) {
      console.error('Send message error:', error);
      setMessages((prev) => [...prev, { text: 'Error: Could not get response', sender: 'bot', id: Date.now() + 1 }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-transparent">
      <AnimatePresence>
        {isOpen && (
          
          <motion.div
            key="chat-window"
            className="w-[550px] h-[650px] bg-[#f0fdfd] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-teal-200"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div className="p-4 bg-slate-800 text-white rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <img src={bot} alt="Bot" className="w-5 h-5 rounded-full" />
                  MediConnect AI
                </h3>
              </div>
              <p className="text-sm mt-1 opacity-80">Your health, diet & emergency buddy</p>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`mb-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    
                    <span
                      className={`inline-block p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-[#d2f0ec] text-gray-900'
                          : 'bg-white text-gray-800 shadow-md border border-teal-100'
                      } max-w-[80%] text-sm`}
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                  </motion.div>
                ))}
                {isThinking && (
                  <motion.div
                    key="thinking"
                    className="text-left mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className="inline-flex items-center space-x-2 p-3 bg-white rounded-2xl shadow border border-teal-100">
                      <img src={bot} alt="Bot" className="w-5 h-5 text-teal-500 animate-pulse rounded-full" />
                      <span className="flex space-x-1">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <motion.span
                            key={i}
                            className="w-2 h-2 bg-teal-500 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay }}
                          />
                        ))}
                      </span>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-[#e9fbfa] border-t border-teal-200">
              <div className="flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask anything about health..."
                  className="flex-1 p-3 border border-teal-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white text-sm"
                />
                <motion.button
                  onClick={sendMessage}
                  className="bg-gradient-to-r from-[#30e3ca] to-[#2bc4ad] text-white p-3 rounded-r-lg hover:brightness-110 transition cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPaperPlane />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
