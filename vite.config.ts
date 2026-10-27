import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    rolldownOptions: {
      onLog(level, warning, defaultHandler) {
        // 此依赖已编译，use no memo 仅影响 React Compiler，不需要保留到浏览器产物
        if (
          level === "warn" &&
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.message.includes('"use no memo"') &&
          warning.message.includes("/node_modules/react-compiler-runtime/dist/index.js")
        ) {
          return;
        }
        defaultHandler(level, warning);
      },
    },
  },
  server: {
    host: "0.0.0.0",
  },
});
