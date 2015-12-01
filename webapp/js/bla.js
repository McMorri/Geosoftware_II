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

function Readdata(event) {
	
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
		//...
};
};


function download() {
    window.open('http://' + window.location.host + '/download?fileDownload=true');
}


$.ajax({
    type: 'POST',
    dataType: 'tex',
    url: 'http://' + window.location.host + '/download',
    timeout: 5000,
    success: function(content, textStatus ){
       //...
     console.log('publication downloaded!');
        

    },
    error: function(xhr, textStatus, errorThrown){
        console.error('publicationdownload error!');
    }
});


function newPub() {
    bootbox.dialog({
        title: "Please enter details for your publication!",
        message: '<div class="input-group"><span class="input-group-addon" id="sizing-addon2">Publicationname</span><input id="pubname" type="text" class="form-control" placeholder="..." aria-describedby="sizing-addon2"></div>'
                    + '<br> <div class="input-group"><span class="input-group-addon" id="sizing-addon2">Authorname(s)</span><input id="authorname" type="text" class="form-control daypicker" placeholder="..." aria-describedby="sizing-addon2"></div>'
                    + '<br> <div class="input-group"><span class="input-group-addon" id="sizing-addon2">Releasedate of the publication</span><input id="releasedate" type="text" class="form-control daypicker" placeholder="Form: YYYY-MM-DD" aria-describedby="sizing-addon2"></div>'
<<<<<<< HEAD
                    + '<br> <div> <input type="file" accept=".tex" class="btn btn-default" onchange="Readdata(event)"> </div>',
                    
=======
                    + '<br> <div> <input type="file" accept="*.latex" class="btn btn-default" onchange="Readdata(event) id="newPub"> </div>',
                    // '<br> <div class="input-group"><span class="input-group-addon" id="sizing-addon2">Upload</span><input type='file' accept='tex' aria-describedby="sizing-addon2"></div>',
>>>>>>> refs/remotes/origin/master

	    		
        onEscape: function() {},
        buttons: {
            "Let's Go": {         
                callback: function(){
                    //...
                     //$("#publicationlist").append('<tr><td><button data-index="' + (index+1) + '" onclick="loadpub(this)" class="btn btn-default">''</button> <br></td></tr>');
                }
            }
        }
    });
}

function loadpub(button) {
    window.location.hash = '#' + ($(button).data('index') - 1);
}


