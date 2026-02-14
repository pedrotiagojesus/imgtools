import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    base: "/imgtools/",
    plugins: [react()],
    resolve: {
        alias: {
            "@components": path.resolve(__dirname, "src/components"),
            "@pages": path.resolve(__dirname, "src/pages"),
            "@assets": path.resolve(__dirname, "src/assets"),
            "@utils": path.resolve(__dirname, "src/utils"),
            "@config": path.resolve(__dirname, "src/config"),
            "@styles": path.resolve(__dirname, "src/styles"),
            "@services": path.resolve(__dirname, "src/services"),
            "@appTypes": path.resolve(__dirname, "src/types"),
        },
    },
});
