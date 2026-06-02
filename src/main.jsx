import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { DialogProvider } from '@/components/Dialog'

ReactDOM.createRoot(document.getElementById('root')).render(
  <DialogProvider>
    <App />
  </DialogProvider>
)
