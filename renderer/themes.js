// ── TodoFloat Theme Presets ──────────────────────────────────────────────────
// Add or remove themes here. Each theme overrides CSS variables.
// Required keys: bg, bg2, bg3, surface, surface2, border, accent, accent2,
//                accentGlow, text, text2, text3, font (optional), label, preview

const THEMES = {
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
            '--font': "'DM Sans', sans-serif",
            '--radius': '14px',
            '--radius-sm': '8px',
        }
    },

    coder: {
        label: 'Coder',
        preview: ['#0d0d0d', '#00ff88', '#1a1a1a'],
        vars: {
            '--bg': '#0d0d0d',
            '--bg2': '#111111',
            '--bg3': '#1a1a1a',
            '--surface': '#141414',
            '--surface2': '#1e1e1e',
            '--border': '#2a2a2a',
            '--accent': '#00ff88',
            '--accent2': '#33ffaa',
            '--accent-glow': 'rgba(0,255,136,.2)',
            '--text': '#e0ffe0',
            '--text2': '#7aaa7a',
            '--text3': '#3a5a3a',
            '--font': "'DM Mono', monospace",
            '--radius': '6px',
            '--radius-sm': '4px',
        }
    },

    designer: {
        label: 'Designer',
        preview: ['#faf9f7', '#ff6b6b', '#f0ede8'],
        vars: {
            '--bg': '#faf9f7',
            '--bg2': '#ffffff',
            '--bg3': '#f0ede8',
            '--surface': '#ffffff',
            '--surface2': '#e8e4de',
            '--border': '#e0d8d0',
            '--accent': '#ff6b6b',
            '--accent2': '#ff8e8e',
            '--accent-glow': 'rgba(255,107,107,.2)',
            '--text': '#2d2620',
            '--text2': '#8a7a70',
            '--text3': '#b0a090',
            '--font': "'DM Sans', sans-serif",
            '--radius': '20px',
            '--radius-sm': '12px',
        }
    },

    gamer: {
        label: 'Gamer',
        preview: ['#080c14', '#00d4ff', '#0a1628'],
        vars: {
            '--bg': '#080c14',
            '--bg2': '#0a1220',
            '--bg3': '#0f1a2e',
            '--surface': '#0d1828',
            '--surface2': '#132038',
            '--border': '#1e3050',
            '--accent': '#00d4ff',
            '--accent2': '#33dfff',
            '--accent-glow': 'rgba(0,212,255,.25)',
            '--text': '#d0eeff',
            '--text2': '#6090b0',
            '--text3': '#304860',
            '--font': "'DM Sans', sans-serif",
            '--radius': '4px',
            '--radius-sm': '2px',
        }
    },

    cyberpunk: {
        label: 'Cyberpunk',
        preview: ['#0a0a0f', '#ffe600', '#1a0a2e'],
        vars: {
            '--bg': '#0a0a0f',
            '--bg2': '#10101a',
            '--bg3': '#1a0a2e',
            '--surface': '#120820',
            '--surface2': '#1e1030',
            '--border': '#3a0a5e',
            '--accent': '#ffe600',
            '--accent2': '#ff2d78',
            '--accent-glow': 'rgba(255,230,0,.2)',
            '--text': '#fff0ff',
            '--text2': '#b060d0',
            '--text3': '#602880',
            '--font': "'DM Mono', monospace",
            '--radius': '2px',
            '--radius-sm': '0px',
        }
    },

    midnight: {
        label: 'Midnight',
        preview: ['#080e1a', '#4d9fff', '#0d1830'],
        vars: {
            '--bg': '#080e1a',
            '--bg2': '#0d1830',
            '--bg3': '#122040',
            '--surface': '#0f1c38',
            '--surface2': '#162548',
            '--border': '#1e3060',
            '--accent': '#4d9fff',
            '--accent2': '#7ab8ff',
            '--accent-glow': 'rgba(77,159,255,.25)',
            '--text': '#d0e8ff',
            '--text2': '#6090c0',
            '--text3': '#304870',
            '--font': "'DM Sans', sans-serif",
            '--radius': '14px',
            '--radius-sm': '8px',
        }
    },

    forest: {
        label: 'Forest',
        preview: ['#0a1208', '#4ecb71', '#122010'],
        vars: {
            '--bg': '#0a1208',
            '--bg2': '#101a0e',
            '--bg3': '#162414',
            '--surface': '#121e10',
            '--surface2': '#1a2c18',
            '--border': '#243820',
            '--accent': '#4ecb71',
            '--accent2': '#7ade96',
            '--accent-glow': 'rgba(78,203,113,.2)',
            '--text': '#d0f0d8',
            '--text2': '#6a9870',
            '--text3': '#3a5840',
            '--font': "'DM Sans', sans-serif",
            '--radius': '16px',
            '--radius-sm': '10px',
        }
    },

    sunset: {
        label: 'Sunset',
        preview: ['#12080a', '#ff7c40', '#2a1018'],
        vars: {
            '--bg': '#12080a',
            '--bg2': '#1e0e12',
            '--bg3': '#2a1418',
            '--surface': '#221018',
            '--surface2': '#301820',
            '--border': '#4a2030',
            '--accent': '#ff7c40',
            '--accent2': '#ffa070',
            '--accent-glow': 'rgba(255,124,64,.25)',
            '--text': '#ffe8e0',
            '--text2': '#c07060',
            '--text3': '#704040',
            '--font': "'DM Sans', sans-serif",
            '--radius': '14px',
            '--radius-sm': '8px',
        }
    }
};