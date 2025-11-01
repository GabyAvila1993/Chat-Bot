// src/components/ChatbotWidget.tsx
import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToAura } from '../api/chatbotService';
import './ChatBotWidget.css';

interface ChatMessage {
  text: string;
  sender: 'user' | 'aura';
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().length === 0 || isLoading) return;

    const userMessage: ChatMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const auraResponseText = await sendMessageToAura(input);
    setIsLoading(false);

    const auraMessage: ChatMessage = { text: auraResponseText, sender: 'aura' };
    setMessages(prev => [...prev, auraMessage]);
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <div className="chatbot-avatar" onClick={() => setIsOpen(true)}>
          <img src="src/assets/images/chat-icon.png" alt="Aura Assistant" />
        </div>
      )}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="header-content">
              <img src="src/assets/images/chat-icon.png" alt="Aura" className="header-avatar" />
              <div className='envoltura-title'>
                <h3 className='title'>Aura</h3>
                <h6 className='title'>Asistente Útil de Respuesta Automatizada</h6>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="close-btn"
              aria-label="Cerrar chat"
            >
              ×
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isLoading && <div className="message aura"><p>Escribiendo...</p></div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Habla con AURA..."
              disabled={isLoading}
              aria-label="Escribe tu mensaje"
            />
            <button type="submit" disabled={isLoading} aria-label="Enviar mensaje">
              <div className="send-icon"></div>
            </button>
          </form>
        </div>
      )
      }
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="chat-toggle-button"
          aria-label="Iniciar chat"
        >
          {/* <span>📨</span> */}
        </button>
      )}
    </div >
  );
};
