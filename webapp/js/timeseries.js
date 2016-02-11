/**
* @desc   All necessary functions to plot timeseries with c3
* @author Marvin Gehrt
* @date   2016-02-05
*/


"use strict";

/**
* @desc   function that plots the timeseries data
*/
function plotTimeseries(htmlElement, filepath){
var chart = c3.generate({
    bindto: htmlElement,
    data: {
        url: filepath,
        type: 'line',
        x: 'Index'
    }
});
};


/**
* @desc  initialize timeseries after document is loaded
*/
$(document).ready(function() {

    $('.timeseries').each(function(i) {
        var file = '/publications/' + $(this).data('file');
        plotTimeseries('#' + $(this).attr('id'), file);
    });
});

