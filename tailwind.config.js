/** @type {import('tailwindcss').Config} */
function withOpacity(varName) {
  return ({ opacityValue }) =>
    opacityValue === undefined
      ? `rgb(var(${varName}))`
      : `rgb(var(${varName}) / ${opacityValue})`
}

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: withOpacity('--color-paper'),
        stone: withOpacity('--color-stone'),
        card: withOpacity('--color-card'),
        ink: withOpacity('--color-ink'),
        inkfaint: withOpacity('--color-inkfaint'),
        awning: withOpacity('--color-awning'),
        awningdark: withOpacity('--color-awningdark'),
        mustard: withOpacity('--color-mustard'),
        mustarddark: withOpacity('--color-mustarddark'),
        brick: withOpacity('--color-brick'),
        brickfaint: withOpacity('--color-brickfaint'),
      },
      fontFamily: {
        display: ['"El Messiri"', 'sans-serif'],
        body: ['Tajawal', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        tag: '10px',
      },
    },
  },
  plugins: [],
}
