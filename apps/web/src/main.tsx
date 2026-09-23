import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router'
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import App from './App'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={ruRU}
      theme={{
        components: {
          Layout: {
            headerBg: '#e6f4ff',
            headerColor: '#1f1f1f',
            headerPadding: '0 24px',
          },
        },
      }}
    >
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
          {import.meta.env.DEV && (
            <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
)
