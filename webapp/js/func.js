/**
*   @author     Moritz Migge, Timon Gottschlich, Marvin Gehrt, Tobias Steinblum
*   @version    1.0 
*/

"use strict";

var selectedPaperID;
var publicationArray = [];

$(document).ready(function() {

    toastr.options = {
    "closeButton": true,
    "showMethod": 'slideDown',
    "timeOut": 10000,
    "positionClass": 'toast-top-center'
    }
    toastr.info('Welcome to PaperBulb! PaperBulb is a platform to upload and view interactive scientific publications. To upload a publication please Login via Github in the Options menu. Have fun!')


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
        $('#loginButton').addClass('disabled');
        $('#loginButton').text('You are logged in!');
        toastr.success('Login successful!')
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
                    console.log('no specific publication loaded');
                } else {
                    loadPublication(selectedPaperID);
                    toastr.success('Specific publication loaded')
                }

            } else {
                toastr.info('No publications saved');
            }

        },
        error: function(xhr, textStatus, errorThrown){
            toastr.error('publication couldnt be loaded :^(')
        }
    });

    $('#newPubForm').ajaxForm({
        clearForm: true,
        dataType: 'json',
        type: 'POST',
        error: function(err) { toastr.error('couldnt add a new publication: ' + err) },
        success: function(content) {

            // add button to right sidebar
            $("#publicationlist").prepend('<tr><td><button data-index="' + content._id + '" onclick="loadPublication(this)" class="btn btn-default">'
               + content.pubname + " : " + content.authorname + " : " + content.releasedate +'</button> <br></td></tr>');
            $("#selectedpubname").text(content.pubname);
            toastr.success('Publication saved to db!')
            window.location.hash = '#close';
            window.location.hash = '#' + content._id;
        }
    });
}); // end document.ready()


function downloadPaper() {
    var url= 'http://' + window.location.host + '/download/';
    window.open(url + selectedPaperID);
    toastr.success('Download successful!')
}

window.onHashChange=function(){
    var hash = window.location.hash.slice(1);
    loadPublication(hash);
}

function helpLogin() {
    toastr.info('Click here to Login via Github to upload a publication to this platform.')
}

function helpDownload() {
    toastr.info('Click here to download the selected publication as a zipped file.')
}

function helpNewPub() {
    toastr.info('Click here to publish your publication after login.')
}

function helpList() {
    toastr.info('This is the list of all publications published to this platform. Click on one to display it.')
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
        return toastr.error('no publication selected')

    $.ajax({
        type: 'GET',
        url: 'http://' + window.location.host + '/getselectedpub/' + pubID,
        timeout: 5000,
        success: function(content, textStatus ){

            $("#selectedpubname").text(content.pubname);
            window.location.hash = '#' + content._id;
            toastr.info(content.pubname + ' selected')
            selectedPaperID = content._id;
            
            // iframe src attribut ändern zu /getpublicationHTML/<id>
            $('#pubnameid').attr('src', '/publications/' + content._id + '/paper.html');
            
        },
        error: function(xhr, textStatus, errorThrown){
            toastr.error('publication couldnt be selected :^(')
        }
    });


}