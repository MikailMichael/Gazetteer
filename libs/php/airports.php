<?php
	$executionStartTime = microtime(true);

	// Creates url for the API call with the entered parameters, passed via data section in AJAX call in script.js
	$url='http://api.geonames.org/searchJSON?formatted=true&q=airport&maxRows=20&lang=en&country=' . $_REQUEST['isoCode'] . '&username=flightltd&style=full';

	// Init cURL obj, sets common parameters
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	// Execute cURL obj, stores the results in $result
	$result = curl_exec($ch);

	$cURLERROR = curl_errno($ch);

	curl_close($ch);

	$finalResult = [];

	if ($cURLERROR) {

		$output['status']['code'] = $cURLERROR;
		$output['status']['name'] = "Failure - cURL";
		$output['status']['description'] = curl_strerror($cURLERROR);
		$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
		$output['data'] = null;
	
	  } else {
		$decode = json_decode($result,true);

		if (json_last_error() !== JSON_ERROR_NONE) {
			$output['status']['code'] = json_last_error();
			$output['status']['name'] = "Failure - JSON";
			$output['status']['description'] = json_last_error_msg();
			$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
			$output['data'] = null;			 
		} else {
			if (isset($decode['status'])) {
				$output['status']['code'] = $decode['status']["value"];
				$output['status']['name'] = "Failure - API";
				$output['status']['description'] = $weather['status']['message'];
				$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
				$output['data'] = null;
			} else {
				foreach ($decode["geonames"] as $airport) {
					$temp = null;
					$temp['lat'] = $airport["lat"];
					$temp['lng'] = $airport["lng"];
					$temp['asciiName'] = $airport["asciiName"];
					array_push($finalResult, $temp);
				}

				$output['status']['code'] = "200";
				$output['status']['name'] = "ok";
				$output['status']['description'] = "success";
				$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
				$output['data'] = $finalResult; 
			}
		} 
	  }

	// Correct header information for JSON is set.
	header('Content-Type: application/json; charset=UTF-8');

	// Output converted to JSON before sending
	echo json_encode($output); 

?>
