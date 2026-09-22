// src/config.js — One-file rebrand config
// Edit this file to rename, recolor, and repackage the entire PWA.
// Everything else reads from here. No other files need changing.

export const BRAND = {
  name: 'TinyCoder',
  shortName: 'TinyCoder',
  description: 'PWA Starter Template for Freelancers — Vanilla JS. No backend. White-label ready.',
  url: 'https://toolbox-lilac-three.vercel.app',
  github: 'https://github.com/tiny-coder-2104/toolbox',
  gumroad: 'https://tinycoderstudio.gumroad.com/l/gyhehh',
  freeTool: 'https://tinycoderstudio.gumroad.com/l/pwa-json-formatter',
}

export const THEME = {
  background: '#0F172A',
  theme: '#06B6D4',
  text: '#E2E8F0',
  accent: '#06B6D4',
}

export const TOOLS = [
  { id: 'json',    title: 'JSON Formatter',   desc: 'Format, validate, and minify JSON',       icon: '{}'  },
  { id: 'base64',  title: 'Base64 Encoder',   desc: 'Encode and decode Base64 strings',        icon: 'B64' },
  { id: 'regex',   title: 'Regex Tester',     desc: 'Test regular expressions with live highlights', icon: '.*' },
  { id: 'url',     title: 'URL Encoder',      desc: 'Encode and decode URLs',                  icon: 'URL' },
  { id: 'uuid',    title: 'UUID Generator',   desc: 'Generate UUIDs instantly',                icon: 'Ux'  },
]

export const PRICING = {
  basic:   { price: 29, label: 'Basic'   },
  pro:     { price: 49, label: 'Pro'     },
  agency:  { price: 79, label: 'Agency'  },
}
