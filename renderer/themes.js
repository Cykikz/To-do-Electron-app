// ── TodoFloat Theme Presets ──────────────────────────────────────────────────
// Add or remove themes freely. Each theme overrides CSS variables on <html>.
// Required keys per theme: label, preview (3 hex colors), vars (CSS var map)
// To add a theme: copy any block, give it a unique key, tweak the values.

const THEMES = {

    // ── Default — deep purple dark ──────────────────────────────────────────
    default: {
        label: 'Default',
        preview: ['#0f0f12', '#7c6af7', '#1e1e27'],
        vars: {
            '--bg': '#0f0f12',
            '--bg2': '#17171d',
            '--bg3': '#1e1e27',
            '--surface': '#1a1a22',
            '--surface2': '#222230',
            '--border': '#2e2e3e',
            '--accent': '#7c6af7',
            '--accent2': '#9d8fff',
            '--accent-glow': 'rgba(124,106,247,.25)',
            '--text': '#e8e8f0',
            '--text2': '#9090a8',
            '--text3': '#5a5a72',
            '--red': '#ff5e6c',
            '--yellow': '#f5c842',
            '--green': '#4ecb71',
            '--font': "'DM Sans', sans-serif",
            '--radius': '14px',
            '--radius-sm': '8px',
            '--shadow': '0 8px 40px rgba(0,0,0,.6)',
        }
    },

    // ── Coder — true black, matrix green, monospace feel ───────────────────
    coder: {
        label: 'Coder',
        preview: ['#080808', '#00e676', '#111111'],
        vars: {
            '--bg': '#080808',
            '--bg2': '#0e0e0e',
            '--bg3': '#161616',
            '--surface': '#111111',
            '--surface2': '#1a1a1a',
            '--border': '#242424',
            '--accent': '#00e676',
            '--accent2': '#69f0ae',
            '--accent-glow': 'rgba(0,230,118,.18)',
            '--text': '#c8ffc8',
            '--text2': '#5a8a5a',
            '--text3': '#2e4a2e',
            '--red': '#ff1744',
            '--yellow': '#ffea00',
            '--green': '#00e676',
            '--font': "'DM Mono', monospace",
            '--radius': '4px',
            '--radius-sm': '2px',
            '--shadow': '0 8px 32px rgba(0,0,0,.8)',
        }
    },

    // ── Designer — warm cream light, coral accent, generous radius ──────────
    designer: {
        label: 'Designer',
        preview: ['#fdf8f4', '#f4623a', '#f0e8e0'],
        vars: {
            '--bg': '#fdf8f4',
            '--bg2': '#ffffff',
            '--bg3': '#f5ede4',
            '--surface': '#ffffff',
            '--surface2': '#ede4da',
            '--border': '#e0d4c8',
            '--accent': '#f4623a',
            '--accent2': '#ff8a65',
            '--accent-glow': 'rgba(244,98,58,.18)',
            '--text': '#2c1a10',
            '--text2': '#8a6a58',
            '--text3': '#c0a898',
            '--red': '#e53935',
            '--yellow': '#f9a825',
            '--green': '#43a047',
            '--font': "'DM Sans', sans-serif",
            '--radius': '20px',
            '--radius-sm': '12px',
            '--shadow': '0 8px 40px rgba(0,0,0,.10)',
        }
    },

    // ── Gamer — deep navy, electric cyan, sharp corners ────────────────────
    gamer: {
        label: 'Gamer',
        preview: ['#06090f', '#00e5ff', '#0a1428'],
        vars: {
            '--bg': '#06090f',
            '--bg2': '#0a1020',
            '--bg3': '#0f1a30',
            '--surface': '#0c1626',
            '--surface2': '#122040',
            '--border': '#1a3060',
            '--accent': '#00e5ff',
            '--accent2': '#80d8ff',
            '--accent-glow': 'rgba(0,229,255,.2)',
            '--text': '#b8e8ff',
            '--text2': '#4a7898',
            '--text3': '#1e3c58',
            '--red': '#ff1744',
            '--yellow': '#ffea00',
            '--green': '#00e676',
            '--font': "'DM Sans', sans-serif",
            '--radius': '4px',
            '--radius-sm': '2px',
            '--shadow': '0 8px 40px rgba(0,229,255,.08)',
        }
    },

    // ── Cyberpunk — near-black purple, neon yellow + magenta hits ──────────
    cyberpunk: {
        label: 'Cyberpunk',
        preview: ['#08040f', '#ffe600', '#1a0030'],
        vars: {
            '--bg': '#08040f',
            '--bg2': '#0e0818',
            '--bg3': '#180a28',
            '--surface': '#120620',
            '--surface2': '#1e0e38',
            '--border': '#36106a',
            '--accent': '#ffe600',
            '--accent2': '#ff2d78',
            '--accent-glow': 'rgba(255,230,0,.18)',
            '--text': '#fff0ff',
            '--text2': '#b060d8',
            '--text3': '#5a2080',
            '--red': '#ff2d78',
            '--yellow': '#ffe600',
            '--green': '#39ff14',
            '--font': "'DM Mono', monospace",
            '--radius': '2px',
            '--radius-sm': '0px',
            '--shadow': '0 8px 40px rgba(255,230,0,.08)',
        }
    },

    // ── Midnight — deep ocean blue, soft periwinkle accent, calm ───────────
    midnight: {
        label: 'Midnight',
        preview: ['#060d1a', '#5b8dee', '#0d1e3a'],
        vars: {
            '--bg': '#060d1a',
            '--bg2': '#0b1628',
            '--bg3': '#101e38',
            '--surface': '#0e1c34',
            '--surface2': '#152440',
            '--border': '#1e3260',
            '--accent': '#5b8dee',
            '--accent2': '#89abf5',
            '--accent-glow': 'rgba(91,141,238,.22)',
            '--text': '#ccdeff',
            '--text2': '#5878a8',
            '--text3': '#2a3e68',
            '--red': '#ff6b8a',
            '--yellow': '#ffd166',
            '--green': '#06d6a0',
            '--font': "'DM Sans', sans-serif",
            '--radius': '14px',
            '--radius-sm': '8px',
            '--shadow': '0 8px 40px rgba(0,0,0,.6)',
        }
    },

    // ── Forest — deep forest green, warm amber accent ───────────────────────
    forest: {
        label: 'Forest',
        preview: ['#060e08', '#a8cc6a', '#0e1e10'],
        vars: {
            '--bg': '#060e08',
            '--bg2': '#0c1810',
            '--bg3': '#122018',
            '--surface': '#0e1c12',
            '--surface2': '#162820',
            '--border': '#1e3824',
            '--accent': '#a8cc6a',
            '--accent2': '#c8e88a',
            '--accent-glow': 'rgba(168,204,106,.2)',
            '--text': '#d8f0d0',
            '--text2': '#5a8860',
            '--text3': '#2e5035',
            '--red': '#ff6b6b',
            '--yellow': '#ffd166',
            '--green': '#a8cc6a',
            '--font': "'DM Sans', sans-serif",
            '--radius': '16px',
            '--radius-sm': '10px',
            '--shadow': '0 8px 40px rgba(0,0,0,.6)',
        }
    },

    // ── Sunset — deep wine, warm orange-pink gradient accent ───────────────
    sunset: {
        label: 'Sunset',
        preview: ['#100608', '#ff7043', '#2a1018'],
        vars: {
            '--bg': '#100608',
            '--bg2': '#1a0c10',
            '--bg3': '#261418',
            '--surface': '#200e12',
            '--surface2': '#2e1820',
            '--border': '#4a2030',
            '--accent': '#ff7043',
            '--accent2': '#ff9a76',
            '--accent-glow': 'rgba(255,112,67,.22)',
            '--text': '#ffe8e0',
            '--text2': '#c07868',
            '--text3': '#784848',
            '--red': '#ff1744',
            '--yellow': '#ffca28',
            '--green': '#66bb6a',
            '--font': "'DM Sans', sans-serif",
            '--radius': '14px',
            '--radius-sm': '8px',
            '--shadow': '0 8px 40px rgba(0,0,0,.6)',
        }
    },

    // ── Minimal — near-white light, slate accent, ultra clean ──────────────
    minimal: {
        label: 'Minimal',
        preview: ['#f8f9fa', '#475569', '#f1f3f5'],
        vars: {
            '--bg': '#f8f9fa',
            '--bg2': '#ffffff',
            '--bg3': '#f1f3f5',
            '--surface': '#ffffff',
            '--surface2': '#e9ecef',
            '--border': '#dee2e6',
            '--accent': '#475569',
            '--accent2': '#64748b',
            '--accent-glow': 'rgba(71,85,105,.15)',
            '--text': '#1e293b',
            '--text2': '#64748b',
            '--text3': '#94a3b8',
            '--red': '#ef4444',
            '--yellow': '#f59e0b',
            '--green': '#22c55e',
            '--font': "'DM Sans', sans-serif",
            '--radius': '8px',
            '--radius-sm': '4px',
            '--shadow': '0 4px 20px rgba(0,0,0,.08)',
        }
    },

    // ── Dracula — classic dark purple, pink + cyan hits ────────────────────
    dracula: {
        label: 'Dracula',
        preview: ['#282a36', '#bd93f9', '#44475a'],
        vars: {
            '--bg': '#1e1f29',
            '--bg2': '#282a36',
            '--bg3': '#343746',
            '--surface': '#2d2f3f',
            '--surface2': '#3a3d52',
            '--border': '#44475a',
            '--accent': '#bd93f9',
            '--accent2': '#cfa9ff',
            '--accent-glow': 'rgba(189,147,249,.22)',
            '--text': '#f8f8f2',
            '--text2': '#a09dbc',
            '--text3': '#6272a4',
            '--red': '#ff5555',
            '--yellow': '#f1fa8c',
            '--green': '#50fa7b',
            '--font': "'DM Sans', sans-serif",
            '--radius': '12px',
            '--radius-sm': '6px',
            '--shadow': '0 8px 40px rgba(0,0,0,.5)',
        }
    },

};