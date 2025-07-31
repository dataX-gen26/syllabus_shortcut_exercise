import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/syllabus_shortcut_exercise/',
  build: {
    outDir: 'docs',
  },
})
