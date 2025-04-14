<?php
	require_once __DIR__ . '/../../vendor/autoload.php';

	$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
	$dotenv->load();
	
	$apikey = $_ENV['API_KEY_OPENCAGE'];

	$executionStartTime = microtime(true);

	// Creates url for the API call with the entered parameters, passed via data section in AJAX call in script.js
	$url='http://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST['lat'] . '+' . $_REQUEST['lng'] . '&key=' . $apikey;

	// Init cURL obj, sets common parameters
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	// Execute cURL obj, stores the results in $result
	$result=curl_exec($ch);

	$cURLERROR = curl_errno($ch);

	curl_close($ch);

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
			if($decode['status']['code'] != 200) {
				$output['status']['code'] = $decode['status']['code'];
				$output['status']['name'] = "Failure - API";
				$output['status']['description'] = $decode['status']['message'];
				$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
				$output['data'] = null;
			} else {
				$finalResult = [
					"country" => $decode["results"][0]["components"]["country"],
					"continent" => $decode["results"][0]["components"]["continent"],
					"countryCode" => $decode["results"][0]["components"]["ISO_3166-1_alpha-2"],
					"currency" => $decode["results"][0]["annotations"]["currency"]["name"],
					"currencyCode" => $decode["results"][0]["annotations"]["currency"]["iso_code"],
					"symbol" => $decode["results"][0]["annotations"]["currency"]["symbol"]
				];

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
