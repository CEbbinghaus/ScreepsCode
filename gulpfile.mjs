import gulp from "gulp";
import ts from "gulp-typescript";
import { ScreepsAPI } from 'screeps-api'
import { deleteSync } from "del";
import path from "path";
import { createGulpEsbuild } from 'gulp-esbuild';
import { readdirSync, readFileSync } from "fs";
import { Console } from "console";
import { deleteAsync } from "del";
const { src, series, parallel, task } = gulp;

const esbuild = createGulpEsbuild({
	pipe: true
});

const api = await ScreepsAPI.fromConfig("private");

const dest = "dist";

export function clean() {
	return deleteAsync(dest);
};

export const build = series(clean, function () {
	return src("src/**/*.ts")
		.pipe(
			esbuild({
				bundle: true,
				format: "cjs",
				target: "node10",
				minify: false,
				sourcemap: "inline",
				platform: "node"
			})
		)
		.pipe(gulp.dest(dest));
});

function runUpload(api, branch, code){
	api.raw.user.branches().then((data) => {
	  let branches = data.list.map((b) => b.branch)
  
	  if (branches.includes(branch)) {
		api.code.set(branch, code)
	  } else {
		api.raw.user.cloneBranch('', branch, code)
	  }
	})
  }

function getFileList(outputFile) {
	let code = {}
	let base = path.dirname(outputFile)
	let files = readdirSync(base).filter((f) =>  path.extname(f) === '.js' || path.extname(f) === '.wasm' )
	files.map((file) => {
	  if (file.endsWith('.js')) {
		  code[file.replace(/\.js$/i, '')] = readFileSync(path.join(base, file), 'utf8');
	  } else {
		  code[file] = {
			  binary: readFileSync(path.join(base, file)).toString('base64')
		  }
	  }
	})
	return code
}

export const upload = series(build, async function() {
	let code = getFileList("dist/main.js")
	
	await api.auth();
	
	runUpload(api, "default", code)
});

export async function rawUpload() {
	let code = getFileList("dist/main.js")
	
	await api.auth();
	
	runUpload(api, "default", code)
};