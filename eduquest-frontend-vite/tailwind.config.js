// tailwind.config.js

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#1e40af', // EduQuest Blue
        'brand-secondary': '#3b82f6',
      },
    },
  },
  plugins: [],
}
