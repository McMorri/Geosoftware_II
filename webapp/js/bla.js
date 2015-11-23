/**
*   @author     Moritz Migge, Timon Gottschlich, Marvin Gehrt, Tobias Steinblum, Daniel Schäperklaus
*   @version	1.0 
*/

"use strict";

/**
*   settings to send the jsnlog-messages to the console of the browser
*/
var consoleAppender = JL.createConsoleAppender('consoleAppender');
JL().setOptions({"appenders": [consoleAppender]});

function ReadPolyline(event) {
	
	// Init
	var input = event.target;
    var reader = new FileReader();
	
	/**
	* @desc Invoked when file is loading. 
	*/ 
    reader.onload = function(){
		// logging message per jsnlog, to make sure that the file was loaded successfully
        JL("file loaded").info("the file was successfully loaded");
		var filecontent=reader.result;
        	
		// Read the file
		reader.readAsText(input.files[0]);
};
};

