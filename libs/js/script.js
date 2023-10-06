// jQuery event handler on click
$('#btnRun').click(function() {
	// AJAX call to the PHP routine getCountryInfo.php, sets expected format of what returns to JSON, passes values of the selects as parameters coutnry and lang in the data property
	$.ajax({
		url: "libs/php/getCountryInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: $('#selCountry').val(),
			lang: $('#selLanguage').val()
		},
		// Output stored in the object result if successful
		success: function(result) {

			console.log(JSON.stringify(result));
			// If status is ok, data within result is writtin into the HTML using jQuery functions
			if (result.status.name == "ok") {

				$('#txtContinent').html(result['data'][0]['continent']);
				$('#txtCapital').html(result['data'][0]['capital']);
				$('#txtLanguages').html(result['data'][0]['languages']);
				$('#txtPopulation').html(result['data'][0]['population']);
				$('#txtArea').html(result['data'][0]['areaInSqKm']);

			}
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
		}
	}); 
	
});