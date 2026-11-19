import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/extra.css';
import './styles/site.css';
import './styles/public.css';
import './theme';
import App from './App';

createRoot(document.getElementById('root')).render(<App />);
