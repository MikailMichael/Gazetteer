<?php
	require_once __DIR__ . '/../../vendor/autoload.php';

	$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
	$dotenv->load();
	
	$apikey = $_ENV['API_KEY_RAPIDAPI2'];
	
	$executionStartTime = microtime(true);

	// Creates url for the API call with the entered parameters, passed via data section in AJAX call in script.js
	$url='https://countries-cities.p.rapidapi.com/location/country/' . $_REQUEST['isoCode'];

	// Init cURL obj, sets common parameters
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);
  	curl_setopt($ch, CURLOPT_HTTPHEADER, [
		"X-RapidAPI-Key: " . $apikey
	]);

	// Execute cURL obj, stores the results in $result
	$result = curl_exec($ch);

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
			if(!$decode['name']) {
				$output['status']['code'] = 404;
				$output['status']['name'] = "Failure - API";
				$output['status']['description'] = "No City Details Found.";
				$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
				$output['data'] = null;
			} else {
				$finalResult = [
					"capital" => $decode["capital"]["name"],
					"area_size" => $decode["area_size"],
					"phone_code" => $decode["phone_code"],
					"population" => $decode["population"],
					"flag" => $decode["flag"]["file"],
					"wikiLink" => $decode["wiki_url"],
					"continent" => $decode["continent"]["name"],
					"total_cities" => $decode["total_cities"],
					"name" => $decode["name"]
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
