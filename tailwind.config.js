/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#D14B15',
          dark: '#1C1C1C',
          light: '#F5F5F5',
          input: '#F1F1F1',
          sidebg: '#F9FAFB',
          success: '#DCFCE7', // Light green for Active
          successText: '#15803d',
          error: '#FEE2E2', // Light red for Inactive
          errorText: '#b91c1c',
          active: '#FFE5DE',
          urgency: {
            high: '#FFE4E6',
            medium: '#FEF3C7',
            critical: '#FCA5A5',
            low: '#D1FAE5',
          },
          // Dark mode specific (derived from palette)
          darkBg: '#121212',
          darkCard: '#1E1E1E',
          darkBorder: '#2D2D2D',
          darkText: '#E5E5E5',
          darkMuted: '#A0A0A0'
        }
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
