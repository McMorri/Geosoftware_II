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



module.exports.replaceTags = function(filepath, paperID, callback) {

	console.log("replaceTags starting fine");

    var htmlString = fse.readFileSync(filepath,'utf8');
    var tagSchema = '!-IAE';
    var lines = htmlString.split('\n');
    var IAEs = []; // contains arrays of IAE arguments in the form of !-IAE type=map dataset=file.json !-IAE

    console.log(lines.length);

    // find each marker
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf(tagSchema) == -1) continue;
        IAEs[i] = lines[i].split(tagSchema);
    }

    console.log(IAEs.length);

    // parse each marker & call conversion
    for (var i = 0; i < IAEs.length; i++) {
		// skip holes in the array
        if (!(IAEs[i] instanceof Array)) continue;

		// contains an array of values from the tag eg ["", "type=timeseries", "file=asdf.Rdata"]
		var tag = IAEs[i][1].split(' ');

		// extract the actual values
		var type    = tag[1].split('=')[1];
        var dataset = tag[2].split('=')[1];
        var visualisationDiv = '';

        console.log(IAEs[i][0]);
        console.log(IAEs[i][1]);
        console.log(IAEs[i][2]);

        // generate the visualisation HTML tags which will replace the tag
        if (type == 'map') {
			visualisationDiv = generateMap(dataset);
        } else if (type == 'timeseries') {
			visualisationDiv = '<div id="timeseries' + i + '" class="timeseries" data-file="' 
							+ paperID + '/' + dataset + '"></div>';
			visualisationDiv = visualisationDiv.replace('.Rdata', '.csv');
			visualisationDiv = visualisationDiv.replace('.rdata', '.csv');
		}
		
        // replace each tag with actual visualisation html code
		IAEs[i][1] = visualisationDiv;
        lines[i] = IAEs[i].join('');
    }

    // put string together again
    var newHtml = lines.join('\n');

    //inject script tags
	newHtml = newHtml.replace('<head>',
		'<head><script type="text/javascript" src="/app/components/jquery/dist/jquery.min.js"></script>' +
		'<link rel="stylesheet" href="/app/components/leaflet-dist/leaflet.css" />' +
		'<link rel="stylesheet" href="/app/components/c3/c3.css" />' +
		'<script type="text/javascript" src="/app/components/d3/d3.min.js"></script>' +
		'<script type="text/javascript" src="/app/components/c3/c3.min.js"></script>' +
		'<script type="text/javascript" src="/app/components/leaflet-dist/leaflet.js"></script>' +
		'<script type="text/javascript" src="/js/timeseries.js"></script>' +
		'<script type="text/javascript" src="/js/Leaflet.js"></script>');

	console.log("Step 3: injecting script tags finished");

    // save to file
    fse.writeFileSync(filepath, newHtml);
	console.log("Step 4: html modified");
    callback(null);
}
