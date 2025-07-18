import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { createRoot } from 'react-dom/client'

import { AppSettingsProvider, AuthProvider, ThemeProvider } from '@/contexts'

import App from './app/App'
import '@/locales/i18n.ts'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AppSettingsProvider>
          <App />
        </AppSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>,
)
