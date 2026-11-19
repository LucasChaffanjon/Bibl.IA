import React from 'react';

/* Bouton clair / sombre. Le comportement est dans src/theme.js (attribut data-theme-btn). */
export default function ThemeToggle({ className = '' }) {
  return (
    <button type="button" className={`icon-btn theme-btn ${className}`} data-theme-btn>
      <svg className="i i-sun" aria-hidden="true"><use href="#i-sun" /></svg>
      <svg className="i i-moon" aria-hidden="true"><use href="#i-moon" /></svg>
    </button>
  );
}

/* Le même bouton, en HTML, pour l'en-tête du site connecté (écrit en chaîne). */
export const THEME_BTN_HTML = '<button type="button" class="icon-btn theme-btn" id="themeBtn" data-theme-btn><svg class="i i-sun" aria-hidden="true"><use href="#i-sun"></use></svg><svg class="i i-moon" aria-hidden="true"><use href="#i-moon"></use></svg></button>';
