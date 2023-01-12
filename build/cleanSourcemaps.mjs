
import through2 from "through2";

const cleanSourcemaps = through2.obj((/** @type {import("vinyl-file").VinylFile} */file, enc, cb) => {
	if(`${file.path}`.endsWith(".map")) {
		const modifiedFile = file.clone();

		let json = JSON.parse(String( file.contents ));

		delete json.sourcesContent;

		modifiedFile.contents = Buffer.from( JSON.stringify(json) );

		cb(null, modifiedFile);
	} else
		cb(null, file)
});

export default cleanSourcemaps;