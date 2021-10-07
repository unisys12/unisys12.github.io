module.exports = {
  purge: [
    // "./*.{html,njk,md}",
    // "./_includes/*.{html,njk,md}",
    // "./_includes/**/*.{html,njk,md}",
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: "rgba(255,255,255,0.9)",
            h1: {
              color: "rgba(255,255,255,0.8)",
            },
            h2: {
              color: "rgba(150,255,200,0.9)",
            },
            h3: {
              color: "rgba(150,255,155)",
            },
            a: {
              color: "rgb(117, 255, 63)",
              "&:hover": {
                color: "rgb(117, 200, 63)",
              },
            },
            blockquote: {
              "background-color": "rgb(239, 246, 255)",
              "border-color": "#9bb7f5",
              "border-radius": "3px",
            },
          },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
