//  author: Timon Gottschlich, Moritz Migge, Marvin Gehrt, Tobias Steinblum, Daniel Schäperklaus


"use strict";

var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var fse 	   = require('fs-extra');
var multer 	   = require('multer');

var app = express();
app.use(bodyParser.urlencoded({extended: true, limit:'100mb'})); // enable processing of the received post content


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var publicationSchema = mongoose.Schema({
  //pubid: String, 
  //token: String,
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


// TODO: multer instanz erzeugen

app.post("/savepub", /* multer instanz, */ function(req,res){
	console.log("save pub is starting fine");

	//var texFile = req.files['texFile'][0];

	var temppub = new publication({			
		//pubid: req.body.pubid,
		//token: req.body.token,
		pubname: req.body.pubname,
		authorname: req.body.authorname,
		//releasedate: req.body.releasedate
		releasedate: new Date()
	});

	var paperID = temppub._id;


	temppub.save(function (err) {
		if (err){
			res.send("Error: "+err); 
		}

		console.log("tempub was saved ");
		res.send(temppub);
	});	
});



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

});


