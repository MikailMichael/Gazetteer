<?php
	$executionStartTime = microtime(true);

	// Creates url for the API call with the entered parameters, passed via data section in AJAX call in script.js
	$url='https://newsdata.io/api/1/news?apikey=pub_333409e4949c8327db04c8b442450c1b925e8&language=en&category=top&image=1&country=' . $_REQUEST['code'];

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
			if($decode['status'] == "error") {
				$output['status']['code'] = "404";
				$output['status']['name'] = "Failure - API";
				$output['status']['description'] = $decode["results"]['message'];
				$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
				$output['data'] = null;
			} else {
				foreach ($decode["results"] as $article) {
					$temp = null;
					$temp['image_url'] = $article["image_url"];
					$temp['title'] = $article["title"];
					$temp['link'] = $article["link"];
					$temp['source_id'] = $article["source_id"];
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
