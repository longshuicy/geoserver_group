import 'ol/ol.css';
import Map from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import {fromLonLat} from "ol/proj";
import View from 'ol/View';
import {ATTRIBUTION as OSM_ATTRIBUTION} from "ol/source/OSM";
import XYZ from 'ol/source/XYZ';
import {GeoJSON, WFS} from 'ol/format';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {and, equalTo} from 'ol/format/filter';

// vectormap
var vectorSource = new VectorSource();
var vector = new VectorLayer({
    source: vectorSource,
});

// basemap
var raster = new TileLayer({
    source: new XYZ({
        url: "https://{a-d}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png",
        attributions: [
            "&#169; <a href=\"https://www.carto.com\">Carto</a>,",
            OSM_ATTRIBUTION
        ],
        maxZoom: 20,
    }),
});

var map = new Map({
    layers: [raster, vector],
    target: document.getElementById('map'),
    view: new View({
        projection: "EPSG:3857",
        center: fromLonLat([-94.4980, 37.0672]),
        maxZoom: 19,
        zoom: 12,
    }),
});

function filterFeatures(filter){
    // generate a GetFeature request
    var featureRequest = new WFS().writeGetFeature({
        srsName: 'EPSG:3857',
        featureNS: 'http://openstreemap.org',
        featurePrefix: 'incore',
        featureTypes: ['5f9091df3e86721ed82f701d'],
        outputFormat: 'application/json',
        filter: filter
    });

    // then post the request and add the received features to a layer
    fetch('https://incore-dev.ncsa.illinois.edu/geoserver/incore/ows', {
        method: 'POST',
        body: new XMLSerializer().serializeToString(featureRequest),
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            var features = new GeoJSON().readFeatures(json);
            vectorSource.clear();
            vectorSource.addFeatures(features);
            // map.getView().fit(vectorSource.getExtent());
        });
}


var archetypeSelect = document.getElementById("archetype");
archetypeSelect.onchange = function(){
    if (yearBuiltSelect.value !== "select"){
        var filter = and(
            equalTo("archetype", archetypeSelect.value),
            equalTo("year_built", yearBuiltSelect.value));
    }
    else{
        var filter = equalTo("archetype", archetypeSelect.value);
    }

    filterFeatures(filter);
}

var yearBuiltSelect = document.getElementById(("yearbuilt"));
yearBuiltSelect.onchange = function(){
    if (archetypeSelect.value !== "select"){
        var filter = and(
            equalTo("archetype", archetypeSelect.value),
            equalTo("year_built", yearBuiltSelect.value));
    }
    else{
        var filter = equalTo("year_built", yearBuiltSelect.value);
    }
    filterFeatures(filter);
}
