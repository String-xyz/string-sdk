import { defineConfig } from "tsup";
// import dotenv from "dotenv";
// dotenv.config();
// console.log("process.env.ANALYTICS_LIB_PK", process.env.ANALYTICS_LIB_PK);

export default defineConfig((options) => {
    return {
        entry: ["src/index.ts"],
        sourcemap: false,
        dts: true,
        splitting: false,
        clean: !options.watch,
        format: ["cjs", "esm"],
        minify: !options.watch,
        // Internal packages not meant for client consumption should be here
        noExternal: [],
    };
});
