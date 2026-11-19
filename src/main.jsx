import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/extra.css';
import './styles/site.css';
import './styles/public.css';
import './theme';
import { recommander } from './api/client';

/* Les scripts historiques (public/legacy) n'importent pas de modules : on leur expose l'appel au back. */
window.BiblAPI = { recommander };
import App from './App';

createRoot(document.getElementById('root')).render(<App />);
