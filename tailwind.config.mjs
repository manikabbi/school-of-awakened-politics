/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        sap: {
          navy: '#0b192c',
          navyLight: '#1e3e62',
          terracotta: '#c85a17',
          terracottaDark: '#a3420c',
          ochre: '#d97706',
          sand: '#fbf8f2',
          sandDark: '#f0ebe1',
          gold: '#eab308'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
