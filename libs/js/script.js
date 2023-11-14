
$(window).on('load', function () {
	if ($('#preloader').length) {
		$('#preloader').delay(1000).fadeOut('slow', function () {
			$(this).remove();
		});
	}
});
/*********************************************/
/*    Executes api call for Timezone api     */
/*********************************************/
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

/*********************************************/
/*     Executes api call for Ocean api       */
/*********************************************/
$('#btnOcean').click(function() {
	$.ajax({
		url: "libs/php/getOceanInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			lat: $('#oceanLat').val(),
			lng: $('#oceanLng').val()
		},
		// Output stored in the object result if successful
		success: function(result) {

			console.log(JSON.stringify(result));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.name == "ok" && result.data.ocean) {
				$('#name').html(result['data']['ocean']['name']);
				$('#distance').html(result['data']['ocean']['distance']);
				$('#geonameId').html(result['data']['ocean']['geonameId']);
			} else if (result.data.status) {
				$('#name').html(result['data']['status']["message"]);
				$('#distance').html('');
				$('#geonameId').html('');
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
			console.log("Error has occured with call to API.");
		}
	});
});

/*********************************************/
/*   Executes api call for Earthquake api    */
/*********************************************/
$('#btnQuake').click(function() {
	$.ajax({
		url: "libs/php/getQuakeInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			north: $('#north').val(),
			south: $('#south').val(),
			east: $('#east').val(),
			west: $('#west').val()
		},
		// Output stored in the object result if successful
		success: function(result) {

			console.log(JSON.stringify(result));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.name == "ok" && result.data.earthquakes[0]) {
				$('#firstMag').html(result['data']['earthquakes'][0]['magnitude']);
				$('#firstDate').html(result['data']['earthquakes'][0]['datetime']);
				$('#secondMag').html(result['data']['earthquakes'][1]['magnitude']);
				$('#secondDate').html(result['data']['earthquakes'][1]['datetime']);
				$('#thirdMag').html(result['data']['earthquakes'][2]['magnitude']);
				$('#thirdDate').html(result['data']['earthquakes'][2]['datetime']);	
			} else if (!result.data.earthquakes[0]) {
				$('#firstMag').html('');
				$('#firstDate').html('There are no recorded earthquakes in the set area.');
				$('#secondMag').html('');
				$('#secondDate').html('');
				$('#thirdMag').html('');
				$('#thirdDate').html('');	
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
			console.log("Error has occured with call to API.");
		}
	});
});