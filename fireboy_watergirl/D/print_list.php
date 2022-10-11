<?php

ini_set('memory_limit', '256M');

require('./config.php');

$data = json_decode(file_get_contents(DIR . HAR), true);

$list = [];
$hashlist = [];
$list['resource'] = [];
$list['level'] = [];
$temple = [];

foreach($data['log']['entries'] as $req_id => $item) {
	$url = $item['request']['url'];
	if(substr($url,0,strlen(PREFIX)) == PREFIX) {
		$url = substr($url,strlen(PREFIX));
		if(strpos($url,'/levels/') === false) {
			if(!isset($hashlist[$url])) {
				$list['resource'][] = $url;
				$hashlist[$url] = true;
			}
		}
		if(strpos($url,'/temple.json') !== false) {
			@$temple = base64_decode($item['response']['content']['text']);
			@$temple = json_decode($temple,true);
			if(!is_array($temple)) {
				echo "Failed to get temple!\n";
				exit(1);
			}
		}
	}
}

foreach($temple['levels'] as $item) {
	$list['level'][] = 'data/' . $item['filename'];
}

file_put_contents(DIR . 'resource-list.json', json_encode($list, JSON_PRETTY_PRINT + JSON_UNESCAPED_SLASHES));
