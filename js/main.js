/* Javascript by Chenxiao (Atlas) Guo, 2019 */

/* Map of GeoJSON data from MegaCities.geojson */

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

// function to attach popups to each mapped feature
function onEachFeature(feature, layer)
{
	// no property named popupContent; instead, create html string with all properties
	var popupContent = "";
	if (feature.properties)
	{
		// loop to add feature property names and values to html string
		for (var property in feature.properties)
		{
			popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
		}
		layer.bindPopup(popupContent);
	};
};

// function to retrieve the data and place it on the map
function getData(map)
{
	// load the data
	$.ajax("data/Irma_Track.geojson",
	{
		dataType: "json",
		success: function (response)
		{
			// create a Leaflet GeoJSON layer and add it to the map
			L.geoJson(response,
			{
                // attach popups
				onEachFeature: onEachFeature,

                // apply the circle marker
				pointToLayer: function (feature, latlng)
				{
                    // set color for scale
                    var SS = feature.properties.SS;
                    if ( SS == 5 ) fillColor = "#FF0000";
                         else if ( SS == 4 ) fillColor = "#FFA500";
                         else if ( SS == 3 ) fillColor = "#FFFF00";
                         else if ( SS == 2 ) fillColor = "#87CEFA";
                         else if ( SS == 1 ) fillColor = "#4169E1";
                         else fillColor = "#000080";

                    // create marker options to set size for intensity
                    var geojsonMarkerOptions = {
                        radius: feature.properties.INTENSITY/10,
                        fillColor: fillColor,
                        color: "#000",
                        weight: 1,
                        opacity: 0.5,
                        fillOpacity: 0.8
                    };
					return L.circleMarker(latlng, geojsonMarkerOptions);
				}
			}).addTo(map);
		}
	});
};

$(document).ready(createMap);
