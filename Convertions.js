var express = require('express');
var async = require('async');
var app = express();


function convert(input_path_to_tif, output_path_folder) {   // input_path_to_tif [Pfad, der zum hochgeladenen Tiff führt als String], output_path_folder [Pfad, an dem die Ausgabe (Eine Ordnerstruktur) gespeichert werden soll als String]
  var warp = require('child_process').exec;   //Spawne chilsprocesse zur Konvertierung des Koordinatensystems
  var tile = require('child_process').exec;   //Spawne chilsprocesse zur Zerlegung des Tiffs in Tiles
  var cmd = 'gdalwarp ' + input_path_to_tif + ' temp.tif -t_srs "EPSG:3857"';   //gdalwarp [gdal-Funktion], temp.tif [Gespeicherte Ausgabedatei], -t_srs "EPSG:3857" [Zielreferenzsystem (Mercator)]
  var cmd2 = 'gdal2tiles.py -p mercator -z 0-15 -w none temp.tif ' + output_path_folder; //gdal2tiles.py [Externes Zerlegungsskript], -p mercator [Referenzsystem], 0-15 [gewünschte Zoomstufen], -w none [Webviewer, würde eine neue Datei zum Betrachten des Ergebnisses anlegen], temp.tif [Input (Outputdatei von warp)]

  //Beginne Konvertierung
  async.series({
      one: function(callback){warp(cmd, function(error, stdout, stderr) {}),  // Schritt 1: Änderung des Referenzsystems
          setTimeout(function(){
              callback(null, 1);
            }, 10000);  // Funktion selbst ruft nur Systemkommando auf. Daher wird Timeout zur Bewältigung benötigt, damit Funktion 2 nicht vor Bereitstellung des Ergebnisses startet.
          },
          two: function(callback){tile(cmd2, function(error, stdout, stderr) {})  // Schritt 2: Zerlegung des einen Bildes in Ordnerstruktur. Gewährleistet schnelles Laden der Bilder in Leaflet.
          setTimeout(function(){
              callback(null, 2);
            }, 100);
          } // Schließe Funktion 2
        }
      );  // Schließe async.series
    };  // Schließe Funktion convert



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});