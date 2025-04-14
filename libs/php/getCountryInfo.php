<?php
	require_once __DIR__ . '/../../vendor/autoload.php';

	$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
	$dotenv->load();
	
	$apikey = $_ENV['API_KEY_GEONAMES'];

	// Initiates error reporting, allows routines to be run in browser
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	// Creates url for the API call with the entered parameters, passed via data section in AJAX call in script.js
	$url='http://api.geonames.org/countryInfoJSON?formatted=true&lang=' . $_REQUEST['lang'] . '&country=' . $_REQUEST['country'] . '&username=' . $apikey . '&style=full';

	// Init cURL obj, sets common parameters
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	// Execute cURL obj, stores the results in $result
	$result=curl_exec($ch);

	curl_close($ch);

	// Decodes JSON as an 2D associative array, append it to output.
	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $decode['geonames']; // geonames property stored in data
	// Correct header information for JSON is set.
	header('Content-Type: application/json; charset=UTF-8');
	// Output converted to JSON before sending
	echo json_encode($output); 

?>
