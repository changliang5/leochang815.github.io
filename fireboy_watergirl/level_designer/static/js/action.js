window.Action = null;
window.level_list = null;
window.selected_folder = null;
window.selected_temple = null;
window.selected_node = null;
window.node_fid = 0;
window.edge_fid = 0;
window.has_pending_changes = false;
window.fetch_url = (x) => {
	return new Promise((resolve,reject) => {
		$.ajax({
			dataType: 'json',
			method: 'GET',
			timeout: 7000,
			url: x,
			success: (e) => {
				resolve(e);
			},
			error: (e) => {
				reject(e);
			}
		});
	})
};
window.post_data = (x,y) => {
	return new Promise((resolve,reject) => {
		$.ajax({
			dataType: 'json',
			method: 'POST',
			timeout: 7000,
			url: x,
			data: y,
			success: (e) => {
				resolve(e);
			},
			error: (e) => {
				reject(e);
			}
		});
	})
}
window.set_select = (ele,v) => {
	$('option',ele).each(function(){
		if($(this).attr('value') == v) {
			$(this).attr('selected','selected');
		} else {
			$(this).removeAttr('selected');
		}
	});
	$(ele).val(v);
}
(() => {
	window.Action = {
		init: () => {
			$('.ins-level-list').html('点击上方标题选取文件夹。');
		},
		checkPending: async () => {
			if(has_pending_changes) {
				if(!await modal_confirm_p('更改未提交','你确定要<strong>放弃更改</strong>？')) {
					return false;
				}
				has_pending_changes = false;
				$('.submit-changes').hide();
			}
			return true;
		},
		pushPending: async () => {
			has_pending_changes = true;
			$('.submit-changes').show();
		},
		submitChanges: async () => {
			var temple = selected_temple;

			var modal_id = modal_loading('正在提交');
			try {
				var res = await post_data('./data/temple-hall.php?id=' + selected_folder + '&temple=' + temple, {
					saveData: 'yes',
					data: JSON.stringify(current_data)
				});
			} catch(err) {
				close_modal(modal_id);
				modal_alert('出问题了','无法提交更改');
				return;
			}
			close_modal(modal_id);
			if(!res.success) {
				modal_alert('出问题了','无法提交更改<br>' + res.message);
				return;
			}

			has_pending_changes = false;
			$('.submit-changes').hide();

			var suc = await Action.loadFolder(selected_folder);
			if(suc) await Action.openTempleHall(level_list[selected_temple]);
		},
		loadFolder: async function(x) {
			if(!await this.checkPending()) return false;
			
			this.resetMenu();
			Work.unRender();
			
			var data = null;
			HTMLActuator.changeHubTitle('level-list-title','loading','正在获取');
			HTMLActuator.disableFolder();
			$('.ins-level-list').html('正在加载...');
			window.selected_folder = x;
			try {
				window.level_list = await fetch_url('./data/level-list.php?id=' + x);
			} catch(err) {
				HTMLActuator.enableFolder();
				HTMLActuator.changeHubTitle('level-list-title','failed','请选择文件夹');
				$('.ins-level-list').html('似乎出了亿点小问题。重试？');
				return false;
			}
			HTMLActuator.enableFolder();
			HTMLActuator.changeHubTitle('level-list-title','normal',folder_list[x].name);
			$('.ins-level-list').html('');

			Work.levelSprite = {
				general: atlasFrame('PopupAssets','FinishStone0000'),
				speed: atlasFrame('PopupAssets','FinishStoneSpeed0000'),
				puzzle: atlasFrame('PopupAssets','FinishStonePuzzle0000'),
				dark: atlasFrame('PopupAssets','FinishStoneDark0000'),
			};

			HTMLActuator.pushLevelList(window.level_list);
			return true;
		},
		openTempleHall: async function(x) {
			if(!await this.checkPending()) return;
			this.resetMenu();
			selected_node = null;
			window.selected_temple = x.id;
			if(await Work.renderTempleHall(x)) {
				if(!localStorage[folder_list[selected_folder].data]) {
					return;
				}
				var userdata = JSON.parse(localStorage[folder_list[selected_folder].data]);
				if(!findKV(userdata.temples,'id',selected_temple)) {
					return;
				}
				var levelist = findKV(userdata.temples,'id',selected_temple).levels;
				for(let i in levelist) {
					var level = levelist[i];
					if(undefined === findKV(current_data.levels,'id',level.id,false) || (level.type !== undefined && findKV(current_data.levels,'id',level.id,true).type != level.type)) {
						$('.section-level-fix').show();
						break;
					}
				}
				var edgelist = findKV(userdata.temples,'id',selected_temple).edges;
				for(let i in edgelist) {
					var edge = edgelist[i];
					if(undefined === findKV(current_data.levels,'_id',edge.source,false)
						|| undefined === findKV(current_data.levels,'_id',edge.target,false)
						|| undefined === findKV(current_data.edges,'_id',edge._id)) {
						$('.section-level-fix').show();
						break;
					}
				}
			}
		},
		fixProgressData: function() {
			var userdata = JSON.parse(localStorage[folder_list[selected_folder].data]);
			var levelist = findKV(userdata.temples,'id',selected_temple).levels;
			var rem_list = [];
			for(let i in levelist) {
				var level = levelist[i];
				if(undefined === findKV(current_data.levels,'id',level.id,false)) {
					rem_list.push(i);
				} else {
					var lvl = findKV(current_data.levels,'id',level.id,true);
					level.time = lvl.time;
					level.mobileTime = lvl.mobileTime;
					level.type = lvl.type;
				}
			}
			for(let i=rem_list.length-1;i>=0;i--) {
				levelist.splice(rem_list[i],1);
			}
			rem_list = [];
			var edgelist = findKV(userdata.temples,'id',selected_temple).edges;
			for(let i in edgelist) {
				var edge = edgelist[i];
				if(undefined === findKV(current_data.levels,'_id',edge.source,false)
					|| undefined === findKV(current_data.levels,'_id',edge.target,false)
					|| undefined === findKV(current_data.edges,'_id',edge._id)) {
					rem_list.push(i);
				}
			}
			for(let i=rem_list.length-1;i>=0;i--) {
				edgelist.splice(rem_list[i],1);
			}
			console.log(userdata);
			localStorage[folder_list[selected_folder].data] = JSON.stringify(userdata);
			$('.section-level-fix').hide();
		},
		resetMenu: function() {
			this.updateMenu();
			$('.section-level-add').hide();
			$('.section-level-quickedit').hide();
			$('.section-level-fix').hide();
		},
		updateMenu: function() {
			$('.section-level-edge').hide();
			$('.section-level-node').hide();
		},
		closeScene: async function() {
			if(!await this.checkPending()) return;
			this.resetMenu();
			Work.unRender();
		},
		selectNode: function(id) {
			id = '' + id;
			$('.level-line-black, .level-icon').removeClass('selected-node');
			window.selected_node = id;
			this.updateMenu();
			if(id.indexOf('-') != -1) {
				$('.level-line-black[data-connection='+id+']').addClass('selected-node');
				$('.section-level-edge').show();
				var nd = id.split('-');
				$('.section-level-edge .panel-value-save').removeClass('panel-value-changed');
				$('.section-level-edge .btn-remove').off('click');
				$('.section-level-edge .btn-remove').on('click',async (e) => {
					// if(!await modal_confirm_p('危','即将解除连接<br />完成一端关卡可能不再能解锁另一端')) {
					// 	return;
					// }
					Action.removeEdge(id);
				});
				$('.inp-link-internalid').val(findKV(current_data.edges,'id',id)._id);
				$('.inp-link-source').val(nd[0]);
				$('.inp-link-target').val(nd[1]);
			} else {
				$('.level-icon[data-level-id='+id+']').addClass('selected-node');
				$('.section-level-node').show();
				$('.section-level-node .panel-value-save').removeClass('panel-value-changed');
				$('.section-level-node .btn-save').off('click');
				$('.section-level-node .btn-save').on('click',(e) => {
					Action.saveNodeData(id);
				});
				$('.section-level-node .btn-remove').off('click');
				$('.section-level-node .btn-remove').on('click',async (e) => {
					if(!await modal_confirm_p('危','即将删除关卡<br />若提交更改前关卡文件未被使用，则其将被永久删除')) {
						return;
					}
					Action.saveNodeData(id,'remove');
				});
				$('.inp-level-id').val(id);
				var level = level_list[selected_temple].levels[id];
				var templeLevel = findKV(current_data.levels,'id',id);
				set_select($('.inp-level-type'),level.type);
				$('.inp-level-internalid').val(templeLevel._id);
				$('.inp-level-index').val(findKV(current_data.levels,'id',id,false));
				$('.inp-level-x').val(templeLevel.x);
				$('.inp-level-y').val(templeLevel.y);
				$('.inp-level-filename').val(level.path);
				$('.inp-level-tl').val(templeLevel.time);
				$('.inp-level-tl-mob').val(templeLevel.mobileTime);
				$('.inp-level-required').val(templeLevel.required);
				$('.inp-level-initial').val(templeLevel.initial ? 'yes' : 'no');
				$('.inp-level-title').val(level.name);
				$('.inp-level-size').val(level.size[0] + 'x' + level.size[1]);
				$('.img-level-sprite').css('opacity',0.5);
				$('.img-level-sprite').attr('src',levelSprite(selected_temple,id));
			}
		},
		removeEdge: async function(id) {
			this.pushPending();
			$('.section-level-edge').hide();
			current_data.edges.splice(findKV(current_data.edges,'id',id,false),1);
			$('[data-connection='+id+']').remove();
		},
		saveNodeData: async function(id,mode='modify') {
			if(mode == 'remove') {
				this.pushPending();
				$('.section-level-node').hide();
				delete level_list[selected_temple].levels[id];
				current_data.levels.splice(findKV(current_data.levels,'id',id,false),1);
				// 删除点
				$('[data-level-id='+id+']').remove();
				// 删除连线
				var stat = {};
				$('[data-link-source='+id+'], [data-link-target='+id+']').each(function(){
					var link_id = $(this).attr('data-connection');
					if(!stat[link_id]) {
						stat[link_id] = true;
						console.log('Cut',link_id);
						$('[data-connection='+link_id+']').remove();
						current_data.edges.splice(findKV(current_data.edges,'id',link_id,false),1);
					}
				});
				return;
			}

			var posX = +$('.inp-level-x').val();
			var posY = +$('.inp-level-y').val();
			if(posX < 0 || posX > 1) {
				$('.inp-level-x').addClass('panel-value-invalid');
				return;
			}
			if(posY < 0 || posY > 1) {
				$('.inp-level-y').addClass('panel-value-invalid');
				return;
			}
			var insert_target = +$('.inp-level-index').val();
			if(insert_target < 0 || Math.floor(insert_target) != insert_target) {
				$('.inp-level-index').addClass('panel-value-invalid');
				return;
			}
			var new_id = +$('.inp-level-id').val();
			if((new_id < 0 || new_id > 32767 || Math.floor(new_id) != new_id)
				|| ($('[data-level-id='+new_id+']').length > 0 && new_id != id)) {
				$('.inp-level-id').addClass('panel-value-invalid');
				return;
			}
			var level_type = $('.inp-level-type').val();
			if(!Work.levelSprite[level_type]) {
				$('.inp-level-type').addClass('panel-value-invalid');
				return;
			}
			var fn = $('.inp-level-filename').val();
			if(fn.indexOf("\\") != -1 || fn.substr(-5) != '.json') {
				$('.inp-level-filename').addClass('panel-value-invalid');
				return;
			}
			var timeLimit = +$('.inp-level-tl').val();
			if(timeLimit < 15 || timeLimit > 600 || Math.floor(timeLimit) != timeLimit) {
				$('.inp-level-tl').addClass('panel-value-invalid');
				return;
			}
			var timeLimitMobile = +$('.inp-level-tl-mob').val();
			if(timeLimitMobile < 15 || timeLimitMobile > 600 || Math.floor(timeLimitMobile) != timeLimitMobile) {
				$('.inp-level-tl-mob').addClass('panel-value-invalid');
				return;
			}
			var required = +$('.inp-level-required').val();
			if(required < 0) {
				$('.inp-level-tl-required').addClass('panel-value-invalid');
				return;
			}
			var initial = ($('.inp-level-initial').val() == 'yes');

			if(mode == 'add') {
				id = new_id;
				level_list[selected_temple].levels[id] = {
					name: '无标题关卡',
					size: [39,29],
				};
				current_data.levels.push({
					id: id,
					_id: node_fid++
				});
			}
			var level = level_list[selected_temple].levels[id];
			var templeLevel = findKV(current_data.levels,'id',id);

			this.pushPending();
			templeLevel.x = posX;
			templeLevel.y = posY;
			if(mode != 'add' && id != new_id) {
				level_list[selected_temple].levels[new_id] = level;
				delete level_list[selected_temple].levels[id];
				level.id = new_id;
				templeLevel.id = new_id;
			}
			if(mode != 'add') {
				var index = findKV(current_data.levels,'id',new_id,false);
				if(index != insert_target) {
					current_data.levels.splice(index,1);
					current_data.levels.splice(insert_target,0,templeLevel);
				}
			}
			level.type = templeLevel.type = level_type;
			level.path = templeLevel.filename = fn;
			templeLevel.time = timeLimit;
			templeLevel.mobileTime = timeLimitMobile;
			templeLevel.required = required;
			templeLevel.initial = initial;

			// 重新渲染结点
			$('[data-level-id='+id+']').remove();
			Work.renderNode(new_id);
			// 重新渲染有关的连接线
			var pending_link = [];
			var stat = {};
			$('[data-link-source='+id+'], [data-link-target='+id+']').each(function(){
				var link_id = $(this).attr('data-connection');
				if(!stat[link_id]) {
					stat[link_id] = true;
					console.log('Cut',link_id);
					pending_link.push(link_id);
				}
			});
			for(let i in pending_link) {
				var link_id = pending_link[i];
				$('[data-connection='+link_id+']').remove();
				var sides = link_id.split('-');
				var edge = findKV(current_data.edges,'id',link_id);
				if(sides[0] == id) {
					sides[0] = new_id;
				} else {
					if(sides[1] != id) {
						throw new Error('Something strange happened.');
					}
					sides[1] = new_id;
				}
				link_id = sides[0] + '-' + sides[1];
				edge.id = link_id;
				console.log('Link',link_id);
				Work.renderEdge(link_id);
			}
			Action.selectNode(new_id);
		},
		addLevel: async function() {
			var id = await modal_prompt_p('添加关卡','请输入其编号',node_fid,"number");
			if(!id) {
				return;
			}
			if(Math.floor(id) != id) {
				modal_alert('编号不可用','输入的编号 <strong>'+id+'</strong> 不合法');
				return;
			}
			id = Math.floor(id);
			if(id < 0 || id > 32767) {
				modal_alert('编号不可用','编号 <strong>'+id+'</strong> 不在 0~32767 范围内');
			}
			if($('[data-level-id='+id+']').length > 0) {
				modal_alert('编号不可用','编号 <strong>'+id+'</strong> 已经被使用');
			}
			var fn = await modal_prompt_p('添加关卡','输入对应文件名',selected_temple + '/levels/' + selected_temple + '_' + id + '.json');
			if(!fn) {
				return;
			}
			if(fn.indexOf("\\") != -1 || fn.substr(-5) != '.json') {
				modal_alert('文件名不可用','输入的文件名 <strong>'+fn+'</strong> 不合法');
			}

			$('.inp-level-index').val('998244353');
			$('.inp-level-id').val(id);
			set_select($('.inp-level-type'),'general');
			$('.inp-level-x').val('0.5');
			$('.inp-level-y').val('0.5');
			$('.inp-level-filename').val(fn);
			$('.inp-level-tl').val('65');
			$('.inp-level-tl-mob').val('85');
			$('.inp-level-required').val('0');
			$('.inp-level-initial').val('yes');
			$('.inp-level-title').val('?');
			$('.inp-level-size').val('?');

			Action.saveNodeData(998244353,'add');
		},
		makeConnection: async function() {
			var id = await modal_prompt_p('建立连接','请输入端点','1-2',"text");
			var nodes = id.split('-');
			if($('[data-connection='+nodes[0]+'-'+nodes[1]+']').length > 0) {
				return;
			}
			if($('[data-connection='+nodes[1]+'-'+nodes[0]+']').length > 0) {
				return;
			}
			if($('[data-level-id='+Math.floor(nodes[0])+']').length == 0) {
				return;
			}
			if($('[data-level-id='+Math.floor(nodes[1])+']').length == 0) {
				return;
			}
			this.pushPending();
			current_data.edges.push({
				id: nodes[0] + '-' + nodes[1],
				_id: edge_fid++,
				source: findKV(current_data.levels,'id',1 * nodes[0])._id,
				target: findKV(current_data.levels,'id',1 * nodes[1])._id
			});
			Work.renderEdge(nodes[0] + '-' + nodes[1]);
			this.selectNode(nodes[0] + '-' + nodes[1]);
		},
		setAllInitial: async function(flag) {
			var sel = await modal_confirm_p('选关版修改','你确定要' + (flag ? '开放' : '锁定') + '所有关卡吗？');
			if(!sel) {
				return;
			}
			for(i=0;i<current_data.levels.length;i++) {
				current_data.levels[i].initial = flag;
			}
			if(selected_node !== null) Action.selectNode(selected_node);
			this.pushPending();
		}
	};
})();
