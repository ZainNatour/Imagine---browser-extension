import radix from "tailwindcss-radix";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        indigo: {
          1: "var(--indigo-1)",
          2: "var(--indigo-2)",
          3: "var(--indigo-3)",
          4: "var(--indigo-4)",
          5: "var(--indigo-5)",
          6: "var(--indigo-6)",
          7: "var(--indigo-7)",
          8: "var(--indigo-8)",
          9: "var(--indigo-9)",
          10: "var(--indigo-10)",
          11: "var(--indigo-11)",
          12: "var(--indigo-12)",
        },
      },
    },
  },
  plugins: [radix],
};
