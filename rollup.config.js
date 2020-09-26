import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default {
  name: "messenger-statistics",
  input: "src/index.ts",
  output: {
    file: "dist/bundle.js",
    format: "umd"
  },
  sourcemap: true,
  plugins: [
    typescript(),
    resolve(),
    commonjs()
  ],
};