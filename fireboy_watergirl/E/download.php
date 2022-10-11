<?php

ini_set('memory_limit', '256M');

require('./config.php');

$data = json_decode(file_get_contents(DIR . 'resource-list.json'), true);

function stripQuery($f) {
	if(strpos($f,'?') === false) {
		return $f;
	}
	return substr($f,0,strpos($f,'?'));
}

function crawl_file($fn) {
	$url = PREFIX . $fn;
	$dst = DIR . 'dist/' . stripQuery($fn);
	$dir = dirname($dst);
	if(!file_exists($dir)) {
		mkdir($dir,0777,true);
	}
	file_put_contents($dst,file_get_contents($url));
	echo $fn . "\n";
}

function process_file($fn) {
	$fn = stripQuery($fn);
	$dst = DIR . 'dist/' . $fn;
	$cont = file_get_contents($dst);

	if($fn == 'gameIndex.html') {
		// Strip 4399's H5 API
		$cont = str_replace('<script src="http://h.api.4399.com/h5mini-2.0/h5api-interface.php"></script>','',$cont);
	}
	if(preg_match('/^js\/init\.(\w+)\.js$/',$fn)) {
		// Replacing domain limits
		$cont = str_replace('["4399.com","localhost"]','["4399.com","localhost","127.0.0.1","10.241.1.5"]',$cont);
	}

	file_put_contents($dst,$cont);
}

foreach($data['resource'] as $item) {
	crawl_file($item);
	process_file($item);
}
foreach($data['level'] as $item) {
	crawl_file($item);
}
