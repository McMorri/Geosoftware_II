//  author: Timon Gottschlich, Moritz Migge, Marvin Gehrt, Tobias Steinblum, Daniel Schäperklaus


"use strict";

var express    		= require('express');
var session 		= require('express-session');
var bodyParser 		= require('body-parser');
var mongoose   		= require('mongoose');
var fse 	   		= require('fs-extra');
var async	   		= require('async');
var passport 		= require('passport');
var GitHubStrategy  = require('passport-github2').Strategy;
var gdal 			= require('gdal');
var multer 	   		= require('multer');
var zipZipTop  		= require('zip-zip-top');
var child_process 	= require('child_process');
var latexConverter  = require('./webapp/js/latex2html.js');

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
		async.apply(latexConverter.convert, pubPath, texFile.originalname),
		// Rdata files aus der erstellten Liste konvertieren
		async.apply(rdataconvert, rdataFiles),
		// create zip archive of paper
		async.apply(zipPub, temppub._id),
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
	res.sendFile(__dirname + '/data/' + id + '/paper.html');
	

});



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





/*
	https://www.npmjs.com/package/zip-zip-top
	Siehe Link für Informationen How to
*/

// zip Paper
function zipPub(id, callback) {
	var newZip = new zipZipTop();
	var pubPath      = __dirname + '/data/' + id + '/';
	var zipedPubPath = __dirname + '/data/' + id + '.zip';

	newZip.zipFolder(pubPath, function(err){
		if(err) return callback(err);

		newZip.writeToFile(zipedPubPath, function(err) {
			if(err) return callback(err);
			callback(null);
		});
	});
}

// download zip
app.get("/download/:id", function (req,res){
	var pubID = req.params.id;
	var zipedPubPath = __dirname + '/data/' + pubID + '.zip';

	// check if ziped file exists
	fse.access(zipedPubPath, fse.F_OK, function(err) {
		if (err) return res.status(404).send('zipped publication not found..... :^(((((')
	
		// respond with zip file as download
		res.setHeader('Content-type', 'application-zip', "'attachment; filename='" + pubID + "'.zip'");
		res.download(zipedPubPath);
	});
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
};


////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////Authentifikation/////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

app.use(session({
  secret: 'anything'
}));
app.use(passport.initialize());
app.use(passport.session());

/** GITHUB STRATEGY **/
	passport.use(new GitHubStrategy({
		clientID: '8e633ab00b16f82e20a4',
		clientSecret: 'ca40b716773595fa4a1a97109eab6ea5ad43d538',
		callbackURL: 'http://' + '127.0.0.1' + ':8080' + '/auth/github/callback/'
	},
	function(accessToken, refreshToken, profile, done) {
		//First we need to check if the user logs in for the first time
		mongo.models.users.findOne({
			'providerID': profile.id,
			'provider': 'github'
		}, function(err, user) {
			if (err) return done(err);
			if (!user) {
			// no user existent --> new user --> create a new one
				user = new mongo.models.users({
					name: profile.displayName,
					email: profile.emails[0].value,
					username: profile.username,
					provider: 'github',
					providerID: profile.id
				});

				user.save(function(err) {
					if (err) console.log(err);
					return done(err, user);
				});
			} else {
				//user found. return it.
				return done(err, user);
			}
		});
	}));


	/** GITHUB ROUTES **/

	// GET /auth/github
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  The first step in GitHub authentication will involve redirecting
	//   the user to github.com.  After authorization, GitHub will redirect the user
	//   back to this application at /auth/github/callback
	app.get('/auth/github',
	  passport.authenticate('github', { scope: [ 'user:email' ] }),	// scope = what data we want access to
	  function(req, res){
		// The request will be redirected to GitHub for authentication, so this
		// function will not be called.
	});

	// GET /auth/github/callback
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  If authentication fails, the user will be redirected back to the
	//   login page.  Otherwise, the primary route function will be called,
	//   which, in this example, will redirect the user to the home page.
	app.get('/auth/github/callback',
	  passport.authenticate('github', { failureRedirect: '/login' }),
	  function(req, res) {
		res.redirect('/');
	  });


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

/**
 *   @desc checks if there is a logged in user and sends true or false
 */
app.get('/isLoggedIn', function(req, res) {
  if (req.user) {
    res.send(true);
  } else {
    res.send(false);
  }
});

/**
 *   @desc checks if there is a logged in user and sends the user data or false when there is nobody logged in
 */
app.get('/getLoggedInUser', function(req, res) {
  if (req.user) {
    res.send(req.user);
  } else {
    res.send(false);
  }
});


/**
 *   @desc logs out the current user
 */
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});