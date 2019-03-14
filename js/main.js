

/* Javascript by Chenxiao (Atlas) Guo, 2019 */

//calculate the radius of each proportional symbol
function calcPropRadius(attValue)
{
	//scale factor to adjust symbol size evenly
	var scaleFactor = 70;
	//area based on attribute value and scale factor
	var area = attValue * scaleFactor;
	//radius calculated based on area
	var radius = Math.sqrt(area / Math.PI);

	return radius + 0.5;
};

//function to convert markers to circle markers
function pointToLayer(map, feature, latlng, attributes)
{
	// Assign the current attribute based on the first index of the attributes array
	var attribute = attributes[0];

	//For each feature, determine its value for the selected attribute
	var attValue = Number(feature.properties[attribute]);

	//console.log(attValue);
	var options = {
		fillColor: "#FFFFFF",
		color: "#71d2ff",
		weight: 1.8,
		opacity: 0.5,
		fillOpacity: 0.2
	};

	//Give each feature's circle marker a radius based on its attribute value
	var radius = calcPropRadius(attValue);
	options.radius = radius;
	//create circle marker layer
	var layer = L.circleMarker(latlng, options);

	//add city to popup content string
	var popupContent = "<b>City:</b> " + feature.properties.City + "<br/>" +
		"<b>CBSA:</b> " + feature.properties.CBSA + "";

	//replace the layer popup
	layer.bindPopup(popupContent,
	{
		offset: new L.Point(0, -radius)
	});


	//event listeners to open popup on hover
	layer.on(
	{
		mouseover: function ()
		{
			this.openPopup();
		},
		mouseout: function ()
		{
			this.closePopup();
		},
		click: function ()
		{
			//			console.log("1");

			//build popup content string
			var popupContent = "";
			if (feature.properties)
			{
				// loop to add feature property names and values to html string

				//push each attribute name into attributes array
				popupContent = "";
				var dataPoints = [];
				for (var attribute in feature.properties)
				{
					//only take attributes with population values


					if (attribute.indexOf("all") < 0)
					{
						//attributes.push(attribute);
						popupContent += "<b>" + attribute + ":</b> " + feature.properties[attribute] + "<br/><br/>";
					}
					else
					{
						//popupContent += "<b>" + attribute.substring(4, 8) + ":</b> " + feature.properties[attribute] + "<br/>";
						dataPoints.push(
						{
							x: Number(attribute.substring(4, 8)),
							y: Number(feature.properties[attribute])
						});
					}

				};
				//console.log(dataPoints);

			}
			popupContent += "<b>Number of Historical Hurricanes Within the Core-Based Statistical Area (CBSA) by Decade:</b><br/><br/>"
			$("#panelContent").html(popupContent);

			var options = {

				animationEnabled: true,
				exportEnabled: false,
				data: [
				{
					type: "spline", //change it to line, area, column, pie, etc
					dataPoints: dataPoints
				}]
			};
			$("#chartContainer").CanvasJSChart(options);

			map.setView([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], map.getZoom() + 1);
		}
	});
	//return the circle marker to the L.geoJson pointToLayer option
	return layer;
};

// Add circle markers for point features to the map
function createPropSymbols(data, map, attributes)
{
	//create a Leaflet GeoJSON layer and add it to the map
	var cityLayer = L.geoJson(data,
	{
		pointToLayer: function (feature, latlng)
		{
			return pointToLayer(map, feature, latlng, attributes);
		}
	});

	cityLayer.addTo(map);
	return cityLayer;
};

// Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute)
{

	map.eachLayer(function (layer)
	{
		if (layer.feature && layer.feature.properties[attribute])
		{
			//access feature properties
			var props = layer.feature.properties;

			//update each feature's radius based on new attribute values
			var radius = calcPropRadius(props[attribute]);
			layer.setRadius(radius);
		};
	});
};

// Create new sequence controls
function createSequenceControls(map, attributes)
{
	var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            // ... initialize other DOM elements, add listeners, etc.
			//create range input element (slider)
			$(container).append('<input class="range-slider" type="range">');
			$(container).append('<button class="skip" id="reverse"><img src="img/reverse.png"></button>');
            $(container).append('<button class="skip" id="forward"><img src="img/forward.png"></button>');
			L.DomEvent.disableClickPropagation(container);
            return container;
        }
    });

    map.addControl(new SequenceControl());
	//set slider attributes
	$('.range-slider').attr(
	{
		max: 16,
		min: 0,
		value: 0,
		step: 1
	});

	//click listener for buttons
	$('.skip').click(function ()
	{
		//get the old index value
		var index = $('.range-slider').val();

		//Step 6: increment or decrement depending on button clicked
		if ($(this).attr('id') == 'forward')
		{
			index++;
			//Step 7: if past the last attribute, wrap around to first attribute
			index = index > 16 ? 0 : index;
		}
		else if ($(this).attr('id') == 'reverse')
		{
			index--;
			//Step 7: if past the first attribute, wrap around to last attribute
			index = index < 0 ? 16 : index;
		};

		// update slider
		$('.range-slider').val(index);
		// pass new attribute to update symbols
		$("#yearLabel").html("Hurricanes in " + (1850 + index * 10).toString() + " ~ " + (1860 + index * 10).toString());

		updatePropSymbols(map, attributes[index]);

	});

	// input listener for slider
	$('.range-slider').on('input', function ()
	{
		// get the new index value
		var index = $(this).val();
		// pass new attribute to update symbols
		$("#yearLabel").html("Hurricanes in " + (1850 + index * 10).toString() + " ~ " + (1860 + index * 10).toString());
		updatePropSymbols(map, attributes[index]);
	});
};

// build an attributes array from the data
function processData(data)
{
	//empty array to hold attributes
	var attributes = [];

	//properties of the first feature in the dataset
	var properties = data.features[0].properties;

	//push each attribute name into attributes array
	for (var attribute in properties)
	{
		//only take attributes with population values
		if (attribute.indexOf("all") > -1)
		{
			attributes.push(attribute);
		};
	};
	return attributes;
};

function getColor(d)
{
	return d >= 4 ? '#d73027' :
		d >= 3 ? '#fc8d59' :
		d >= 2 ? '#fee090' :
		d >= 1 ? '#e0f3f8' :
		d >= 0.00001 ? '#91bfdb' :
		'#4575b4';
}

function style(feature)
{
	//console.log(feature);
	return {
		fillColor: getColor(feature.properties.Average),
		weight: 3,
		opacity: 0.2,
		color: 'black',
		fillOpacity: 0.9
	};
}

function highlightFeature(e)
{
	var layer = e.target;

	layer.setStyle(
	{
		weight: 5,
		fillOpacity: 0.6
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge)
	{
		layer.bringToFront();
	}
}

function resetHighlight(e)
{
	var layer = e.target;

	layer.setStyle(
	{
		weight: 3,
		fillOpacity: 0.9
	});
}

function onEachFeature(feature, layer)
{
	//replace the layer popup
	//add city to popup content string
	var popupContent = "<b>CBSA:</b> " + feature.properties.NAME + "<br/>" +
		"<b>Annual Average Number of Huricanes:</b> " + feature.properties.Average;

	layer.bindPopup(popupContent,
	{
		offset: new L.Point(0, -5)
	});

	layer.on(
	{
		mouseover: function ()
		{
			this.openPopup();

		},
		mouseout: function ()
		{
			this.closePopup();

		},
		click: function ()
		{
			//console.log("2");
			if (feature.properties)
			{
				// loop to add feature property names and values to html string

				//push each attribute name into attributes array
				popupContent = "";

				popupContent += "<b>" + "CBSA" + ":</b> " + feature.properties.NAME + "<br/><br/>";
				popupContent += "<b>" + "Annual Average Number of Hurricanes" + ":</b> " + feature.properties.Average + "<br/><br/>";

				var dataPoints = [];
				var years=1850;
				for (var attribute in feature.properties)
				{
					//only take attributes with population values

					//console.log(attribute.indexOf("join"));
					//popupContent += "<b>" + attribute + ":</b> " + feature.properties[attribute] + "<br/><br/>";


					if (attribute.indexOf("join") != -1)
					{
						//popupContent += "<b>" + attribute.substring(4, 8) + ":</b> " + feature.properties[attribute] + "<br/>";
						dataPoints.push(
						{
							x: years,
							y: Number(feature.properties[attribute])
						});
						years+=10;
					}

				};
				//console.log(dataPoints);
			}

			popupContent += "<b>Decadal Number of Historical Hurricanes Within the Core-Based Statistical Area (CBSA):</b><br/><br/>"
			$("#panelContent").html(popupContent);

			var options = {

				animationEnabled: true,
				exportEnabled: false,
				data: [
				{
					type: "spline", //change it to line, area, column, pie, etc
					dataPoints: dataPoints
				}]
			};
			$("#chartContainer").CanvasJSChart(options);

			//map.setView([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], map.getZoom() + 1);
		}
	});

	layer.on(
	{
		mouseover: highlightFeature,
		mouseout: resetHighlight,
	});
}

//Import GeoJSON data
function getData(map)
{
	//load the data
	$.ajax("data/city.json",
	{
		dataType: "json",
		success: function (response)
		{
			var attributes = processData(response);

			//call function to create proportional symbols
			var cityLayer = createPropSymbols(response, map, attributes);
			createSequenceControls(map, attributes);

			$.ajax("data/cbsa_hurricanes.json",
			{
				dataType: "json",
				success: function (response)
				{
					var cbsaLayer = L.geoJson(response,
					{
						style: style,
						onEachFeature: onEachFeature
					});

					var Layers = {
						"City": cityLayer,
						"CBSA": cbsaLayer
					};

					L.control.layers(Layers).addTo(map);
				}
			});
		}
	});


};

// function to instantiate the Leaflet map
function createMap()
{
	// set map
	var map = L.map('map').setView([37, -90], 4);

	// add the dark matter map
	var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
	{
		attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: 19
	});

	CartoDB_DarkMatter.addTo(map);

	// call getData function
	getData(map);

	var legend = L.control(
	{
		position: 'bottomright'
	});

	legend.onAdd = function (map)
	{
		var div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 0.00001, 1, 2, 3, 4],
			labels = ["No Hurricane", "0~1", "1~2", "2~3", "3~4", "4~5"];

		// loop through our density intervals and generate a label with a colored square for each interval
		for (var i = 0; i < grades.length; i++)
		{
			div.innerHTML +=
				'<i style="background:' + getColor(grades[i]) + '"></i> ' +
				labels[i] + '<br>';
		}
		return div;
	};

	map.on('baselayerchange', function (e)
	{
		//var temp_yearLabel;
		if (e.name == "CBSA")
		{
			//temp_yearLabel=document.getElementById("yearLabel").textContent;
			$("#yearLabel").html("(Slider only available for cities)");
			//document.getElementById("slider").disabled = true;
			document.getElementsByClassName("sequence-control-container")[0].style.visibility = "hidden" ;
			//document.getElementById("forward").style.visibility = "hidden" ;
			//document.getElementById("panelStarter").style.visibility = "hidden";
			legend.addTo(map);
		}
		else
		{
			var index = document.getElementsByClassName("sequence-control-container")[0].value;
			$("#yearLabel").html("Slide to change the Decades");
			//document.getElementById("sequence-control-container").disabled = false;
			document.getElementsByClassName("sequence-control-container")[0].style.visibility = "visible";
			//document.getElementById("forward").style.visibility = "visible";
			//document.getElementById("panelStarter").style.visibility = "visible";
			legend.remove();
		}
	});
};

$(document).ready(createMap);
