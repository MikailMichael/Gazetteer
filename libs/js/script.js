/*********************************************/
/*            Initialize Leaflet             */
/*********************************************/

let map = L.map('map').setView([38.8951100, -77.0363700], 10);

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


/*********************************************/
/*    Executes api call for OpenCage API     */
/*********************************************/

// Sets Location
function setLocation(lat, lng) {
	$.ajax({
		url: "libs/php/reverseGeocode.php",
		type: 'POST',
		dataType: 'json',
		data: {
			lat: lat,
			lng: lng
		},
		// Output stored in the object result if successful
		success: function(result) {

			console.log(JSON.stringify(result["data"][0]["components"]));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.code == "200") {
				$('#country').html(result["data"][0]["components"]["country"]);
			}
      if (result["data"][0]["components"]["state"]) {
        $('#state').html(result["data"][0]["components"]["state"]);
      }
      if (result["data"][0]["components"]["city"]) {
        $('#city').html(result["data"][0]["components"]["city"]);
      }

      map.setView([lat, lng], 13);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Error has occured with call to OpenCage API.");
		}
	});
}

// Success function for retrieving current location
function success(pos) {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  console.log(`Latitude : ${lat}`);
  console.log(`Longitude: ${lng}`);
  console.log(`More or less ${pos.coords.accuracy} meters.`);
  setLocation(lat, lng);
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

/*********************************************/
/*              Temp Example                 */
/*********************************************/

/*
$('#btnTZ').click(function() {
	$.ajax({
		url: "libs/php/getTimeZoneInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			lat: $('#tzLat').val(),
			lng: $('#tzLng').val()
		},
		// Output stored in the object result if successful
		success: function(result) {

			console.log(JSON.stringify(result));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.name == "ok" && result.data.countryName) {
				$('#country').html(result['data']['countryName']);
				$('#offset').html(result['data']['gmtOffset']);
				$('#timezoneId').html(result['data']['timezoneId']);
				$('#time').html(result['data']['time']);
				$('#sunset').html(result['data']['sunset']);
			} else if (result.data.status) {
				$('#country').html(result['data']['status']["message"]);
				$('#offset').html('');
				$('#timezoneId').html('');
				$('#time').html('');
				$('#sunset').html('');
			} else {
				$('#country').html("The entered Longitude and Latitude values do not land in a country.");
				$('#offset').html(result['data']['gmtOffset']);
				$('#timezoneId').html('');
				$('#time').html('');
				$('#sunset').html('');
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
			console.log("Error has occured with call to API.");
		}
	});
});
*/