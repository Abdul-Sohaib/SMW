import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // 🔥 IMPORTANT: makes assets load correctly on Netlify
  plugins: [react()],
   publicDir: 'public', 
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
