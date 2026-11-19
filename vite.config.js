import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Version du site : l'heure de construction. Ajoutée à l'adresse des scripts de public/legacy
   (src/legacy/load.js) pour qu'une nouvelle mise en ligne ne serve pas d'anciens fichiers en cache. */
export default defineConfig({
  plugins: [react()],
  define: { __BIBL_VERSION__: JSON.stringify(Date.now().toString(36)) },
});
