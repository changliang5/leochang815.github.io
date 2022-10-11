<?php

error_reporting(E_ALL & (~E_NOTICE));

$id = $_GET['id'];
if(!$id) {
	die('no_id');
}
$data = json_decode(file_get_contents('folder-list.json'),true);

if(!isset($data[$id])) {
	die('wrong_id');
}

$dirname = '../' . $data[$id]['path'];

$atlas = $_GET['atlas'];
if(!$atlas) {
	die('no_atlas');
}
if(strstr($atlas,'..')) {
	die('invalid_atlas');
}

$name = $_GET['name'];
if(!$name) {
	die('no_name');
}

header('Content-Type: image/png');
$cache_name = 'image_atlas_cache/' . str_replace('/','_',$_GET['id'] . '-' . $_GET['atlas'] . '-' . $_GET['name'] . '.png');

if(file_exists($cache_name)) {
	echo file_get_contents($cache_name);
} else {
	exit;
}

$filename = $dirname . '../assets/atlasses/' . $atlas;

if(!file_exists($filename . '.json') || !file_exists($filename . '.png')) {
	die('not_exist');
}

$atlas_meta = json_decode(file_get_contents($filename . '.json'),true);

$range = null;
foreach($atlas_meta['frames'] as $item) {
	if($item['filename'] == $name) {
		$range = $item['frame'];
		break;
	}
}

if(!$range) {
	die('not_match');
}

$src = imagecreatefrompng($filename . '.png');
imagesavealpha($src,true);
$dst = imagecrop($src,[
	'x' => $range['x'],
	'y' => $range['y'],
	'width' => $range['w'],
	'height' => $range['h']
]);
imagesavealpha($dst,true);
header('Content-Type: image/png');
imagepng($dst,$cache_name);
echo file_get_contents($cache_name);
