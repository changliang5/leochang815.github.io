(async () => {
	var fetch_folder_list = () => {
		return new Promise((resolve,reject) => {
			$.ajax({
				method: 'GET',
				dataType: 'json',
				url: './data/folder-list.json',
				timeout: 3000,
				success: (e) => {
					resolve(e);
				},
				error: (e) => {
					reject(e);
				}
			});
		});
	};
	try {
		window.folder_list = await fetch_folder_list();
	} catch(e) {
		throw e;
	}
	$('.load-blocker').css('opacity','0');
	setTimeout(() => $('.load-blocker').css('display','none'),300);

	HTMLActuator.insertFolderList(window.folder_list);
	Action.init();

	if(readOnlyMode) {
		document.title += ' [只读模式]';
		$('.btn-add-node,.btn-add-edge,.btn-level-open,.btn-level-close,.btn-remove,.btn-save,.section-level-node input,.section-level-node select').attr('disabled','disabled');
	}
	$('.inp-scale').on('input',(e) => {
		var sz = $(e.target).val();
		if(sz > 99) {
			sz = 99;
			$(e.target).val(sz);
		}
		$('.main-view').css('font-size', sz + 'px');
	});
	$('.panel-value-save').on('input',(e) => {
		$(e.target).addClass('panel-value-changed');
	});
	$('.panel-value').on('input',(e) => {
		$(e.target).removeClass('panel-value-invalid');
	});
	$('.section-level-node .panel-value').on('keydown',(e) => {
		if(e.keyCode == 13) {
			if(!readOnlyMode) $('.section-level-node .btn-save').click();
		}
	});
	$('.main-view-outer').on('keydown',(e) => {
		if(e.key == 'Delete') {
			if($('.section-level-node').css('display') != 'none') {
				if(!readOnlyMode) $('.section-level-node .btn-remove').click();
			}
			if($('.section-level-edge').css('display') != 'none') {
				if(!readOnlyMode) $('.section-level-edge .btn-remove').click();
			}
		} else if(e.key.substr(0,5) == 'Arrow') {
			if(readOnlyMode) return;

			e.preventDefault();
			if(selected_node.indexOf('-') != -1) {
				return;
			}
			var level = findKV(current_data.levels,'id',selected_node);

			var x = level.x;
			var y = level.y;
			x += {
				ArrowLeft: -1,
				ArrowRight: 1,
				ArrowUp: 0,
				ArrowDown: 0
			}[e.key] * 0.005;
			y += {
				ArrowLeft: 0,
				ArrowRight: 0,
				ArrowUp: -1,
				ArrowDown: 1
			}[e.key] * 0.005;
			x = Math.round(x * 1000) / 1000;
			y = Math.round(y * 1000) / 1000;

			if(x < 0 || x > 1 || y < 0 || y > 1) {
				return;
			}
			$('.inp-level-x').val(x);
			$('.inp-level-y').val(y);
			if($('.section-level-node').css('display') != 'none') {
				$('.section-level-node .btn-save').click();
			}
		}
	});
})();
