<?php
	// Initiates error reporting, allows routines to be run in browser
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	// Creates url for the API call with the entered parameters, passed via data section in AJAX call in script.js
	$url='https://countries-cities.p.rapidapi.com/location/country/' . $_REQUEST['isoCode'] . '/city/list?page=1&per_page=50&population=500000';

	// Init cURL obj, sets common parameters
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
		"X-RapidAPI-Key: a209d43d1fmsh36b88d05726ff8fp1143dejsn81cdfa9838ef"
	]);

	// Execute cURL obj, stores the results in $result
	$result=curl_exec($ch);

	curl_close($ch);

	// Decodes JSON as an 2D associative array, append it to output.
	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $decode; 
	// Correct header information for JSON is set.
	header('Content-Type: application/json; charset=UTF-8');
	// Output converted to JSON before sending
	echo json_encode($output); 

?>
