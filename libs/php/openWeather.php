<?php
	$executionStartTime = microtime(true);

	// Creates url for the API call with the entered parameters, passed via data section in AJAX call in script.js
	$url='https://api.openweathermap.org/data/3.0/onecall?lat=' . $_REQUEST['lat'] . '&lon=' . $_REQUEST['lng'] . '&exclude=minutely,hourly,alerts&appid=e901305dcbd8c73cea96c1a966afff9a';

	// Init cURL obj, sets common parameters
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	// Execute cURL obj, stores the results in $result
	$result=curl_exec($ch);

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
			if(isset($decode['cod'])) {
				$output['status']['code'] = $decode['cod'];
				$output['status']['name'] = "Failure - API";
				$output['status']['description'] = $decode['message'];
				$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
				$output['data'] = null;
			} else {
				foreach ($decode["daily"] as $weather) {
					$temp = null;
					$temp['icon'] = $weather["weather"][0]["icon"];
					$temp['summary'] = $weather["summary"];
					$temp['temp-max'] = $weather["temp"]["max"];
					$temp['temp-min'] = $weather["temp"]["min"];
					$temp['dt'] = $weather["sunrise"];
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
