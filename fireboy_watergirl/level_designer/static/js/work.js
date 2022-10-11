window.realCoordX = (k) => {
	return (k * 1024 / 27);
}
window.realCoordY = (k) => {
	return (k * 864 / 27);
}
var calc_em = (x,rc,flag = true) => {
	if(typeof(x) == 'object') {
		return (rc(x[0]) + x[1]) + (flag?'em':0);
	}
	return rc(x) + (flag?'em':0);
}
var trans_em = (x) => {
	if(typeof(x) == 'object') {
		return x;
	}
	return [x,0];
}
window.atlasFrame = (a,k) => {
	return './data/image-atlas.php?id=' + encodeURIComponent(window.selected_folder) + '&atlas=' + encodeURIComponent(a) + '&name=' + encodeURIComponent(k);
}
window.levelSprite = (t,l) => {
	return './data/level-sprite.php?id=' + encodeURIComponent(window.selected_folder) + '&temple=' + encodeURIComponent(t) + '&level=' + encodeURIComponent(l);
}
window.current_data = null;
window.findKV = (a,k,v,f = true) => {
	for(let i in a) {
		if(a[i][k] == v) {
			return (f ? a[i] : i);
		}
	}
	return undefined;
}

$mesh = $('.main-view');
var Work = {
	levelSprite: null,
	drawImage: function(src,left,top,width,height,cls="") {
		var $img = $('<img />').attr('src',src).css({
			'left': calc_em(left,realCoordX,true),
			'top': calc_em(top,realCoordY,true),
			'width': calc_em(width,realCoordX),
			'height': calc_em(height,realCoordY),
			'position': 'absolute',
		}).attr('class',cls);
		$mesh.append($img);
		$img.attr('ondragstart','return false;');
		return $img;
	},
	drawImageCenter: function(src,left,top,width,height,cls="") {
		left = trans_em(left);
		top = trans_em(top);
		width = trans_em(width);
		height = trans_em(height);
		return this.drawImage(
			src,
			[left[0]-width[0]/2,left[1]-width[1]/2],
			[top[0]-height[0]/2,top[1]-height[1]/2],
			width,height,
			cls
		);
	},
	drawText: function(text,left,top,size,cl="#FFF",cls="") {
		var $img = $('<span></span>').css({
			'left': calc_em(left,realCoordX),
			'top': calc_em(top,realCoordY),
			'color': cl,
			'position': 'absolute',
		}).attr('class',cls);
		$img.append($('<span></span>').text(text).css('font-size',calc_em(size,realCoordX)).css('vertical-align','middle'));
		$mesh.append($img);
		$img.attr('ondragstart','return false;');
		return $img;
	},
	drawTextCenter: function(text,left,top,size,cl="#FFF",cls="") {
		var $img = $('<span></span>').css({
			'left': calc_em(left,realCoordX),
			'top': calc_em(top,realCoordY),
			'color': cl,
			'position': 'absolute',
		}).attr('class',cls);
		$img.append($('<span></span>').text(text).css('font-size',calc_em(size,realCoordX)).css('vertical-align','middle'));
		$mesh.append($img);
		var meshsize = $mesh.css('font-size');
		meshsize = meshsize.substr(0,meshsize.length-2);
		var w = $img.width() / meshsize;
		var h = $img.height() / meshsize;
		left = trans_em(left);
		top = trans_em(top);
		$img.css({
			'left': calc_em([left[0],left[1]-w/2],realCoordX),
			'top': calc_em([top[0],top[1]-h/2],realCoordY),
		});
		$img.attr('ondragstart','return false;');
		return $img;
	},
	drawLine: function(p1x,p1y,p2x,p2y,width,cl='#FF0',cls="") {
		p1x = calc_em(p1x,realCoordX,false);
		p2x = calc_em(p2x,realCoordX,false);
		p1y = calc_em(p1y,realCoordY,false);
		p2y = calc_em(p2y,realCoordY,false);
		var midx = (p1x + p2x) / 2;
		var midy = (p1y + p2y) / 2;
		var len = Math.sqrt((p1x-p2x)**2 + (p1y-p2y)**2);
		midx -= len/2;
		var ang = 0;
		if(Math.abs(p1x - p2x) > Math.abs(p1y - p2y)) {
			ang = Math.atan((p1y-p2y) / (p1x-p2x)) * 180 / Math.PI;
		} else {
			ang = -270 - Math.atan((p1x-p2x) / (p1y-p2y)) * 180 / Math.PI;
		}
		var $img = $('<div></div>').css({
			'background-color': cl,
			'left': midx + 'em',
			'top': midy + 'em',
			'width': len + 'em',
			'height': width + 'em',
			'transform': 'rotate(' + ang + 'deg)',
			'margin-top': (-width/2) + 'em',
			'position': 'absolute',
		}).attr('class',cls);
		$mesh.append($img);
		return $img;
	},
	renderEdge: function(id) {
		var edge = findKV(current_data.edges,'id',id);
		var level1 = findKV(current_data.levels,'_id',edge.source);
		var level2 = findKV(current_data.levels,'_id',edge.target);
		var $img = this.drawLine(level1.x,level1.y,level2.x,level2.y,0.4,'#000','level-line-black').attr('data-connection',level1.id + '-' + level2.id).attr('data-link-source',level1.id).attr('data-link-target',level2.id);
		((id) => {
			$img.on('click',function(e) {
				Action.selectNode(id);
			});
		})(level1.id + '-' + level2.id);
		this.drawLine(level1.x,level1.y,level2.x,level2.y,0.2,'#FF0','level-line-white').attr('data-connection',level1.id + '-' + level2.id).css('pointer-events','none');
	},
	renderNode: function(id) {
		var level = findKV(current_data.levels,'id',id);

		var $img = this.drawImageCenter(this.levelSprite[level.type],
			level.x,level.y,[0,3],[0,3],'level-icon').attr('data-level-id',level.id).css('z-index',3 + 2 * findKV(current_data.levels,'id',id,false));
		((id) => {
			$img.on('click',function(e) {
				Action.selectNode(''+id);
			});
		})(level.id);
		this.drawTextCenter(level.id,level.x,level.y,[0,0.8],'#FFF','level-label').css('pointer-events','none').attr('data-level-id',level.id).css('z-index',4 + 2 * findKV(current_data.levels,'id',id,false));
	},
	renderTempleHall: async function(x,data) {
		$('.specific-panel').css('display','none');

		HTMLActuator.changeHubTitle('file-title','loading','正在加载');
		$mesh.text('正在加载...');
		try {
			window.current_data = await fetch_url('./data/temple-hall.php?id=' + selected_folder + '&temple=' + x.id);
		} catch(e) {
			HTMLActuator.changeHubTitle('file-title','failed',x.name + ' Hall');
			$mesh.text('加载失败');
			return false;
		}

		HTMLActuator.changeHubTitle('file-title','normal',x.name + ' Hall');
		$('.section-level-add').show();
		$('.section-level-quickedit').show();

		// 准备画布
		$('.main-view').html('');
		$mesh.css({
			width: realCoordX(1.0) + 'em',
			height: realCoordY(1.0) + 'em',
		});

		// 绘制背景图像
		this.drawImage(atlasFrame('Temples/' + x.id + '/TempleAssets','MenuBackground0000'),0,0,1,1);

		// 绘制连线
		edge_fid = 0;
		for(let i in current_data.edges) {
			var edge = current_data.edges[i];
			if((+edge._id) == (+edge._id)) {
				if(+edge._id >= edge_fid) {
					edge_fid = (+edge._id) + 1;
				}
			}
			var level1 = findKV(current_data.levels,'_id',edge.source);
			var level2 = findKV(current_data.levels,'_id',edge.target);
			current_data.edges[i].id = level1.id + '-' + level2.id;
			this.renderEdge(level1.id + '-' + level2.id);
		}

		// 绘制结点
		node_fid = 0;
		for(let i in current_data.levels) {
			var level = current_data.levels[i];
			if(+(level._id) == (+level._id)) {
				if(+level._id > node_fid - 1) {
					node_fid = (+level._id) + 1;
				}
			}
			if(!level.type) level.type = 'general';
			this.renderNode(level.id);
		}
		
		return true;
	},
	unRender: () => {
		$('.specific-panel').css('display','none');
		$mesh.text('未打开任何场景');
		HTMLActuator.changeHubTitle('file-title','disabled','空闲');
		$mesh.css({width:'unset',height:'unset'});
	}
};
