"use strict";

/**
 * @desc Converts a LaTeX file into HTML using latexml and does some additional conversations.
 */

var path = require("path");
var fse  = require('fs-extra');

module.exports.convert = function(inputdir, input, callback) {
	

	// store the current working directory
	// then switch to the input dir to prevent latexml from cluttering the main directory
	var currentwdir = process.cwd();
	process.chdir(inputdir);

	// start latexml
	var spawn = require('child_process').spawn;
	var latexml = spawn("latexml", ["--dest=" + path.basename(input, ".tex") + ".xml", input]);

	latexml.on('exit', function(code) {
		console.log("Step 1: latexml finished, returning " + code);

		if(code != 0) return callback("Error while converting paper from tex to xml");

		process.chdir(inputdir);

		// start latexmlpost
		var lmlpost = spawn("latexmlpost", ["-dest=paper.html", path.basename(input, ".tex") + ".xml"]);
		lmlpost.on('exit', function(code) {
			console.log("Step 2: latexmlpost finished, returning " + code);

			if(code != 0) return callback("Error while converting paper from xml to html");

			process.chdir(currentwdir);

			// saving that the conversion was succesful
			return callback(null);

		});

	});

	process.chdir(currentwdir);

}



module.exports.replaceTags = function(filepath, callback) {
	console.log("replaceTags starting fine");

    var htmlString = fse.readFileSync(filepath,'utf8');
    var tagSchema = '!-IAE';
    var lines = htmlString.split('\n');
    var IAEs = []; // contains arrays of IAE arguments in the form of ["(!-IAE", "type=map", "dataset=file.json"]

    console.log(lines.length);

    // find each marker
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf(tagSchema) == -1) continue;
        IAEs[i] = (lines[i].split(','));
    }

    console.log(IAEs.length);

    // parse each marker & call conversion
    for (var i = 0; i < IAEs.length; i++) {
        if ( IAEs[i] instanceof Array) {
            var type    = IAEs[i][1].split('=')[1];
            var dataset = IAEs[i][2].split('=')[1];
            var visualisationDiv = "test";
            console.log(type);
            console.log(dataset);
            /*// generate the visualisations
            if (type == 'map')                visualisationDiv = generateMap(dataset);
            else if (type == 'timeseries') visualisationDiv = generateTimeseries(dataset);
			*/

            // replace each marker line with actual visualisation html code
            lines[i] = visualisationDiv;
        }
    }

    // put string together again
    var newHtml = lines.join('\n');

    //inject script tags


	// brauchen wir flot(navigate,resize,time), mathJax.js, leaflet.markercluster, moment.js, polarmap.js und proj4leaflet???		
	newHtml = newHtml.replace('<head>',
		'<head><script type="text/javascript" src="app/components/jquery/dist/jquery.min.js"></script>' +
		'<link rel="stylesheet" href="app/components/leaflet-dist/leaflet.css" />' +
		'<script type="text/javascript" src="app/components/leaflet-dist/leaflet.js"></script>' +
		'<link rel="stylesheet" href="app/components/bootstrap/dist/css/bootstrap.min.css" />' +
		'<script type="text/javascript" src="app/components/bootstrap/dist/js/bootstrap.min.js"></script>' +
		'<script type="text/javascript" src="js/func.js"></script>' +
		'<script type="text/javascript" src="js/Leaflet.js"></script>');

	console.log("Step 3: injecting script tags finished");

    // save to file
    fse.writeFileSync(filepath, newHtml);
    callback(null);
}