var async = require('async');
var exec = require('child_process').exec;

function convert(input_path_to_tif, output_path_folder, callback) {   // input_path_to_tif [Pfad, der zum hochgeladenen Tiff führt als String], output_path_folder [Pfad, an dem die Ausgabe (Eine Ordnerstruktur) gespeichert werden soll als String]
    //Spawne chilsprocesse zur Konvertierung des Koordinatensystems
     //Spawne chilsprocesse zur Zerlegung des Tiffs in Tiles
  var cmd = 'gdalwarp ' + input_path_to_tif + ' temp.tif -t_srs "EPSG:3857"';   //gdalwarp [gdal-Funktion], temp.tif [Gespeicherte Ausgabedatei], -t_srs "EPSG:3857" [Zielreferenzsystem (Mercator)]
  var cmd2 = 'gdal2tiles.py -p mercator -z 0-6 -w none temp.tif ' + output_path_folder; //gdal2tiles.py [Externes Zerlegungsskript], -p mercator [Referenzsystem], 0-15 [gewünschte Zoomstufen], -w none [Webviewer, würde eine neue Datei zum Betrachten des Ergebnisses anlegen], temp.tif [Input (Outputdatei von warp)]

  //Beginne Konvertierung
  async.series([
    // gdalwarp zur koordtransformation
    function(cb) { exec(cmd, cb); },
    // tif in tiles aufteilen
    function(cb) { exec(cmd2, cb); }
  ], callback);

};  // Schließe Funktion convert

module.exports = function tif2tiles(pathArray, callback) {
  async.eachSeries(pathArray, function(rasterPath, cb) {
    convert(rasterPath, rasterPath + '-tiles/', cb);
  }, callback);
}
