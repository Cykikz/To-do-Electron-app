# TodoFloat
A floating always-on-top To-Do widget for Windows, built with Electron.

## Features
- Draggable floating widget — lives anywhere on screen
- Always-on-top toggle (pin button)
- Startup with Windows — toggle from system tray
- Priority levels: High / Med / Low
- Custom labels / tags
- Calendar + clock due date picker (no manual typing)
- Notes per task
- Subtasks with live progress bar
- Overdue highlighting
- Auto-saves to disk (electron-store)
- Dark mode only

---

## Quick Start

### Requirements
- Node.js v18 or newer  →  https://nodejs.org/
- npm comes with Node

### 1. Install
```
cd todo-sidebar
npm install
```

### 2. Run
```
npm start
```

---

## Build a portable .exe (no installer needed)
```
npm run build
```
Output: `dist/TodoFloat.exe`

---

## Keyboard shortcuts
| Shortcut     | Action            |
|--------------|-------------------|
| Ctrl+N       | New task          |
| Ctrl+Enter   | Save task         |
| Escape       | Close modal       |

## Tray icon (right-click)
- Show / Hide window
- Toggle Always on Top
- Toggle Start with Windows
- Quit

---

## Data
Tasks saved to:
`C:\Users\YOU\AppData\Roaming\todo-sidebar\config.json`
No cloud. No account. Fully local.
