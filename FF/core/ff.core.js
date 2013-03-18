// --------------------------------
// FF core: namespace/debug/load/timestat/lang
// --------------------------------
(function($) {
	if (!$) return;
	if (!window.FF) window.FF = {};
	// ----------------------------
	// FF.namespace 命名空间
	FF.namespace = function(name, sep) {
		var s = name.split(sep || '.'),
		d = {},
		o = function(a, b, c) {
			if (c < b.length) {
				if (!a[b[c]]) {
					a[b[c]] = {};
				}
				d = a[b[c]];
				o(a[b[c]], b, c + 1);
			}
		};
		o(window, s, 0);
		return d;
	};
	// ----------------------------
	// FF.debug 过程调试
	FF.debugMode = false;
	FF.debugIndex = 0;
	FF.debug = function(a, b) {
		if (!this.debugMode) return;
		if (typeof(console) == 'undefined') {
			FF.debug.log(((Date.prototype.format) ? (new Date()).format('hh:nn:ss.S') : (++FF.debugIndex)) + ', ' + a + ' = ' + b);
		} else {
			if (console && console.log) console.log(((Date.prototype.format) ? (new Date()).format('hh:nn:ss.S') : (++FF.debugIndex)) + ', ' + a, '=', b);
		}
	};
	FF.debug.log = function() {
		this.createDOM();
		var p = [],
		v = $('#_ym_debuglog textarea').val();
		for (var i = 0; i < arguments.length; i++) {
			p.push(arguments[i]);
		}
		v += (v == '' ? '': '\n') + p.join(' ');
		$('#_ym_debuglog textarea').val(v);
	};
	FF.debug.clear = function() {
		$('#_ym_debuglog textarea').val('');
	};
	FF.debug.createDOM = function() {
		if ($('#_ym_debuglog').size() == 0) {
			var _html = '<div id="_ym_debuglog" style="position:fixed;bottom:0;left:0;right:0;_position:absolute;_bottom:auto;_top:0;padding:5px 0 5px 5px;border:solid 5px #666;background:#eee;z-index:1000;"><textarea style="font-size:12px;line-height:16px;display:block;background:#eee;border:none;width:100%;height:80px;"></textarea><a style="text-decoration:none;display:block;height:80px;width:20px;text-align:center;line-height:16px;padding:5px 0;_padding:6px 0;background:#666;color:#fff;position:absolute;right:-5px;bottom:0;" href="#">关闭调试器</a></div>';
			$('body').append(_html);
			$('#_ym_debuglog a').click(function() {
				$(this).parent().remove();
				return false;
			});
			$('#_ym_debuglog textarea').focus(function() {
				this.select();
			});
		}
	};
	// ----------------------------
	// FF.load/FF.loader 加载管理
	FF.load = function(service, action, params) {
		if ($.isArray(service)) {
			var url = service.join(',');
			var urlsize = service.length;
			var status = FF.loader.checkFileLoader(url);
			if (status == urlsize + 1) {
				if (typeof(action) == 'function') action();
			} else if (status > 0) {
				FF.loader.addExecute(url, action);
			} else if (status == 0) {
				FF.loader.addExecute(url, action);
				FF.loader.fileLoader[url] = 1;
				FF.debug('开始加载JS', url);
				for (var i = 0; i < urlsize; i++) {
					FF.load(service[i], function() {
						FF.loader.fileLoader[url]++;
						if (FF.loader.fileLoader[url] == urlsize + 1) {
							FF.debug('完成加载JS', url);
							FF.loader.execute(url);
						}
					});
				}
			}
		} else if (FF.loader.serviceLibs[service] && FF.loader.serviceLibs[service].requires) {
			FF.load(FF.loader.serviceLibs[service].requires, function() {
				FF.load.run(service, action, params);
			});
		} else {
			FF.load.run(service, action, params);
		}
	};
	FF.load.version = '';
	FF.load.add = function(key, data) {
		if (FF.loader.serviceLibs[key]) return;
		if (data.js && (!data.js.startWith('http')) && this.version) {
			data.js = data.js.addQueryValue('v', this.version);
		}
		if (data.css && (!data.css.startWith('http')) && this.version) {
			data.css = data.css.addQueryValue('v', this.version);
		}
		FF.loader.serviceLibs[key] = data;
	};
	FF.load.setPath = function(path) {
		FF.loader.serviceBase = path;
	};
	FF.load.run = function(service, act, params) {
		var action = (typeof(act) == 'string') ? (function() {
			try {
				var o = eval('FF.' + service);
				if (o && o[act]) o[act](params);
			} catch(e) {}
		}) : (act || function() {});
		if (FF.loader.checkService(service)) {
			action();
			return;
		}
		var url = FF.loader.getServiceUrl(service);
		var status = FF.loader.checkFileLoader(url);
		// status:-1异常, 0未加载, 1开始加载, 2完成加载
		if (status == 2) {
			action();
		} else if (status == 1) {
			FF.loader.addExecute(url, action);
		} else if (status == 0) {
			if ($('script[src=' + url + ']').size() > 0) {
				FF.loader.fileLoader[url] = 2;
				action();
			} else {
				FF.loader.addExecute(url, action);
				FF.loader.addScript(service);
			}
		} else {
			FF.debug('加载异常', service);
		}
	};
	// ----------------------------
	FF.loader = {};
	FF.loader.fileLoader = {};
	FF.loader.executeLoader = {};
	FF.loader.serviceBase = (function() {
		return $('script:last').attr('src').sliceBefore('/js/') + '/';
	})();
	FF.loader.serviceLibs = {};
	FF.loader.checkFullUrl = function(url) {
		return (url.indexOf('/') == 0 || url.indexOf('http://') == 0);
	};
	FF.loader.checkService = function(service) {
		if (this.checkFullUrl(service)) return false;
		try {
			if (service.indexOf('.') > 0) {
				var o = eval('FF.' + service);
				return (typeof(o) != 'undefined');
			}
			return false;
		} catch(e) {
			return false;
		}
	};
	FF.loader.checkFileLoader = function(url) {
		return (url != '') ? (this.fileLoader[url] || 0) : - 1;
	};
	FF.loader.getServiceUrl = function(service) {
		var url = '';
		if (this.checkFullUrl(service)) {
			url = service;
		} else if (this.serviceLibs[service]) {
			url = (this.checkFullUrl(this.serviceLibs[service].js)) ? this.serviceLibs[service].js: (this.serviceBase + this.serviceLibs[service].js);
		}
		return url;
	};
	FF.loader.execute = function(url) {
		if (this.executeLoader[url]) {
			for (var i = 0; i < this.executeLoader[url].length; i++) {
				this.executeLoader[url][i]();
			}
			this.executeLoader[url] = null;
		}
	};
	FF.loader.addExecute = function(url, action) {
		if (typeof(action) != 'function') return;
		if (!this.executeLoader[url]) this.executeLoader[url] = [];
		this.executeLoader[url].push(action);
	};
	FF.loader.addScript = function(service) {
		var this_ = this;
		if (this.checkFullUrl(service)) {
			var url = service;
			this.getScript(url, function() {
				this_.fileLoader[url] = 2;
				FF.debug('完成加载JS', url);
				FF.loader.execute(url);
			});
		} else if (this.serviceLibs[service]) {
			if (this.serviceLibs[service].css) {
				var url = (this.checkFullUrl(this.serviceLibs[service].css)) ? this.serviceLibs[service].css: (this.serviceBase + this.serviceLibs[service].css);
				if (!this.fileLoader[url]) {
					$('head').append('<link rel="stylesheet" type="text\/css"  href="' + url + '" \/>');
					this.fileLoader[url] = 1;
					FF.debug('开始加载CSS', url);
				}
			}
			if (this.serviceLibs[service].js) {
				var url = (this.checkFullUrl(this.serviceLibs[service].js)) ? this.serviceLibs[service].js: (this.serviceBase + this.serviceLibs[service].js);
				this.getScript(url, function() {
					this_.fileLoader[url] = 2;
					FF.debug('完成加载JS', url);
					FF.loader.execute(url);
				});
			}
		}
	};
	FF.loader.getScript = function(url, onSuccess, onError) {
		this.getRemoteScript(url, onSuccess, onError);
		this.fileLoader[url] = 1;
		FF.debug('开始加载JS', url);
	};
	FF.loader.getRemoteScript = function(url, param, onSuccess, onError) {
		if ($.isFunction(param)) {
			onError = onSuccess;
			onSuccess = param;
			param = {};
		}
		var head = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		script.type = 'text/javascript';
		script.src = url;
		for (var item in param) {
			if (item == 'keepScriptTag') {
				script.keepScriptTag = true;
			} else {
				script.setAttribute(item, param[item]);
			}
		}
		script.onload = script.onreadystatechange = function() {
			if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
				if (onSuccess) onSuccess();
				script.onload = script.onreadystatechange = null;
				if (!script.keepScriptTag) head.removeChild(script);
			}
		};
		script.onerror = function() {
			if (onError) onError();
		};
		head.appendChild(script);
	};
	// ----------------------------
	// FF.timestat 时间分析
	FF.timestat = {};
	FF.timestat.libs = {};
	FF.timestat.loadTime = (typeof(_ym_page_loadtime) == 'number') ? _ym_page_loadtime: new Date().getTime();
	FF.timestat.add = function(name) {
		this.libs[name] = new Date().getTime() - this.loadTime;
	};
	FF.timestat.get = function(name) {
		return this.libs[name] || 0;
	};
	// ----------------------------
	// FF.lang 多语言支持
	FF.lang = {};
	FF.lang.language = 'zh-cn';
	FF.lang.text = {};
	FF.lang.get = function(dataset, name) {
		if (name) {
			if (this.text[dataset]) {
				return this.text[dataset][name] || '';
			} else {
				return '';
			}
		} else {
			return this.text[dataset] || null;
		}
	};
	FF.lang.set = function(dataset, name, value) {
		if (!this.text[dataset]) {
			this.text[dataset] = {};
		}
		if (value) {
			this.text[dataset][name] = value;
		} else {
			this.text[dataset] = name;
		}
	};
	FF.lang.extend = function(dataset, data) {
		if (!this.text[dataset]) {
			this.text[dataset] = {};
		}
		$.extend(this.text[dataset], data);
	};
})(jQuery);

