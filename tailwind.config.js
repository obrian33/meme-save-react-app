/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    colors: {
      "lime": {
        "50": "#F4FCF3",
        "100": "#E9F8E7",
        "200": "#D3F2CF",
        "300": "#BCEBB7",
        "400": "#A2E39B",
        "500": "#8DDD84",
        "600": "#58CD4B",
        "700": "#3BA82E",
        "800": "#27701F",
        "900": "#14380F"
      },
      "red": {
        "50": "#fef2f2",
        "100": "#fee2e2",
        "200": "#fecaca",
        "300": "#fca5a5",
        "400": "#f87171",
        "500": "#ef4444",
        "600": "#dc2626",
        "700": "#b91c1c",
        "800": "#991b1b",
        "900": "#7f1d1d"
      },
    },
    extend: {},
  },
  plugins: [],
}
