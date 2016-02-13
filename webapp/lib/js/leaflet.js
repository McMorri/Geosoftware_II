/**
* @desc   Alle nötigen Funktionalitäten zur Behandlung und Darstellungen von Tiff- und JSON-Dateien.
* @author Tobias Steinblum
* @date   2015-12-10
*/


"use strict";



var map;
var layerController;




/**
 * @desc Einladen verschiedener Basemaps für Leaflet, zwischen
*        denen der Nutzer wechseln kann.
 */
function loadMap(){
  //Basiseinstellungen für die Karte.
  map = L.map("leafletBox").setView([0.000000, 0.000000], 1);   //setView(Koordinaten, zoomstufe)

  //Verschiedene Basemaps hinzufügen.
  //Eine Karte mit Regionen und Staatsgrenzen.
  var Esri_NatGeoWorldMap = new L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	  maxZoom: 16
  });
  //Eine physische Karte.
  var Esri_WorldPhysical = new L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
	  attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
	  maxZoom: 8
  });
  //Satellitenbilder.
  var Esri_WorldImagery = new L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	   attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });
  //Terrain.
  var Esri_WorldTopoMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
	   attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
  });
  //Eine OSM-Karte.
  var OpenStreetMap_Mapnik = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	   maxZoom: 19,
	   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  // OPTIONAL: HIER UND EBENFALLS IN DER VARIABLEN baseMaps WEITERE BASEMAPS EINFÜGEN!

  //Initiale Basemap
  Esri_NatGeoWorldMap.addTo(map);


//Variable baseMaps enthält alle zuvor definierten Basemaps für Leaflet.
  var baseMaps = {
    "OpenStreetMap_Mapnik" : OpenStreetMap_Mapnik,
    "Esri_WorldTopoMap" : Esri_WorldTopoMap,
    "Esri_WorldImagery" : Esri_WorldImagery,
    "Esri_WorldPhysical" : Esri_WorldPhysical,
    "Esri_NatGeoWorldMap" : Esri_NatGeoWorldMap
  };


  // GeoJSON-Object-Layer hinzufügen.
  var JsonLayer = L.geoJson().addTo(map);



  //Alle zuvor definierten Layer zum Layercontroller hinzufügen, damit der
  //der Nutzer zwischen ihnen wechseln kann.
  layerController = L.control.layers(baseMaps).addTo(map);


  //Layer für die Darstellung des Inhaltes von Papern hinzufügen.
  var mapFeatures = new L.FeatureGroup();
  map.addLayer(mapFeatures);

};  //Funktion loadMap beenden.





/**
 * @desc Featurelayer zur Karte hinzufügen.
 */
function addDataToMap(data, map) {
    var dataLayer = L.geoJson(data);
    dataLayer.addTo(map);
}




// ----- Arbeit mit GeoJSON -----
// ----- Zeige JSONSs von der Datenbank in Leaflet -----
/**
 * @desc Den GeoJSON-Inhalt eines Papers auf der Karte darstellen.
 */
 function showJson(content){    //Variable content folgt dem Aufbau 'pfad/zur/datei.json'.
   //Einladen der Karten.
   loadMap();
   //Den Inhalt der gegebenen json-Datei einlesen und in Leaflet darstellen.
   $.getJSON(content , function(data) { addDataToMap(data, map); });
 };





// ----- Arbeit mit GeoTIFF -----
// ----- Zeige TIFFs von der Datenbank in Leaflet -----
/**
 * @desc Zeigt den Inhalt des GeoTIFF in Leaflet.
 */
function showTiff(file, title){    //Variable file folgt dem Aufbau 'pfad/zum/dateinamen/{z}/{x}/{y}.jpg'.
                                   //Die Endung '/{z}/{x}/{y}.jpg' ist wichtig, denn sie verweist auf die Ordnerstruktur, die die Bild-Tiles enthält.
                                   //Variable title ist ein String. Er wird unten rechts im Leaflet-Fenster als kurze Beschreibung dargestellt. Optional

   //Einladen der Karten.
  loadMap();

  var TiffContent = file;
  var text = title;

  //Füge das gewünschte Tiff in einem Tilelayer dem Leaflet-Fenster hinzu.
  var map = L.map('leafletBox').setView([0, 0], 2);
    L.tileLayer(TiffContent, {
      minZoom: 0,
      maxZoom: 15,
      attribution: text,
      tms: true
    }).addTo(map);
};
