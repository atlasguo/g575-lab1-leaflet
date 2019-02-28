/* Javascript by Chenxiao (Atlas) Guo, 2019 */

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 8;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "INTENSITY";

    // set color for scale
    var SS = feature.properties.SS;
    if ( SS == 5 ) fillColor = "#FF0000";
         else if ( SS == 4 ) fillColor = "#FFA500";
         else if ( SS == 3 ) fillColor = "#FFFF00";
         else if ( SS == 2 ) fillColor = "#87CEFA";
         else if ( SS == 1 ) fillColor = "#4169E1";
         else fillColor = "#000080";

    var options = {
        fillColor: fillColor,
        color: "#FFFFFF",
        weight: 1.5,
        opacity: 0.8,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "";
    if (feature.properties)
    {
        // loop to add feature property names and values to html string
        for (var property in feature.properties)
        {
            popupContent += "<p><b>" + property + ":</b> " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent,{
            offset: new L.Point(0,-options.radius)
        }); //bind the popup to the circle marker
    };

    //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
           $("#panel").html(popupContent);
       }
    });

    $("#panel").html("<br><b>Click Markers for More Information</b></br>");

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

// Add circle markers for point features to the map
function createPropSymbols(data, map){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};


//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/Irma_Track.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, map);
        }
    });
};

// function to instantiate the Leaflet map
function createMap()
{
    // set map
    var map = L.map('map').setView([25, -60], 4);

    // add the NASA Earth Night Map
    var NASAGIBS_ViirsEarthAtNight2012 = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
    	attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
    	bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
    	minZoom: 1,
    	maxZoom: 8,
    	format: 'jpg',
    	time: '',
    	tilematrixset: 'GoogleMapsCompatible_Level'
    });

    NASAGIBS_ViirsEarthAtNight2012.addTo(map);

	// call getData function
	getData(map);
};

$(document).ready(createMap);
