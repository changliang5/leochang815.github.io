window.HTMLActuator = null;
(() => {
	window.HTMLActuator = {
		insertFolderList: (k) => {
			for(let i in k) {
				var $lst = $('.ins-folder-list');
				var $nxt = $('<li><a></a></li>');
				$nxt.addClass('folder-selection-item');
				$nxt.children().html(
					escapeXml(k[i].name) + ' <span class="cmt">' + escapeXml(k[i].path) + '</span>'
				);
				((id) => {
					$nxt.children().on('click',(e) => {
						if($(e.target).hasClass('am-disabled')) {
							return;
						}
						Action.loadFolder(id);
					});
				})(i);
				$lst.append($nxt);
			}
		},
		changeHubTitle: (cls,state,text) => {
			var $title = $('.' + cls);
			var $text = $('.' + cls + ' .hub-title-text');
			var title_class = ['disabled','loading','failed','normal'];
			for(let i in title_class) {
				$title.removeClass('hub-title-' + title_class[i]);
			}
			$title.addClass('hub-title-' + state);
			$text.text(text);
		},
		disableFolder: () => {
			$('.folder-selection-item a, .folder-selection-item').addClass('am-disabled');
		},
		enableFolder: () => {
			$('.folder-selection-item a, .folder-selection-item').removeClass('am-disabled');
		},
		pushLevelList: (list) => {
			for(i in list) {
				var temple = list[i];
				var $temple = $('<div></div>').addClass('temple');
				$temple.append($('<div></div>').addClass('temple-name').text(temple.name));
				$temple.append($('<div></div>').addClass('temple-path').text(temple.path));
				var $templeCont = $('<div></div>').addClass('temple-content');
				$temple.append($templeCont);
				var levels = temple.levels;
				for(j in levels) {
					var level = levels[j];
					var $level = $('<div></div>').addClass('level');
					$level.append($('<div></div>').addClass('level-name').text('[' + level.id + '] ' + level.name));
					$level.append($('<div></div>').addClass('level-path').text(level.path));
					$templeCont.append($level);
					((level) => {
						$('.level-path',$level).on('click',function() {
							console.log('OpenLevel ',level);
						});
					})(level);
				}
				$('.ins-level-list').append($temple);

				$('.temple-name',$temple).on('click',function(){
					var $this = $(this.parentElement);
					if($this.hasClass('temple-open')) {
						$this.removeClass('temple-open');
					} else {
						$this.addClass('temple-open');
					}
				});

				((temple) => {
					$('.temple-path',$temple).on('click',function() {
						Action.openTempleHall(temple);
					});
				})(temple);
			}
		}
	};
})();
