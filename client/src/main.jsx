import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux';
import { store } from './store/store';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient=new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <Provider store={store}>
        <QueryClientProvider client={queryClient}>
             <App />
             <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
     
    </Provider>

  </>,
)
