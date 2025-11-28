'use client'

import { useState } from 'react'

export default function NewsletterForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setStatus('loading')
    
    try {
      const response = await fetch('https://slorecore.app.n8n.cloud/webhook/e0e4c850-4f85-4792-9f91-53abc7721e32', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })
      
      if (response.ok) {
        setStatus('success')
        setTimeout(() => onClose(), 2000) // Close after 2 seconds
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '8px',
        maxWidth: '400px',
        width: '100%'
      }}>
        <button onClick={onClose} style={{ float: 'right' }}>✕</button>
        
        <h2>Subscribe to our newsletter</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button type="submit" disabled={status === 'loading'} style={{ width: '100%', padding: '10px' }}>
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
          
          {status === 'success' && <p>Thanks for subscribing!</p>}
          {status === 'error' && <p>Something went wrong. Please try again.</p>}
        </form>
      </div>
    </div>
  )
}