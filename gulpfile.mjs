import { ScreepsAPI } from 'screeps-api'
import { exec } from 'child_process';
import { createGulpEsbuild } from 'gulp-esbuild';
import { fstat, readdirSync, readFileSync, existsSync } from "fs";
import { uploadToServer } from "./build/upload.mjs";
import { deleteSync } from 'del';

import log from "fancy-log"
import through from 'through2'
import YAML from "yamljs";
import gulp from "gulp";
import cleanSourcemaps from './build/cleanSourcemaps.mjs';
const { src, series, parallel, task } = gulp;

if(!existsSync(".screeps.yaml")) {
	console.error("Couldn't find '.screeps.yaml' at the project root. Please ensure this exists");
	process.exit(1);
}

// directory that esbuild builds to and screeps uploads from
const dest = "dist";
const command = process.argv[2] || ""

const screepsConfig = YAML.parseFile(".screeps.yaml");

const esbuild = createGulpEsbuild({
	incremental: command.includes("watch"),
	pipe: !command.includes("watch")
});

const branchingEnabled = screepsConfig.branching || false;

const distCommand = command.startsWith("dist");
const uploadCommand = command.startsWith("upload");
const watchCommand = command.startsWith("watch");

const deployTarget = ((distCommand || uploadCommand || watchCommand) && command.includes(":") && command.split(":")[1]) || "main"

const api = await ScreepsAPI.fromConfig(deployTarget);

/** @type {Promise<string>} */
const currentBranch = branchingEnabled && (() => {return new Promise((res, rej) => 
	exec('git rev-parse --abbrev-ref HEAD', (err, stdout, stderr) => {
	if (err) {
		rej("Unable to retrieve current git branch. Please ensure git is installed and on the path or disable 'branching' in .screeps.yaml");
	}
	res(stdout.trim())
})
)})();

deleteSync(dest);

export function build() {
	return src("src/main.ts")
		.pipe(
			esbuild({
				bundle: true,
				format: "cjs",
				target: "node10",
				minify: false,
				sourcemap: "linked",
				platform: "node"
			})
		)
		// .pipe(cleanSourcemaps)
		.pipe(gulp.dest(dest));
};

export async function upload() {
	let branch = (currentBranch && await currentBranch);

	if(!branch || ["main", "master"].includes(branch))
		branch = "default";

	await api.auth();

	log(`Uploading contents of ${dest} to ${deployTarget}:${branch}`)
	uploadToServer(api, branch, dest)
};

if(uploadCommand)
	task(command, series(upload))


task("deploy", series(build, upload))

if(distCommand)
	task(command, series("deploy"))

export function watch() {
	gulp.watch("src/**/*.ts", {ignoreInitial: false}, series("deploy"))
};

if(watchCommand)
	task(command, series(build));