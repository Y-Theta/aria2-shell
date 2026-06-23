import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts', 'src/cli.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node20',
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  minify: false,
})