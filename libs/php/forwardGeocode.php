<?php
	// Initiates error reporting, allows routines to be run in browser
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	// Creates url for the API call with the entered parameters, passed via data section in AJAX call in script.js
	$url='https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST['isoCode'] . '&countrycode=' . $_REQUEST['isoCode'] . '&key=c7986c6dae164f21b343df5549153a22';

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
	$output['data'] = $decode['results']; 
	// Correct header information for JSON is set.
	header('Content-Type: application/json; charset=UTF-8');
	// Output converted to JSON before sending
	echo json_encode($output); 

?>
