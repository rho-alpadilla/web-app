// tailwind.config.js
module.exports = {
  content: [
    "./views/**/*.ejs",  // Adjust this if your EJS files are in different directories
    "./public/**/*.html"
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class', // Ensure dark mode works by toggling the class
  plugins: [],
};
