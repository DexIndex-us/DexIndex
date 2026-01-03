import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Ensure this is here if using React

export default defineConfig({
  plugins: [react()],
  // Change base to your repo name so links don't break
  base: '/DexIndex-us/DexIndex', 
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        notFound: './404.html'
      }
    }
  }
});
