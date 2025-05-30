/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        retro: {
          text: '#eee',
          neon: '#ff00a0',
          purple: '#9900ff',
          cyan: '#f89406',
          orange: '#f89406',
          yellow: '#ffde59',
          green: '#14f195',
        },
      },
      fontFamily: {
        retro: ['"Press Start 2P"', 'cursive'],
        mono: ['"VT323"', 'monospace'],
        display: ['"Audiowide"', 'cursive'],
      },
      boxShadow: {
        neon: '0 0 5px #ff00a0, 0 0 20px #ff00a0, 0 0 60px #ff00a0',
        'neon-blue': '0 0 5px #f89406, 0 0 20px #f89406, 0 0 60px #f89406',
        'neon-orange': '0 0 5px #f89406, 0 0 20px #f89406, 0 0 60px #f89406',
        'neon-purple': '0 0 5px #9900ff, 0 0 20px #9900ff, 0 0 60px #9900ff',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        retroDark: {
          primary: "#ff00a0",
          secondary: "#9900ff",
          accent: "#00e1ff",
          neutral: "#191627",
          "base-100": "#121212",
          "base-200": "#1e1e1e",
          "base-300": "#292929",
          info: "#f89406",
          success: "#14f195",
          warning: "#ffde59",
          error: "#ff3f3f",
        },
        retroLight: {
          primary: "#ff00a0",
          secondary: "#9900ff",
          accent: "#00e1ff",
          neutral: "#e0ddee",
          "base-100": "#f5f5f5",
          "base-200": "#ececec",
          "base-300": "#e0e0e0",
          info: "#f89406",
          success: "#0abb6a",
          warning: "#d9bd4b",
          error: "#d12626",
        },
      },
    ],
  },
}
