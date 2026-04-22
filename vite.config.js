import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'searching-visualizer' with your EXACT GitHub repository name
export default defineConfig({
  plugins: [react()],
  base: 'https://github.com/sivaji991/sortingVisualizer', 
})