/**
* @desc   All necessary leaflet-functions to handle with GeoJSON and GeoTIFF data from papers
* @author Tobias Steinblum
* @date   2015-12-10
*/


"use strict";



var map;
var layerController;




/**
 * @desc load a complete map set for the leafletBox including
 *       several basemaps for the user to switch.
 */
function loadMap(){
  //basic settings for the map
  map = L.map("leafletBox").setView([0.000000, 0.000000], 1);

  //Adding several basemaps for switching through to the map
  //A map with country boundaries
  var Esri_NatGeoWorldMap = new L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	  maxZoom: 16
  });
  //A physical map
  var Esri_WorldPhysical = new L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
	  attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
	  maxZoom: 8
  });
  //A map based on satellite pictures
  var Esri_WorldImagery = new L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	   attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });
  //A map showing the landscape relief
  var Thunderforest_Landscape = new L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
	   attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  //An OSM-map
  var OpenStreetMap_Mapnik = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	   maxZoom: 19,
	   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  //A map with transportation routes
  var Thunderforest_Transport = new L.tileLayer('http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png', {
	   attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	   maxZoom: 19
  });
  // OPTIONAL: ADD MORE BASEMAPS HERE AND ALSO IN THE VARIABLE baseMaps!

  //Defining the starting basemap
  Esri_NatGeoWorldMap.addTo(map);


//variable baseMaps contains all basemaps added to the map
  var baseMaps = {
    "OpenStreetMap_Mapnik" : OpenStreetMap_Mapnik,
    "Thunderforest_Transport" : Thunderforest_Transport,
    "Thunderforest_Landscape" : Thunderforest_Landscape,
    "Esri_WorldImagery" : Esri_WorldImagery,
    "Esri_WorldPhysical" : Esri_WorldPhysical,
    "Esri_NatGeoWorldMap" : Esri_NatGeoWorldMap
  };


  //Adding all defined layers to the layerController so that the user can switch between them
  layerController = L.control.layers(baseMaps).addTo(map);


  // Initialize the Layer for features from the paper
  var mapFeatures = new L.FeatureGroup();
  map.addLayer(mapFeatures);

};  //close function loadMap





/**
 * @desc Add feature-layer to the map
 * @param layer - layer with features to add to map
 * @param name - name for the layer in control box
 * @param featuregroup
 */
function addLayer(layer, name, featuregroup) {
     featuregroup.addLayer(layer)
     layerController.addOverlay(layer, name);
};



// ----- Working with GeoJSON -----
/**
 * @desc load the GeoJSON-content of the paper to the map
 * ? also SP data, after it was converted to JSON ? 
 */
function showJson(id){
  var url = 'http://' + window.location.host + "/getFeatures/" + id;
  loadMap();
  // add the json-objects from the url
  $.ajax({
    type: "GET",
    dataType: "json",
    url: url,
    timeout: 10000,
    success: function(content, textStatus){
      // remove existing items
      mapFeatures.eachLayer(function(layer){
         layerController.removeLayer(layer);
      });
      mapFeatures.clearLayers();

      //add feature layers to the map
      for (var i = 0; i < content.length; i++){
        addLayer(L.geoJson(content[i].data), content[i].name + " (database " + (i+1) + ")", mapFeatures);
      } //close for
    } //close success
  }); //close ajax

}; //close loading-function




// ----- Working with GeoTIFF -----
/**
 * @desc load the GeoTIFF-content of the paper to the leaflet-box
 */
function showTiff(){
  var map = L.map('leafletBox').setView([0, 0], 2);
    L.tileLayer([HIER_PFAD_ZUM_BILD_EINFUEGEN], {
      minZoom: 1,
      maxZoom: 6,
      attribution: "HIER NAMEN DES BILDES EINFUEGEN",
      tms: true
    }).addTo(map);
};