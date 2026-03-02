import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/Routes.jsx'
import { store } from './Pages/redux/store.jsx'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '20115312545-abj0h2rdkgjb37rpgch4befmv2hqnj1b.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
