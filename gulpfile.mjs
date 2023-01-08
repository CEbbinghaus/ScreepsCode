import gulp from "gulp";
import ts from "gulp-typescript";
import { ScreepsAPI } from 'screeps-api'
import { deleteSync } from "del";
import path from "path";
import { createGulpEsbuild } from 'gulp-esbuild';
import { readdirSync, readFileSync } from "fs";
const { src, series, parallel } = gulp;

const tsconfig = ts.createProject("tsconfig.json");
const esbuild = createGulpEsbuild();

const api = new ScreepsAPI({
	// token: 'Your Token from Account/Auth Tokens'
	email: "",
	password: "",
	protocol: 'http',
	hostname: 'screeps.cerver.au',
	port: 21025,
	path: '/' // Do no include '/api', it will be added automatically
  });


const dest = "dist";

export const clean = function (cb) {
	deleteSync(dest);
	cb();
};

export const build = series(clean, function (cb) {
	src("src/**/*.ts")
		// .pipe(
		// 	tsconfig({
		// 		noImplicitAny: true,
		// 	})
		// )
		.pipe(
			esbuild({
				bundle: true
			})
		)
		.pipe(gulp.dest(dest));
		cb();
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

export const upload = series(async function(cb) {
	let code = getFileList("dist/main.js")
	
	await api.auth();
	runUpload(api, "default", code)

	cb();
});