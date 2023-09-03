module.exports = {
  content: ["./src/**/*.{vue,js,ts,jsx,tsx,hbs,html}"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        100: "55rem",
      },
    },
  },
  daisyui: {
    base: false,
  },
  plugins: [require("daisyui")],
};
