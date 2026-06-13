import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import logseqDevPlugin from 'vite-plugin-logseq'

export default defineConfig({
  plugins: [logseqDevPlugin()],
  resolve: {
    alias: [
      {
        find: /^undici$/,
        replacement: fileURLToPath(
          new URL('./src/undici-stub.ts', import.meta.url),
        ),
      },
    ],
  },
})
