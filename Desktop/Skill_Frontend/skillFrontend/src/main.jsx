import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ChatProvider } from './context/ChatContext'; //
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Wrap App here so chat works everywhere */}
    <ChatProvider> 
      <App />
    </ChatProvider>
  </StrictMode>,
)