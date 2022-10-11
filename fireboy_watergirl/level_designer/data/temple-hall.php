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

header('Content-Type: application/json');
if($_POST['saveData'] != 'yes') echo file_get_contents($json);
else {
	if($readOnly) {
		echo json_encode(['success' => false,'message' => '只读模式下不能保存']);
		exit;
	}

	$olddata = json_decode(file_get_contents($json),true);
	$newdata = json_decode($_POST['data'],true);

	$st = [];
	$st1 = [];
	$st2 = [];
	foreach($olddata['levels'] as $item) {
		if(!isset($st1[$item['filename']])) {
			$st1[$item['filename']] = true;
			if(!isset($st[$item['filename']])) $st[$item['filename']] = 0;
			$st[$item['filename']]--;
		}
	}
	foreach($newdata['levels'] as $item) {
		if(!isset($st2[$item['filename']])) {
			$st2[$item['filename']] = true;
			if(!isset($st[$item['filename']])) $st[$item['filename']] = 0;
			$st[$item['filename']]++;
		}
	}
	foreach($st as $filename => $flag) {
		if($flag < 0) {
			unlink($dirname . $filename);
		} else if($flag > 0) {
			if(!file_exists(dirname($dirname . $filename))) {
				mkdir(dirname($dirname . $filename),0777,true);
			}
			// 建立新关卡
			if(!file_exists($dirname . $filename)) {
				$bn = substr($filename,0,strrpos($filename,'.'));
				$ext = substr($filename,strrpos($filename,'.'));
				if(strpos($bn,'_') !== false && file_exists($dirname . substr($bn,0,strrpos($bn,'_')) . $ext)) {
					// 复制原关卡
					copy($dirname . substr($bn,0,strrpos($bn,'_')) . $ext, $dirname . $filename);
				} else {
					// 复制默认模板
					copy('example-level.json',$dirname . $filename);
				}
			}
		}
	}

	file_put_contents($json,$_POST['data']);

	echo json_encode(['success' => true]);
}
