<?php

function print_log($str) {
	print $str;
	print "\n";
}

if(!isset($argv[1])) {
	print_log('Usage: _extract_atlas <AtlasName>');
	exit;
}
if(!file_exists($argv[1] . '.json') || !file_exists($argv[1] . '.png')) {
	print_log('Error: Atlas does not exist');
	exit;
}

print_log('Extracting atlas ' . $argv[1]);

$fn = $argv[1];

$data = json_decode(file_get_contents($fn . '.json'),true)['frames'];
$img = imageCreateFromPNG($fn . '.png');

imageSaveAlpha($img,true);

print_log('Atlas has ' . count($data) . ' images');

if(!file_exists($fn)) {
	mkdir($fn . '/');
}

function imageCopyRegion($img,$rect) {
	$ret = imageCreateTrueColor($rect['width'],$rect['height']);
	imageSaveAlpha($ret,true);
	imageAlphaBlending($ret,true);
	imageFill($ret,0,0,0x7F000000);
	
	$isTransparent = true;
	for($i=0;$i<$rect['width'];$i++) {
		for($j=0;$j<$rect['height'];$j++) {
			$col = imageColorAt($img,$rect['x'] + $i, $rect['y'] + $j);
			imageSetPixel($ret, $i, $j, $col);
			if($col != 0x7F000000) {
				$isTransparent = false;
			}
		}
	}
	
	if($isTransparent) {
		imageFill($ret,0,0,0x7EFFFFFF);
		imageColorTransparent($ret, 0x7EFFFFFF);
		// imageLine($ret,0,0,$rect['width']-1,0, 0x00FF0000);
		// imageLine($ret,0,0,0,$rect['height']-1, 0x00FF0000);
		// imageLine($ret,$rect['width']-1,$rect['height']-1,$rect['width']-1,0, 0x00FF0000);
		// imageLine($ret,$rect['width']-1,$rect['height']-1,0,$rect['height']-1, 0x00FF0000);
		// imageLine($ret,0,0,$rect['width']-1,$rect['height']-1, 0x00FF0000);
		// imageLine($ret,$rect['width']-1,0,0,$rect['height']-1, 0x00FF0000);
	}
	return $ret;
}

foreach($data as $item) {
	$name = $item['filename'];
	$first_name = substr($name,0,strlen($name)-4);
	$last_name = substr($name,strlen($name)-4);
	$last_name = '' . intval($last_name);
	if($last_name == '0') {
		$last_name = '';
	}
	$name = $first_name . $last_name;
	
	print_log('- ' . $name);
	
	$dst = imageCopyRegion($img,[
		'x' => $item['frame']['x'],
		'y' => $item['frame']['y'],
		'width' => $item['frame']['w'],
		'height' => $item['frame']['h'],
	]);
	
	imageSaveAlpha($dst,true);
	
	imagePNG($dst,$fn . '/' . $name . '.png');
}
