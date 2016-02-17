/**
* @desc   All necessary functions to plot timeseries with c3
* @author Marvin Gehrt
* @date   2016-02-05
*/


"use strict";

/**
* @desc	  function that plots the timeseries data
*/
function plotTimeseries(htmlElement, filepath){
//generate the chart
var chart = c3.generate({
    //show chart at the correct position within the generated html
    bindto: htmlElement,
    //load data from converted .csv file
    data: {
        url: filepath,
        type: 'line',
	    x: 'Index'
    },
    //enable zoom and rescale of the y axis
    zoom: {
        enabled: true,
        rescale: true
    },
    //enable pan
    pan: {
        enabled: true
    }
});
};


/**
* @desc	 initialize timeseries after document is loaded
*/
$(document).ready(function() {

    $('.timeseries').each(function(i) {
        var file = '/publications/' + $(this).data('file');
        plotTimeseries('#' + $(this).attr('id'), file);
    });
});

