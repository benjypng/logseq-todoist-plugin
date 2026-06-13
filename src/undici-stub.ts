// Empty stub aliased in place of `undici` (see vite.config.ts).
// The plugin always supplies a customFetch (logseq-request proxy), so the
// @doist/todoist-sdk code path that dynamically imports undici never runs in
// the renderer. Aliasing to this stub keeps undici out of the bundle.
export {}
