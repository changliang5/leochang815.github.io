<?php

error_reporting(E_ALL & (~E_NOTICE));

$readOnly = false;

$id = $_GET['id'];
if(!$id) {
	die('no_id');
}
$data = json_decode(file_get_contents('folder-list.json'),true);

if(!isset($data[$id])) {
	die('wrong_id');
}

$dirname = '../' . $data[$id]['path'];

function find_temples($dir) {
	$ret = [];
	$arr = scandir($dir);
	$arr = array_slice($arr,2);

	foreach($arr as $item) {
		$fn = $dir . $item;
		if(!is_dir($fn) && $item == 'temple.json') {
			$ret[] = $item;
		}
		if(is_dir($fn)) {
			$res = find_temples($fn . '/');
			foreach($res as $result_item) {
				$ret[] = $item . '/' . $result_item;
			}
		}
	}

	return $ret;
}

$temple = $_GET['temple'];
if(!$temple) {
	die('no_temple');
}

$lst = find_temples($dirname);

$json = '';
foreach($lst as $item) {
	$fn = $dirname . $item;
	if(basename(dirname($fn)) == $temple) {
		$json = $fn;
		break;
	}
}
if(!$json) {
	die('temple_tan90');
}

$temple_data = json_decode(file_get_contents($json),true);

$level_id = $_GET['level'];
if(null === $level_id) {
	die('no_level');
}

$level_fn = '';
foreach($temple_data['levels'] as $level) {
	if($level['id'] == $level_id) {
		$level_fn = $level['filename'];
		break;
	}
}

if(!$level_fn) {
	die('level_tan90');
}

$cache_fn = 'level_sprite_cache/' . $id . '-' . $temple . '-' . $level_id . '.png';
if(file_exists($cache_fn)) {
	if(filemtime($cache_fn) >= max(filemtime(__FILE__), filemtime($dirname . $level_fn))) {
		header('Content-Type: image/png');
		echo file_get_contents($cache_fn);
		exit;
	}
}

$level_data = json_decode(file_get_contents($dirname . $level_fn),true);
$width = $level_data['width'];
$height = $level_data['height'];
$tile_size = 32;

function cl($arr) {
	return ($arr[0] << 16) | ($arr[1] << 8) | $arr[2];
}

$data_matrix = null;
header('Content-Type: image/png');
$img = imageCreateTrueColor($tile_size * $width, $tile_size * $height);
imageAlphaBlending($img,false);
imageFilledRectangle($img,0,0,$width*$tile_size-1,$height*$tile_size-1,127<<24);
imageAlphaBlending($img,true);

foreach($level_data['layers'] as $layer) {
	if($layer['name'] == 'Ground') {
		$data_matrix = $layer['data'];
	}
}

if(!$data_matrix) {
	imagePNG($img);
	exit;
}

$tile_delta = 0;
foreach($level_data['tilesets'] as $item) {
	if(strpos($item['source'],'Ground.json') !== false) {
		$tile_delta = 1 - $item['firstgid'];
		break;
	}
}

$i = 0;
$x = 0;
$y = 0;
$src = imageCreateFromPNG('Ground.png');
imageSaveAlpha($src,true);
while(isset($data_matrix[$i])) {
	$tile_type = $data_matrix[$i];
	if($tile_type >= 1 && $tile_type <= 15) {
		imageCopy($img,$src,$x*$tile_size,$y*$tile_size,$tile_size*($tile_type-1+$tile_delta),0,32,32);
	}
	
	$i++;
	$x++;
	if($x >= $width) {
		$x = 0;
		$y++;
		if($y >= $height) {
			break;
		}
	}
}
if(file_exists($cache_fn)) {
	unlink($cache_fn);
}
imageSaveAlpha($img,true);
imagePNG($img,$cache_fn);
imageSaveAlpha($img,true);
imagePNG($img);
