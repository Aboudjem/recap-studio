import type { Config } from "tailwindcss";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const preset = require("@recap-studio/design-system/tailwind-preset");

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
  ],
  presets: [preset],
  plugins: [],
};

export default config;
