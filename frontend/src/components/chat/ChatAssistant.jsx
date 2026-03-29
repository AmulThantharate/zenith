import React, { useState, useRef, useEffect } from 'react';
import aiApi from '../../api/ai';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiApi.chat(userMessage.content);
      const aiMessage = { role: 'ai', content: response.data || 'Error getting response' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      {isOpen && (
        <div style={{
          width: '350px', height: '450px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          overflow: 'hidden', marginBottom: '1rem',
          position: 'absolute', bottom: '100%', right: '0'
        }}>
          <div style={{
            padding: '1rem', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 'bold',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span>AI Assistant</span>
            <button onClick={toggleChat} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', padding: '0' }}>&times;</button>
          </div>
          
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', marginTop: '2rem', fontSize: '0.9rem' }}>
                How can I help you manage your tasks today?
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--bg)',
                color: msg.role === 'user' ? '#fff' : 'var(--text)',
                padding: '0.5rem 0.75rem', borderRadius: '8px', maxWidth: '85%',
                border: msg.role !== 'user' ? '1px solid var(--border)' : 'none',
                wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontSize: '0.9rem'
              }}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-3)', fontSize: '0.8rem', padding: '0.5rem' }}>
                Typing...
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <form onSubmit={sendMessage} style={{ display: 'flex', padding: '0.75rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your tasks..."
              style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', marginRight: '0.5rem', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
            />
            <button type="submit" disabled={isLoading} style={{
              padding: '0.5rem 1rem', borderRadius: '6px', border: 'none',
              backgroundColor: 'var(--primary)', color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer'
            }}>
              Send
            </button>
          </form>
        </div>
      )}
      {!isOpen && (
        <button onClick={toggleChat} style={{
          width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary)',
          color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', fontSize: '1.5rem',
          position: 'absolute', bottom: '0', right: '0'
        }}>
          💬
        </button>
      )}
    </div>
  );
}