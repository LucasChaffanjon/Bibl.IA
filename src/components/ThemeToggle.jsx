import React from 'react';

/* Bouton clair / sombre : une seule icône (lune en clair, soleil en sombre), que src/theme.js
   remplace et fait tourner au changement de thème. Le comportement est dans src/theme.js (data-theme-btn). */
export default function ThemeToggle({ className = '' }) {
  return (
    <button type="button" className={`icon-btn theme-btn ${className}`} data-theme-btn>
      <svg className="i theme-ico" aria-hidden="true"><use href="#i-moon" /></svg>
    </button>
  );
}
