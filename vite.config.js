import { defineConfig } from 'vite'

export default defineConfig({
  base: '/portafolio-rpg/',
  optimizeDeps: {
    include: ['phaser']
  }
})