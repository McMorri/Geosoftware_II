/**
*   @author     Moritz Migge, Timon Gottschlich, Marvin Gehrt, Tobias Steinblum, Daniel Schäperklaus
*   @version    1.0 
*/

"use strict";

var selectedPaperID;
var publicationArray = [];

$(document).ready(function() {

    // get pubID from url hash
    selectedPaperID = window.location.hash.slice(1);
    if (selectedPaperID) {
        loadPublication(selectedPaperID);
    }

    /**
    *   settings to send the jsnlog-messages to the console of the browser
    */
    var consoleAppender = JL.createConsoleAppender('consoleAppender');
    JL().setOptions({"appenders": [consoleAppender]});



    $.ajax({
        type: 'GET',
        //dataType: 'txt',
        url: 'http://' + window.location.host + '/getpub',
        timeout: 5000,
        success: function(content, textStatus ){
            if (content.length != 0) {

                for (var i = 0; i < content.length; i++) {
                    $("#publicationlist").prepend('<tr><td><button data-index="' + content[i]._id + '"onclick="loadPublication(this)" class="btn btn-default">' 
                        + content[i].pubname + " : " + content[i].authorname + " : " + content[i].releasedate + '</button> <br></td></tr>');
                }

                if (!selectedPaperID) {
                    console.error('No specific publication loaded');
                } else {
                    loadPublication(selectedPaperID);
                    console.log('Specific publication loaded');
                }

            } else {
                console.error('No publications saved');
            }

        },
        error: function(xhr, textStatus, errorThrown){
            console.error('publication couldnt be loaded :^(');
        }
    });

    $('#newPubForm').submit(function(e) {
        e.preventDefault(); // avoid autmatic form submission
        $.ajax({
            url: $("#newPubForm").attr("action"),
            type: 'POST',
            data: $("#newPubForm").serialize(),
            success: function(content) {
                // add button to right sidebar
                $("#publicationlist").prepend('<tr><td><button data-index="' + content._id + '" onclick="loadPublication(this)" class="btn btn-default">'
                   + content.pubname + " : " + content.authorname + " : " + content.releasedate +'</button> <br></td></tr>');
                $("#selectedpubname").text(content.pubname);
                console.log('publication saved to db!');
                //selectedPaperID = content._id;
                window.location.hash = '#close';
                window.location.hash = '#' + content._id;

            }

        });
    });
}); // end document.ready()


function downloadPaper() {
    var url= 'http://' + window.location.host + '/download/';
    window.open(url + selectedPaperID);
}

window.onHashChange=function(){
    var hash = window.location.hash.slice(1);
    if (hash != '#newPubModal' && hash != '#close' && hash != '') {
        loadPublication(hash);
    }
}


// accapts a button from the right sidebar or a string containing th ID
function loadPublication(element){

    var pubID;
    if (typeof element == "string") {
        pubID = element;
    } else {
        // ITS A BUTTON!
        pubID = $(element).data('index');
    }


    $.ajax({
        type: 'GET',
        //dataType: 'txt',
        url: 'http://' + window.location.host + '/getselectedpub/' + pubID,
        timeout: 5000,
        success: function(content, textStatus ){

            $("#selectedpubname").text(content.pubname);
            //$("#pubnameid").text("Inhalter der Datei");

            window.location.hash = '#' + content._id;
            console.log(content._id);

            selectedPaperID = content._id;
            
        },
        error: function(xhr, textStatus, errorThrown){
            console.error('publication couldnt be selected :^(');
        }
    });


}



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