import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { TooltipProvider } from '~/components/ui/tooltip'
import { I18nextProvider } from 'react-i18next'
import './index.css'
import App from './App.jsx'

import { Provider } from 'react-redux'
import { store, persistor } from '~/redux/store'
import { PersistGate } from 'redux-persist/integration/react'

import i18n from '~/i18n'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <I18nextProvider i18n={i18n}>
          <BrowserRouter>
            <TooltipProvider>
              <ToastContainer position="top-right" />
              <App />
            </TooltipProvider>
          </BrowserRouter>
        </I18nextProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
)