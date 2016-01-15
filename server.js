//  author: Timon Gottschlich, Moritz Migge, Marvin Gehrt, Tobias Steinblum, Daniel Schäperklaus


"use strict";

var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var fse 	   = require('fs-extra');
var async	   = require('async');
var multer 	   = require('multer');
var zipZipTop  = require('zip-zip-top');
var child_process = require('child_process');

var app = express();
var upload = multer({ dest: __dirname + '/uploads/' });

//app.use(bodyParser.urlencoded({extended: true, limit:'100mb'})); // enable processing of the received post content


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var publicationSchema = mongoose.Schema({
  pubname: String,
  authorname: [String],
  releasedate:	Date,
});
var publication = mongoose.model('publication' , publicationSchema);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// change these, if you need another port config
var config = {
    httpPort: 8080,
    mongoPort: 27017
};


/* init database connection */
mongoose.connect('mongodb://localhost:' + config.mongoPort + '/PaperBulb');
var database = mongoose.connection;

database.on('error', console.error.bind(console, 'ABORTING. database connection error:'));

// once db connection is open, start http server
database.once('open', function (callback) {
    console.log('connection to database established on port ' + config.mongoPort);
    app.listen(config.httpPort, function(){
        console.log('http server now running on port ' + config.httpPort);
    });
});


/** http routing **/

// code which is executed on every request
app.use(function(req, res, next) {
    console.log(req.method + ' ' + req.url + ' was requested');
    next();
});

/* web app */

// deliver all contents of the folder '/webapp' under '/'
app.use(express.static(__dirname + '/webapp'));


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



app.get("/getpub", function (req,res){
	console.log("getpub is starting fine");

	publication.find(function (err, feature) {
		if(err){
			return console.log(err);
		}

		//console.log(feature);
		return res.send(feature);
		res.sendFile(/*dateipfad*/);
	});
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// multer instanz erzeugen
var uploadNewPub = upload.fields([
	{ name: 'mainlatex', maxCount: 1 },
	{ name: 'others' }
]);

// https://www.codementor.io/tips/9172397814/setup-file-uploading-in-an-express-js-application-using-multer-js
app.post("/savepub", uploadNewPub, function(req,res){
	console.log("save pub is starting fine");

	var texFile = req.files['mainlatex'][0];
	var otherFiles = req.files['others'];
	var rdataFiles = []; // paths to all uploaded rdata files
	
	// append texFile to otherFiles array, so we have all files in one array
	otherFiles.push(texFile);

	// DB eintrag erstellen
	var temppub = new publication({
		pubname: req.body.pubname,
		authorname: req.body.authorname,
		releasedate: new Date(),
	});

	// path where all files of a publication are stored
	var pubPath = __dirname + '/data/' + temppub._id + '/'


	//find all rdata files for conversion
	for (var i = 0; i < otherFiles.length; i++) {
	    var fileName = otherFiles[i].originalname;
	    var extension = fileName.split('.').pop();
	    if (extension.toLowerCase() == 'rdata')
	    	rdataFiles.push(pubPath + fileName);
	}

	function moveFiles(files, pubID, callback) {
		async.eachSeries(files, function(file, done) {
			fse.move(
				__dirname + '/uploads/' + file.filename,
				pubPath + file.originalname,
				done
			);
		}, callback);
	}

	async.series([
		// verschiebe alle dateien (otherfiles + texfile) in data ordner
		async.apply(moveFiles, otherFiles, temppub._id),
		// tex zu html konvertieren
		function(callback) {
			// node modul child_process um LaTeXML oÄ aufzurufen
			callback(null, '');
		},
		// Rdata files aus der erstellten Liste konvertieren
		async.apply(rdataconvert, rdataFiles),
		// DB eintrag speichern
		async.apply(temppub.save)
	], function done (err, results) {
		// alles fertig
		if (err) {
			console.error('couldnt save publication: ' + err);
			return res.status(500).send('couldnt save publication: ' + err);
		}

		console.log('pub saved');
		res.send(temppub);
	});

});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @desc  return the paper metadata
 */
app.get("/getselectedpub/:id", function (req,res){

	publication.findOne({_id: req.params.id}, function (err, feature) {
		console.log(req.params.id);
		if(err){
			return console.log(err);
		}
		console.log(feature);
		return res.send(feature);
	});	
});

/**
 * return  the converted paper
 */
app.get('/getpublicationHTML/:id', function(req, res) {
	var id = req.params.id;
	res.send(__dirname + '/data/' + id + '/paper.html');
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
	https://www.npmjs.com/package/zip-zip-top
	Siehe Link für Informationen How to
*/

// zip Paper
function zipPub(id) {
	var newZip = new zipZipTop();
	var pubPath = config.dataDir.publications + '/' + id;
	var zipedPubPath = config.dataDir.ziped + '/' + id + '.zip';

	newZip.zipFolder (pubPath, function(err){
		if(err) {
			console.log(err);

			newZip.writeToFile(zipedPubPath, function(err) {
				if(err) console.log(err)
			});
		}
	});
	console.log("Zipping successfull");
}


//folder for zipping
app.get('/zipFolder/:id/', function(req, res){

	var pubID = req.param.id;
	var zipedPubPath = config.dataDir.ziped + '/' + pubID ;
	/*
	if(...) {
		return window.alert('File not found or doesnt exisist');
	}
	*/
	zipPub(pubID);
	res.end();
});

// download zip
app.get("/downloadZipedPaper/:id", function (req,res){

	var pubID = req.param.id;
	var zipedPubPath = config.dataDir.ziped + '/' + pubID + '.zip';

	/*
	if(...) {
		return window.alert('File not found or doesnt exisist');
	}
	*/

	res.setHeader('Content-type', 'application-zip', "'attachment; filename='pubID + '.zip'");
	res.download(zipPath);

});

//child_process
//accepts an array of input paths to be converted ( assumes an rdata extension)
//callback shows outputpath if successful
function rdataconvert (inputpathArray, callback){
	async.eachSeries(inputpathArray, function(inputpath, callbackEach) {
		// assume a filextension with 5 characters (.Rdata)
		var outputpath = inputpath.substr(0, inputpath.length - 6) + '.csv';
		var command = "Rscript rdataconvert.r --input "+inputpath+" --output "+outputpath;
		child_process.exec(command, callbackEach);
	}, callback);
}





