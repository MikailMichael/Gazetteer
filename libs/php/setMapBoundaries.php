<?php
	$executionStartTime = microtime(true);

	$countryData = json_decode(file_get_contents("../../countryBorders.geo.json"), true);

	foreach ($countryData['features'] as $feature) {
		if ($feature["properties"]["iso_a2"] == $_REQUEST['isoCode']) {
			$border = $feature;
		}
	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $border; 

	// Correct header information for JSON is set.	
	header('Content-Type: application/json; charset=UTF-8');

	// Output converted to JSON before sending
	echo json_encode($output); 

?>
