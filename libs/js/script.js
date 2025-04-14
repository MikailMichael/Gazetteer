//require('dotenv').config();

/*********************************************/
/*            Initialize Leaflet             */
/*********************************************/

let selectedCountryLayer = L.layerGroup(); // Layer for Map Boundaries
let metroCityMarkers = L.markerClusterGroup();
let urbanCityMarkers = L.markerClusterGroup();
let airportMarkers = L.markerClusterGroup();

let streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

let satellite = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
});

let map = L.map('map', {
  center: [38.00000000, -97.00000000],
  zoom: 5,
  layers: [streets, selectedCountryLayer]
});

let baseMaps = {
  "Streets": streets,
  "Satellite": satellite
};

let overlayMaps = {
  "Metropolitan Cities":  metroCityMarkers,
  "Medium-size Urban Cities": urbanCityMarkers,
  "Airports": airportMarkers,
  "Country Borders": selectedCountryLayer
};

const layerControl  = L.control.layers(baseMaps, overlayMaps).addTo(map);

$(".leaflet-control-layers").addClass("text-start");

L.easyButton("fa-info fa-xl", function (btn, map) {
	$("#generalInfo").modal("show");
}).addTo(map);

L.easyButton("fa-solid fa-cloud-sun fa-xl", function (btn, map) {
	$("#weatherInfo").modal("show");
}).addTo(map);

L.easyButton("fa-solid fa-coins fa-xl", function (btn, map) {
	$("#currencyInfo").modal("show");
}).addTo(map);

L.easyButton("fa-solid fa-newspaper fa-xl", function (btn, map) {
	$("#news").modal("show");
}).addTo(map);

L.easyButton("fa-solid fa-link fa-xl", function (btn, map) {
	$("#wiki").modal("show");
}).addTo(map);

// Creating Custom Icons

let cityIcon = L.icon({
  iconUrl: 'assets/city-icon.png',
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [0, -40]
});

let smallCityIcon = L.icon({
  iconUrl: 'assets/small-city-icon.png',
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [0, -40]
});

let airplaneIcon = L.icon({
  iconUrl: 'assets/airplane.png',
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [0, -40]
});

/*******************************************************/
/*    Executes OpenCage Reverse Geocoding API Call     */
/*******************************************************/

// Sets Location
function openCage(lat, lng) {
	return $.ajax({
		url: "libs/php/reverseGeocode.php",
		type: 'POST',
		dataType: 'json',
		data: {
			lat: lat,
			lng: lng
		},
		// Output stored in the object result if successful
		success: function(result) {
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
				$('#country').html(result["data"]["country"]);
        $('#wikiLink').html(result["data"]["country"]);
        $('#countryName').html(result["data"]["country"]);
        $('#continent').html(result["data"]["continent"]);
        $('#countryCode').html(result["data"]["countryCode"]);
        $('#selectCountry').val(result["data"]["countryCode"]).attr("selected", true);
        $('#currency').html(result["data"]["currency"]);
        $('#currencyCode').html(result["data"]["currencyCode"]);
        $('#currencySymbol').html(result["data"]["symbol"]);
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			//console.log("Error has occured with call to OpenCage API.");
		}
	});
}

// Success function for retrieving current location
async function success(pos) {
  var lat = pos.coords.latitude;
  var lng = pos.coords.longitude;
  //console.log(`Latitude : ${lat}`);
  //console.log(`Longitude: ${lng}`);
  //console.log(`More or less ${pos.coords.accuracy} meters.`);
  await populate();
  await apiCalls(lat, lng);
}

// Executes all APIs one after another

async function apiCalls (lat, lng) {
  await openCage(lat, lng);
  await setMapBoundaries($("#selectCountry").val());
  await countryDetails($("#selectCountry").val());
  await countryCities($("#selectCountry").val());
  await airports($("#selectCountry").val());
  await smallCountryCities($("#selectCountry").val());
  await openWeather(lat, lng)
  await openExchangeRates($('#currencyCode').html());
  await newsData($("#selectCountry").val());
  $('#pre-load').addClass('fadeOut');
}

// Error handling function for retrieving current location
async function error(err) {
  //console.log(`ERROR(${err.code}): ${err.message}`);
  await populate();
  await apiCalls(38.00000000, -97.00000000);
}

/**************************************/
/*     Retrieves current location     */
/**************************************/

$(window).on('load', function () {
  // Retrieve user location
  navigator.geolocation.getCurrentPosition(success, error);
});

/****************************************************************/
/* Executes PHP routine to fill out Dropdown box with countries */
/****************************************************************/

let select = '';
const selectStart = '<option class="option" value="';
const selectMid = '">';
const selectEnd = '</option>';


function populate() {
  return $.ajax({
		url: "libs/php/populate.php",
		type: 'POST',
		dataType: 'json',
		data: {},
		// Output stored in the object result if successful
		success: function(result) {

			//console.log(JSON.stringify(result["data"]));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
      
			if (result.status.code == "200") {
        //console.log(result["data"]);

        for (let i = 0; i < result["data"].length; i++) {
          //console.log(countries[i]);
          select = selectStart + result["data"][i].code + selectMid + result["data"][i].name + selectEnd;
          $('#selectCountry').append(select);
        }
        
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			//console.log("Error has occured with call to populate routine.");
		}
	});
}

/************************************/
/*      Sets Map Boundaries         */
/************************************/

function setMapBoundaries(isoCode) {
  return $.ajax({
		url: "libs/php/setMapBoundaries.php",
		type: 'POST',
		dataType: 'json',
		data: {
      isoCode: isoCode
    },
		// Output stored in the object result if successful
		success: function(result) {

			//console.log(JSON.stringify("Drawing Map Boundaries for: " + $("#selectCountry").val()));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
        // Removes previous map Boundaries
        if (map.hasLayer(selectedCountryLayer)) {
          //console.log("Clearing Polygon Layer.");
          selectedCountryLayer.clearLayers();
        }
        //console.log(result["data"]);

        selectedCountryLayer = L.geoJSON(result["data"], {style: {
          "color": "#4B4",
          "weight": 3,
          "opacity": 0.65
        }});
        map.addLayer(selectedCountryLayer);
        map.fitBounds(selectedCountryLayer.getBounds())
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			//console.log("Error has occured with call to Countries & Cities - Country Details API.");
		}
	});
}

/*****************************************************************/
/*    Executes Countries & Cities - Country Details API call     */
/*****************************************************************/

function countryDetails(isoCode) {
  return $.ajax({
		url: "libs/php/countryDetails.php",
		type: 'POST',
		dataType: 'json',
		data: {
			isoCode: isoCode
		},
		// Output stored in the object result if successful
		success: function(result) {
      // If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
        $('#capital').html(result["data"]["capital"]);
        $('#weatherModalLabel').html(result["data"]["capital"] + ", " + result["data"]["name"]);
        var size = result["data"]["area_size"].replace(/[^\d-]/g, '');
        $('#size').html(numeral(size).format("0,0"));
        $('#phoneCode').html(result["data"]["phone_code"]);
        $('#countryPop').html(numeral(result["data"]["population"]).format("0,0"));
        $('#flag').attr("src", result["data"]["flag"]);
        $('#wikiLink').attr("href", result["data"]["wikiLink"]);
        $('#desc').html(result["data"]["name"] + " is a country located in the continent " + 
          result["data"]["continent"] + ", comprising of a population total of " + 
          numeral(result["data"]["population"]).format("0,0") + ". Its capital city is " +
          result["data"]["capital"] + ", and in total "+
          result["data"]["name"] + " has " + 
          numeral(result["data"]["total_cities"]).format("0,0") + " cities.")
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			//console.log("Error has occured with call to Countries & Cities - Country Details API.");
		}
	});
}

/*********************************************************/
/*    Function to add Markers for Cities & Airports      */
/*********************************************************/

function addCityMarker (lat, lng, name, pop) {
  var marker = L.marker([lat, lng], {icon: cityIcon});
  metroCityMarkers.addLayer(marker);
  map.addLayer(metroCityMarkers);
  marker.bindPopup("City: " + name + "<br/> Population: " + numeral(pop).format("0,0")).openPopup();
}

function addSmallCityMarker(lat, lng, name, pop) {
  var marker = L.marker([lat, lng], {icon: smallCityIcon});
  urbanCityMarkers.addLayer(marker);
  map.addLayer(urbanCityMarkers);
  marker.bindPopup("City: " + name + "<br/> Population: " + numeral(pop).format("0,0")).openPopup();
}

function addAirportMarker(lat, lng, name) {
  var marker = L.marker([lat, lng], {icon: airplaneIcon});
  airportMarkers.addLayer(marker);
  map.addLayer(airportMarkers);
  marker.bindPopup(name).openPopup();
}

/*****************************************************************/
/* Executes Countries & Cities - Cities in the Country API call  */
/*****************************************************************/

function countryCities(isoCode) {
  return $.ajax({
		url: "libs/php/countryCities.php",
		type: 'POST',
		dataType: 'json',
		data: {
			isoCode: isoCode
		},
		// Output stored in the object result if successful
		success: function(result) {
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
        if (map.hasLayer(metroCityMarkers)) { 
          //console.log("Clearing Matro Cities Marker Layers")
          metroCityMarkers.clearLayers(); 
        }

        for(let i = 0; i < result["data"].length; i++) {
            addCityMarker(result["data"][i]["lat"], result["data"][i]["lng"], result["data"][i]["name"], result["data"][i]["pop"]);
        }
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			//console.log("Error has occured with call to Countries & Cities - Cities in the Country API.");
		}
	});
}

/**************************************/
/* Executes Airport GeoJSON API call  */
/**************************************/

function airports(isoCode) {
  return $.ajax({
		url: "libs/php/airports.php",
		type: 'POST',
		dataType: 'json',
		data: {
			isoCode: isoCode
		},
		// Output stored in the object result if successful
		success: function(result) {
      //console.log(JSON.stringify("Found " + result["data"]["totalResultsCount"] + " number of airports in " + $("#selectCountry").val()));
	    // If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
        if (map.hasLayer(airportMarkers)) { 
          //console.log("Clearing Airport Markers Layers")
          airportMarkers.clearLayers(); 
        }
          for(let i = 0; i < result["data"].length; i++) {
            addAirportMarker(result["data"][i]["lat"], result["data"][i]["lng"], result["data"][i]["asciiName"]);
          }
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			//console.log("Error has occured with call to Aiport API.");     
		}
	});
}

/************************************************************************************/
/* Executes Countries & Cities - Cities in the Country API call for Smaller Cities  */
/************************************************************************************/

function smallCountryCities(isoCode) {
  return $.ajax({
		url: "libs/php/smallCountryCities.php",
		type: 'POST',
		dataType: 'json',
		data: {
			isoCode: isoCode
		},
		// Output stored in the object result if successful
		success: function(result) {
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
        if (map.hasLayer(urbanCityMarkers)) { 
          //console.log("Clearing Medium Urban Cities Marker Layers")
          urbanCityMarkers.clearLayers(); 
        }
          for(let i = 0; i < result["data"].length; i++) {
            if (result["data"][i]["pop"] < 500000) {
              addSmallCityMarker(result["data"][i]["lat"], result["data"][i]["lng"], result["data"][i]["name"], result["data"][i]["pop"]);
            }
          }
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			//console.log("Error has occured with call to Small Countries & Cities - Cities in the Country API.");
		}
	});
}

/*****************************************/
/*    Executes Open Weather API call     */
/*****************************************/

function openWeather(lat, lng) {
	return $.ajax({
		url: "libs/php/openWeather.php",
		type: 'POST',
		dataType: 'json',
		data: {
			lat: lat,
      lng: lng
		},
		// Output stored in the object result if successful
		success: function(result) {
      //const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      //const d = new Date();

			//console.log(JSON.stringify("Current Weather is: " + result["data"]["current"]["weather"][0]["main"]));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
        $('#weatherIcon').attr("src", "https://openweathermap.org/img/wn/" + result["data"][0]["icon"] + "@2x.png");
        $('#todayConditions').html(result["data"][0]["summary"]);
        $('#todayMaxTemp').html((result["data"][0]["temp-max"] - 273.15).toFixed(0));
        $('#todayMinTemp').html((result["data"][0]["temp-min"] - 273.15).toFixed(0));  

        $('#day1Date').html(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
        $('#weatherIcon1').attr("src", "https://openweathermap.org/img/wn/" + result["data"][1]["icon"] + "@2x.png");
        $('#day1MaxTemp').html((result["data"][1]["temp-max"] - 273.15).toFixed(0));
        $('#day1MinTemp').html((result["data"][1]["temp-min"] - 273.15).toFixed(0));  

        $('#day2Date').html(new Date(new Date().getTime() + 48 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))
        $('#weatherIcon2').attr("src", "https://openweathermap.org/img/wn/" + result["data"][2]["icon"] + "@2x.png");
        $('#day2MaxTemp').html((result["data"][2]["temp-max"] - 273.15).toFixed(0));
        $('#day2MinTemp').html((result["data"][2]["temp-min"] - 273.15).toFixed(0));  
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			//console.log("Error has occured with call to Open Weather API.");
		}
	});
}

/************************************************/
/*    Executes Open Exchange Rates API call     */
/************************************************/

function openExchangeRates(currencyCode) {
	return $.ajax({
		url: "libs/php/openExchangeRates.php",
		type: 'POST',
		dataType: 'json',
		data: {
			currencyCode: currencyCode
		},
		// Output stored in the object result if successful
		success: function(result) {
      //console.log(JSON.stringify("1 USD = " + result["data"]["rates"][$('#currencyCode').html()] + " " + $('#currencyCode').html()));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
        $('#exchangeRate').html((result["data"]).toFixed(2));
        $('#result').val(numeral(result["data"] * $('#amount').val()).format('0,0.00'));
        $('#convertTo').val($('#currency').html());
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			//console.log("Error has occured with call to Open Exchange Rates API.");
		}
	});
}

/*************************************/
/*    Executes News Data API call    */
/*************************************/

function newsData(code) {
  code = code.toLowerCase();
	return $.ajax({
		url: "libs/php/newsData.php",
		type: 'POST',
		dataType: 'json',
		data: {
			code: code
		},
		// Output stored in the object result if successful
		success: function(result) {
      if (result.status.code == "200") {
        $('#newsModalTitle').html("BREAKING NEWS");  
        $('#newsModal').empty();
        for (let i = 0; i < 4; i++) {
          if (i < result["data"].length) {
            let source = result["data"][i]["source_id"];
            source = source.charAt(0).toUpperCase() + source.slice(1);

            let entry = `<table class="newsEntry table table-borderless">
            <tr>
              <td rowspan="2" width="50%">
                <img class="img-fluid rounded newsImg" src="${result["data"][i]["image_url"]}';"  alt="" title="" onerror="this.src = 'https\:\/\/th.bing.com/th/id/R.18e9ab7a7c11eb89f2b06b285b1c1824?rik=uPBrSsIUBi5Kkg&pid=ImgRaw&r=0';">
              </td>
              <td>
                <a href="${result["data"][i]["link"]}" class="fw-bold fs-6 text-black" target="_blank">${result["data"][i]["title"]}</a>
              </td>
            </tr>                    
            <tr>          
              <td class="align-bottom pb-0">
                <p class="fw-light fs-6 mb-1">${source}</p>
              </td>            
            </tr>
            </table>`;
          
            if (i !== (result["data"].length - 1) && i !== (3)) {
              entry = entry + '<hr>';
            }

            $('#newsModal').append(entry);
          } 
        }
      }
      if (result.status.code == "404") {
        for (let i = 0; i < 4; i++) {
          $('#newsModal').empty();
          $('#newsModalTitle').html("No News Found");
        }
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			//console.log("Error has occured with call to Open Exchange Rates API.");
		}
	});
}

/************************************************/
/*    On Exchange Rates amount being changed    */
/************************************************/

$('#amount').on("keyup", () => {
  //console.log($('#amount').val());

  const result = $('#amount').val() * $('#exchangeRate').html();
  //console.log(result);
  let val = 0;
  if ($('#amount').val()) { val =  $('#amount').val(); } else { val = 0; }
  $('#result').val(numeral(result).format('0,0.00'));
});

/*********************************************/
/*           Selecting A Country             */
/*********************************************/

$('#selectCountry').on("change", (event) => {
  $('#pre-load').removeClass('fadeOut');
  //console.log($(event.currentTarget).val());
  //console.log($(event.target[event.target.selectedIndex]).text());
  $.ajax({
		url: "libs/php/forwardGeocode.php",
		type: 'POST',
		dataType: 'json',
		data: {
      name: $(event.target[event.target.selectedIndex]).text(),
			isoCode: $(event.currentTarget).val()
		},
		// Output stored in the object result if successful
		success: function(result) {
			//console.log(JSON.stringify(result["data"]));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
				apiCalls(result["data"]["lat"], result["data"]["lng"]);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
			//console.log("Error has occured with call to Open Cage API, forward Geocode.");
		}
	});

});