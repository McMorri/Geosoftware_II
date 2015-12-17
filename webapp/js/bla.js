/**
*   @author     Moritz Migge, Timon Gottschlich, Marvin Gehrt, Tobias Steinblum, Daniel Schäperklaus
*   @version    1.0 
*/

"use strict";


var publicationArray = [];

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
                $("#publicationlist").prepend('<tr><td><button data-index="' + (i+1) + '"onclick="loadPublication(this)" class="btn btn-default">' 
                    + content[i].pubname + " : " + content[i].authorname + " : " + content[i].releasedate.substring(0,10) + '</button> <br></td></tr>');
            }

            if (!window.location.hash) {
                window.location.hash = '#0';
                console.log('No Publications loaded');
            } else {
                loadPublication(getHash());
                console.log('Specific Publications loaded');
            }

        } else {
            console.log('No publication saved');
        }

    },
    error: function(xhr, textStatus, errorThrown){
        console.error('publication couldnt be loaded :^(');
    }
});


function download() {
    window.open('http://' + window.location.host + '/download?fileDownload=true');
}

function getHash(){
    return window.location.hash.slice(1);
}

window.onHashChange=function(){
    var hash = window.location.hash.slice(1);
    if (hash) loadPublication(getHash());
}



function newPublication() {
    bootbox.dialog({
        title: "Please enter details for your publication!",
        message: '<div class="input-group"><span class="input-group-addon" id="sizing-addon2">Publicationname</span><input id="pubname" type="text" class="form-control" placeholder="..." aria-describedby="sizing-addon2"></div>'
                    + '<br> <div class="input-group"><span class="input-group-addon" id="sizing-addon2">Authorname(s)</span><input id="authorname" type="text" class="form-control daypicker" placeholder="..." aria-describedby="sizing-addon2"></div>'
                    + '<br> <div class="input-group"><span class="input-group-addon" id="sizing-addon2">Releasedate of the publication</span><input id="releasedate" value="2015-09-07" type="text" class="form-control daypicker" placeholder="Form: YYYY-MM-DD" aria-describedby="sizing-addon2"></div>'
                    + '<br> <div> <input type="file" accept="*.tex" class="btn btn-default" onchange="Readdata(event)"> </div>',
                
        onEscape: function() {},
        buttons: {
            "Lets Go": {         
                callback: function(){
                    publicationArray.push({
                        pubname: $('#pubname').val(),
                        authorname: $('#authorname').val(),
                        releasedate: $('#releasedate').val(),
                    });


                    savePublication($("#pubname").val(),$("#authorname").val(),$("#releasedate").val());
                }
            }
        }
    });
}



function savePublication(pubname,authorname,releasedate){
    $.ajax({
        type: 'POST',
        data: {
            pubname:pubname,
            authorname:authorname,
            releasedate:releasedate
        },
        url: 'http://' + window.location.host + '/savepub',
        timeout: 5000,

        success: function(content, textStatus ){
            window.location.hash = '#' + content._id;
            
            $("#publicationlist").prepend('<tr><td><button data-index="' + ($("#publicationlist").length+1) + '" onclick="loadPublication(this)" class="btn btn-default">'
                                + content.pubname + " : " + content.authorname + " : " + content.releasedate.substring(0,10) +'</button> <br></td></tr>');

             console.log('publication saved to db!');
        },

        error: function(xhr, textStatus, errorThrown){
            console.error('publication save failed!');
        }
    });
}


function loadPublication(index){

    console.log("logger loadPublication");


    $.ajax({
        type: 'GET',
        //dataType: 'txt',
        url: 'http://' + window.location.host + '/getselectedpub',
        timeout: 5000,
        success: function(content, textStatus ){
            console.log("load pub does work")
            console.log(window.location.hash);
            window.location.hash = '#' + content._id;
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