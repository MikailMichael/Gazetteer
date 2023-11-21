/*********************************************/
/*            Initialize Leaflet             */
/*********************************************/

let map = L.map('map').setView([38.8951100, -77.0363700], 10);
let markersLayer = L.layerGroup(); // Layer for Markers

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.easyButton("fa-info fa-xl", function (btn, map) {
	$("#generalInfo").modal("show");
}).addTo(map);

L.easyButton("fa-solid fa-person fa-xl", function (btn, map) {
	$("#populationInfo").modal("show");
}).addTo(map);

L.easyButton("fa-solid fa-cloud-sun fa-xl", function (btn, map) {
	$("#weatherInfo").modal("show");
}).addTo(map);

L.easyButton("fa-solid fa-coins fa-xl", function (btn, map) {
	$("#currencyInfo").modal("show");
}).addTo(map);

L.easyButton("fa-solid fa-flag fa-xl", function (btn, map) {
	$("#flagInfo").modal("show");
}).addTo(map);

L.easyButton("fa-solid fa-link fa-xl", function (btn, map) {
	$("#wiki").modal("show");
}).addTo(map);


/*******************************************************/
/*    Executes OpenCage Reverse Geocoding API Call     */
/*******************************************************/

// Object with saved Country name and code to reduce API calls
let countryInfo = { name: "", code: "", lat: "", lng: "" };

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

			console.log(JSON.stringify(result["data"][0]["components"]["country"]));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
				$('#country').html(result["data"][0]["components"]["country"]);
        countryInfo.name = result["data"][0]["components"]["country"];
        $('#countryName').html(result["data"][0]["components"]["country"]);
        $('#continent').html(result["data"][0]["components"]["continent"]);
        $('#countryCode').html(result["data"][0]["components"]["ISO_3166-1_alpha-2"]);
        countryInfo.code = result["data"][0]["components"]["ISO_3166-1_alpha-2"];
        $('#timezone').html(result["data"][0]["annotations"]["timezone"]["short_name"]);
        $('#currency').html(result["data"][0]["annotations"]["currency"]["name"]);
        $('#currencyCode').html(result["data"][0]["annotations"]["currency"]["iso_code"]);
        $('#currencySymbol').html(result["data"][0]["annotations"]["currency"]["symbol"]);
      }
      if (result["data"][0]["components"]["state"]) {
        $('#state').html(result["data"][0]["components"]["state"]);
      } else {
		    $('#state').html("");
	    }
      if (result["data"][0]["components"]["city"]) {
        $('#city').html(result["data"][0]["components"]["city"]);
      } else {
        $('#city').html("");
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Error has occured with call to OpenCage API.");
		}
	});
}

// Success function for retrieving current location
function success(pos) {
  countryInfo.lat = pos.coords.latitude;
  countryInfo.lng = pos.coords.longitude;
  console.log(`Latitude : ${countryInfo.lat}`);
  console.log(`Longitude: ${countryInfo.lng}`);
  console.log(`More or less ${pos.coords.accuracy} meters.`);
  map.setView([countryInfo.lat,countryInfo.lng], 13);
  populate();
  apiCalls(countryInfo.lat, countryInfo.lng);
}

// Executes all APIs one after another

async function apiCalls (lat, lng) {
  await openCage(lat, lng);
  await countryDetails(countryInfo.code);
  await countryCities(countryInfo.code);
  await openWeather(lat, lng)
  await openExchangeRates();
}

// Error handling function for retrieving current location
function error(err) {
  console.log(`ERROR(${err.code}): ${err.message}`);
}

/***************************************************/
/* Executes preloader & retrieves current location */
/***************************************************/

$(window).on('load', function () {
  // Preloader
	if ($('#preloader').length) {
		$('#preloader').delay(1000).fadeOut('slow', function () {
			$(this).remove();
		});
	}

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
  $.ajax({
		url: "libs/php/populate.php",
		type: 'POST',
		dataType: 'json',
		data: {},
		// Output stored in the object result if successful
		success: function(result) {

			//console.log(JSON.stringify(result["data"]));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
      
			if (result.status.code == "200") {
        for (let i = 0; i < result["data"].length; i++) {
          select = selectStart + result["data"][i]["properties"]["iso_a2"] + selectMid + result["data"][i]["properties"]["name"] + selectEnd;
          $('#selectCountry').append(select);
        }
        $('#placeHolder').hide();
        $('#placeHolder').html('Choose a Country');
        
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Error has occured with call to populate routine.");
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

			console.log(JSON.stringify(result["data"]["capital"]["name"]));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
        $('#capital').html(result["data"]["capital"]["name"]);
        $('#size').html(result["data"]["area_size"]);
        $('#phoneCode').html(result["data"]["phone_code"]);
        $('#countryPop').html(result["data"]["population"]);
        $('#flag').attr("src", result["data"]["flag"]["file"]);
        $('#wikiLink').attr("href", result["data"]["wiki_url"]);
        $('#wikiLink').html(countryInfo.name);
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Error has occured with call to Countries & Cities - Country Details API.");
		}
	});
}

/***********************************************************/
/*    Function to add Markers for Metropolitan Cities      */
/***********************************************************/

function addCityMarker (lat, lng, name) {
  var marker = L.marker([lat, lng])
  markersLayer.addLayer(marker);
  map.addLayer(markersLayer);
  marker.bindPopup(name).openPopup();
}

/*****************************************************************/
/* Executes Countries & Cities - Cities in the Country API call  */
/*****************************************************************/

let tblRow = '';
const tblRowStart = '<tr class="tblRow"><td class="text-center"><i class="fa-solid fa-city fa-xl text-primary"></i></td><td>'
const tblRowMid = '</td><td class="text-end">'
const tblRowEnd = '</td></tr>';

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

			console.log(JSON.stringify(result["data"]["cities"][0]["name"]));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
        $('.tblRow').remove();
        if (map.hasLayer(markersLayer)) { 
          console.log("Clearing Marker Layers")
          markersLayer.clearLayers(); 
        }
        for(let i = 0; i < result["data"]["cities"].length; i++) {
          tblRow = tblRowStart + result["data"]["cities"][i]["name"] + tblRowMid + result["data"]["cities"][i]["population"] + tblRowEnd;
          $('#popTable').append(tblRow);
          addCityMarker(result["data"]["cities"][i]["latitude"], result["data"]["cities"][i]["longitude"], result["data"]["cities"][i]["name"]);
        }
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Error has occured with call to Countries & Cities - Cities in the Country API.");
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

			console.log(JSON.stringify(result["data"]["current"]));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
        $('#weather').html(result["data"]["current"]["weather"][0]["main"]);
        $('#weatherDescription').html(result["data"]["current"]["weather"][0]["description"]);
        $('#temperature').html((result["data"]["current"]["temp"] - 273.15).toFixed(2));
        $('#wind').html(result["data"]["current"]["wind_speed"]);
        $('#cloud').html(result["data"]["current"]["clouds"]);
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Error has occured with call to Open Weather API.");
		}
	});
  }

/************************************************/
/*    Executes Open Exchange Rates API call     */
/************************************************/

function openExchangeRates() {
	return $.ajax({
		url: "libs/php/openExchangeRates.php",
		type: 'POST',
		dataType: 'json',
		data: {
			
		},
		// Output stored in the object result if successful
		success: function(result) {

			console.log(JSON.stringify(result["data"]));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
        $('#exchangeRate').html((result["data"]["rates"]["GBP"]).toFixed(2));
      }
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Error has occured with call to Open Exchange Rates API.");
		}
	});
  }

/*********************************************/
/*           Selecting A Country             */
/*********************************************/

$('select').on("change", (event) => {
  console.log($(event.currentTarget).val());
  
  $.ajax({
		url: "libs/php/forwardGeocode.php",
		type: 'POST',
		dataType: 'json',
		data: {
			isoCode: $(event.currentTarget).val()
		},
		// Output stored in the object result if successful
		success: function(result) {

			console.log(JSON.stringify(result["data"][0]["geometry"]));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
        map.setView([result["data"][0]["geometry"]["lat"], result["data"][0]["geometry"]["lng"]], 5);
				apiCalls(result["data"][0]["geometry"]["lat"], result["data"][0]["geometry"]["lng"]);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
			console.log("Error has occured with call to Open Cage API, forward Geocode.");
		}
	});

});