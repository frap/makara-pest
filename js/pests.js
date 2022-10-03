// Initialise leaflet.js
//var L = require('leaflet');

// Initialise the map
var map = L.map('map', {
  scrollWheelZoom: false
});

// set up leaf icons
var LeafIcon = L.Icon.extend({
    options: {
        shadowUrl: 'data/leaf-shadow.png',
        iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76]
    }
});

var greenLeaf = new LeafIcon({iconUrl: 'data/leaf-green.png'}),
    redLeaf = new LeafIcon({iconUrl: 'data/leaf-red.png'}),
    orangeLeaf = new LeafIcon({iconUrl: 'data/leaf-orange.png'});

// Set the position and zoom level of the map for Makara Peak
map.setView([-41.290158, 174.713345], 15);

/* Base Layers */
var esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var esri_WorldTerrain = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
	maxZoom: 13
});

var cycle_OSM = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
	maxZoom: 20,
	attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var thunderforest_OpenCycleMap = L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey={apikey}', {
	attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	apikey: '14d1c23f2adc41828d0519f830365211',
	maxZoom: 22
  });

var stamen_TerrainBackground = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 18,
	ext: 'png'
});

// Create base layers group object
var baseLayers = {
	  "Satellite": esri_WorldImagery,
//	  "World Terrain": esri_WorldTerrain,
    "Cycle OSM": cycle_OSM,
    "ThunderForest Cycle": thunderforest_OpenCycleMap
  //  "Statem Terrain": stamen_TerrainBackground
};

// Add baseLayers to the map
geojson = L.geoJson(pests, {
    style: style,
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, style );
    },
    onEachFeature: onEachFeature
}).addTo(map);

var overLayers = {
	"Leafy Pests":geojson
}

L.control.layers(baseLayers, overLayers).addTo(map);

// add the layer to the map
// map.addLayer(cycle_OSM);

// Create control that shows information on hover
var info = L.control({position:'topright'});

info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info');
	this.update();
	return this._div;
};

info.update = function (props) {
		this._div.innerHTML = '<p><b>Vegetation Pests</b></p>' +  (props ?
			                                             '<b>' + props.species + '</b><br />' + props.infestation_sqm + ' m<sup>2</sup> : '
			+ props.notes : 'Hover mouse over a Pesty tree ');
};
info.addTo(map);

function getIcon(feature) {
    switch (feature.properties.species) {
    case 'Wilding Pines and Conifers': return {icon: greenLeaf};
    case 'Tradescantia':   return {icon: redLeaf };
    default: return {icon: orangeLeaf}
    }
}

function getRadius(d) {
	return d > 99 ? 20 :
			d > 49  ? 16 :
			d > 29  ? 12 :
			d > 19  ? 8 :
			d > 9   ? 6 :
						4;
}

function getColour(d) {
	return d > 99 ? '#cef9b8' :
			d > 49  ? '#e9f9b8' :
			d > 29  ? '#f9eeb8' :
			d > 19   ? '#f9d3b8' :
			d > 9   ? '#f9b8b8' :
						'red';
}


/* Set of function for the hover over the geojson layer */
function style(feature) {
	  return {
    radius: getRadius(feature.properties.infestation_sqm),
		weight: 1,
		opacity: 0.7,
		color: 'black',
		dashArray: '2',
		fillOpacity: 0.7,
		fillColor: getColour(feature.properties.infestation_sqm)

	};
}

// var iconOptions = {
//     icon:    switch (feature.properties.species) {
//             case 'Wilding Pines and Conifers': return  greenLeaf;
//         case 'Tradescantia':   return  redLeaf ;
//         default: return  orangeLeaf ;
//         }
//     opacity: 0.8,
//     fillOpacity: 0.8
// };


function highlightFeature(e) {
	var layer = e.target;

	layer.setStyle({
		weight: 5,
		color: '#2770CA',
		dashArray: '',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}

	info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
	geojson.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}

var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("Coordinates: " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

	var div = L.DomUtil.create('div', 'info legend'),
		grades = [1, 10, 20, 30, 50, 100],
		labels = [],
		from, to;

	for (var i = 0; i < grades.length; i++) {
		from = grades[i];
		to = grades[i + 1];

		labels.push(
			'<i style="background:' + getColour(from + 1) + '"></i> ' +
			from + (to ? '&ndash;' + to : '+'));
	}

	div.innerHTML = labels.join('<br>');
	return div;
};

legend.addTo(map);
