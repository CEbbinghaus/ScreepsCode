import { readdirSync, readFileSync } from "fs";
import path from "path";

/**
 * 
 * 
 * @export
 * @param {any} api 
 * @param {any} branch 
 * @param {string} code 
 */
export function uploadToServer(api, branch, directory) {
	const files = getFileList(directory);

	api.raw.user.branches().then((data) => {
		let branches = data.list.map((b) => b.branch)

		if (branches.includes(branch)) {
			api.code.set(branch, files)
		} else {
			api.raw.user.cloneBranch('', branch, files)
		}
	})
}

function getFileList(directory) {
	let code = {}

	/** @type {string[]} */
	let files = readdirSync(directory)
				.filter((f) => ['.js', '.wasm', '.map'].includes(path.extname(f)))

	for(let file of files) {
		switch(path.extname(file)) {
			case ".js":
				code[file.substring(0, file.length - 3)] = readFileSync(path.join(directory, file), 'utf8');
			break;
			case ".map":
				code[file] = readFileSync(path.join(directory, file), 'utf8');
			break;
			case ".wasm":
				code[file] = {
					binary: readFileSync(path.join(directory, file)).toString('base64')
				}
			break;
			default:
				console.warn(`Unable to publish ${file} as it has an unsupported filetype`);
		}
	}
	
	return code
}