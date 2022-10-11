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
function firstupper($str) {
	$prev = ' ';
	for($i = 0; $i<strlen($str); $i++) {
		if($prev == ' ') {
			$str[$i] = strtoupper($str[$i]);
		}
		$prev = $str[$i];
	}
	return $str;
}

$temples = find_temples($dirname);

header('Content-Type: text/json');

$data = [];
foreach($temples as $item) {
	$temple_data = json_decode(file_get_contents($dirname . $item),true);
	$data[$temple_data['id']] = [
		'id' => $temple_data['id'],
		'name' => firstupper($temple_data['label']),
		'path' => $item,
	];
	$data[$temple_data['id']]['levels'] = [];
	foreach($temple_data['levels'] as $level_item) {
		$type = $level_item['type'];
		if(!$type) $type = 'general';
		$level_data = json_decode(file_get_contents($dirname . $level_item['filename']),true);
		$levelname = '关卡 ' . $level_item['id'];
		if($level_data['properties'] && $level_data['properties']['title']) $levelname = $level_data['properties']['title'];
		$data[$temple_data['id']]['levels'][$level_item['id']] = [
			'id' => $level_item['id'],
			'path' => $level_item['filename'],
			'type' => $type,
			'name' => $levelname,
			'size' => [$level_data['width'], $level_data['height']]
		];
	}
}

echo json_encode($data);
