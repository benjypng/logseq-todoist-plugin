import { defineConfig } from "vite";
import logseqDevPlugin from "vite-plugin-logseq";

export default defineConfig({
  plugins: [logseqDevPlugin()],
});
