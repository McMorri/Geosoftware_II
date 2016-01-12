//  author: Timon Gottschlich, Moritz Migge, Marvin Gehrt, Tobias Steinblum, Daniel Schäperklaus


"use strict";

var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var fse 	   = require('fs-extra');
var multer 	   = require('multer');

var app = express();
var upload = multer ({
	dest: 'uploads/'
});

app.use(bodyParser.urlencoded({extended: true, limit:'100mb'})); // enable processing of the received post content


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var publicationSchema = mongoose.Schema({
  pubname: String,
  authorname: [String],
  releasedate:	Date
});


var publication = mongoose.model('publication' , publicationSchema);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// change these, if you need another port config
var config = {
    httpPort: 8080,
    mongoPort: 27017
}


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

		console.log(feature);
		return console.log(res.send(feature));
	});
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// TODO: multer instanz erzeugen
var uploadNewPub = upload.fields([{
  name: 'mainlatex',
  maxCount: 1
}, {
  name: 'others',
  maxCount: 20
}]);

// https://www.codementor.io/tips/9172397814/setup-file-uploading-in-an-express-js-application-using-multer-js
app.post("/savepub", multer({ dest: './uploads/'}).single('upl'), function(req,res){
	console.log("save pub is starting fine");

	//var texFile = req.files['texFile'][0];

	var temppub = new publication({			
		pubname: req.body.pubname,
		authorname: req.body.authorname,
		releasedate: new Date(),
		text_path: []
	});

	temppub.save(function (err) {
		if (err){
			res.send("Error: "+err); 
		}
		console.log("tempub was saved ");
		res.send(temppub);
	});	
/*
	var texFile = req.files['texFile'][0];
	var paperID = tempub._id;
	
	var paperPath = path.join(process.cwd(), "./uploads");


    paper.htmlCode = path.join(paperPath, paperID, "tex", path.basename(req.files["texfile"][0].originalname, path.extname(req.files["texfile"][0].originalname)) + ".html");


	// current, just pusts it on server
	// maybe create destination folder?
	*/




});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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


app.get("/download/:id", function (req,res){
//...
});


