---
"react-native-bundle-discovery-rozenite-plugin": patch
---

Don't crash Metro when port 8071 is already in use. With two Metro servers running at once (for example one per git worktree), the second one used to exit on start with `EADDRINUSE`. It now prints a warning and keeps running without its own panel server.
