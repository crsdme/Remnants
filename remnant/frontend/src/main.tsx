import { createRoot } from 'react-dom/client';
import './locales/i18n.ts';
import App from './app/App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, ThemeProvider } from '@/utils/contexts';
import { App as AntApp } from 'antd';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AntApp
      notification={{
        placement: 'topRight'
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </AntApp>
  </QueryClientProvider>
);
