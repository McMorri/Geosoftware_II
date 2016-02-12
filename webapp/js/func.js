/**
*   @author     Moritz Migge, Timon Gottschlich, Marvin Gehrt, Tobias Steinblum
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
    url: location.origin + '/isLoggedIn',
    type: 'GET',
    success: function(content, textStatus) {
      if (content) {
        $('#newPubli').removeClass('disabled');
        $('#loginButton').text('You are logged in!');
        }
    }
    });



    $.ajax({
        type: 'GET',
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

    $('#newPubForm').ajaxForm({
        clearForm: true,
        dataType: 'json',
        type: 'POST',
        error: function(err) { console.error('couldnt add a new publication: ' + err) },
        success: function(content) {

            // add button to right sidebar
            $("#publicationlist").prepend('<tr><td><button data-index="' + content._id + '" onclick="loadPublication(this)" class="btn btn-default">'
               + content.pubname + " : " + content.authorname + " : " + content.releasedate +'</button> <br></td></tr>');
            $("#selectedpubname").text(content.pubname);
            console.log('publication saved to db!');
            window.location.hash = '#close';
            window.location.hash = '#' + content._id;
        }
    });
}); // end document.ready()


function downloadPaper() {
    var url= 'http://' + window.location.host + '/download/';
    window.open(url + selectedPaperID);
}

window.onHashChange=function(){
    var hash = window.location.hash.slice(1);
    loadPublication(hash);
}


// accepts a button from the right sidebar or a string containing the ID
function loadPublication(element){

    var pubID;
    if (typeof element == "string") {
        pubID = element.slice(1);
    } else {
        // ITS A BUTTON!
        pubID = $(element).data('index');
    }

    var hashExceptions = ['newPubModal', 'close', '']
    if (hashExceptions.indexOf(pubID) !== -1) 
        return console.error('no publication selected');

    $.ajax({
        type: 'GET',
        url: 'http://' + window.location.host + '/getselectedpub/' + pubID,
        timeout: 5000,
        success: function(content, textStatus ){

            $("#selectedpubname").text(content.pubname);
            window.location.hash = '#' + content._id;
            console.log(content._id);
            selectedPaperID = content._id;
            
            // iframe src attribut ändern zu /getpublicationHTML/<id>
            $('#pubnameid').attr('src', '/publications/' + content._id + '/paper.html');
            
        },
        error: function(xhr, textStatus, errorThrown){
            console.error('publication couldnt be selected :^(');
        }
    });


}