"use strict";
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import clear from 'rollup-plugin-clear';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import screeps from 'rollup-plugin-screeps';

let cfg = null;
const dest = process.env.DEST;

if (!dest) {
	console.log("No destination specified - code will be compiled but not uploaded");
} else if ((cfg = require("./screeps.json")[dest]) == null) {
	throw new Error("Invalid upload destination");
}

/** @type {RollupOptions} */
export default {
	input: "src/main.ts",
	output: {
		file: "dist/main.js",
		format: "cjs",
		sourcemap: true
	},

	plugins: [
		clear({ targets: ["dist"] }),
		resolve({ rootDir: "src" }),
		dynamicImportVars({exclude: ["src/main.ts"], warnOnError: true}),
		// commonjs(),
		typescript({ tsconfig: "./tsconfig.json" }),
		screeps({ config: cfg, dryRun: cfg == null })
	]
};