// --------------------------------
// FF.cookie
// --------------------------------
(function($) {
	if (!$ || ! window.FF) return;
	// ----------------------------
	FF.namespace('FF.cookie');
	// ----------------------------
	FF.cookie.getRootDomain = function() {
		//ignore ip
		return document.domain;
	};
	FF.cookie.get = function(name) {
		var cname = name + '=';
		var dc = document.cookie;
		if (dc.length > 0) {
			begin = dc.indexOf(cname);
			if (begin != - 1) {
				begin += cname.length;
				end = dc.indexOf(';', begin);
				if (end == - 1) end = dc.length;
				return unescape(dc.substring(begin, end));
			}
		}
		return '';
	};
	FF.cookie.del = function(name, root) {
		var domain = (root) ? ('; domain=' + this.getRootDomain()) : '';
		document.cookie = name + '=; path=/' + domain + '; expires=Thu,01-Jan-70 00:00:01 GMT';
	};
	FF.cookie.set = function(name, value, expdate, root) {
		var exp = new Date(),
		domain = root ? ('; domain=' + this.getRootDomain()) : '';
		if (!expdate) {
			expdate = 365;
		}
		exp.setTime((+exp) + (1000 * 60 * 60 * 24 * expdate));
		document.cookie = name + '=' + escape(value) + '; path=/' + domain + ((expdate == 0) ? '': ('; expires=' + exp.toGMTString()));
	};
	// ----------------------------
})(jQuery);

