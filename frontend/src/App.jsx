import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';
import useAuth from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AuthProvider({ children }) {
  useAuth();
  return children;
}

import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <AppRouter />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 1000,
              style: {
                background: '#ffffff',
                color: '#1a1a2e',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
