// --------------------------------
// FF.valid
// --------------------------------
(function($) {
	if (!$ || ! window.FF) return;
	// ----------------------------
	FF.namespace('FF.valid');
	// ----------------------------
	FF.valid.isIP = function(str) {
		var re = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/;
		return re.test(str);
	};
	FF.valid.isUrl = function(str) {
		return /(http[s]?|ftp):\/\/[^\/\.]+?\..+\w$/i.test(str.trim());
	};
	FF.valid.isDate = function(str) {
		var result = str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
		if (!result) return false;
		var d = new Date(result[1], result[3] - 1, result[4]);
		return ((d.getFullYear() == result[1]) && (d.getMonth() + 1 == result[3]) && (d.getDate() == result[4]));
	};
	FF.valid.isTime = function(str) {
		var result = str.match(/^(\d{1,2})(:)?(\d{1,2})\2(\d{1,2})$/);
		if (result == null) return false;
		if (result[1] > 24 || result[3] > 60 || result[4] > 60) return false;
		return true;
	};
	FF.valid.isDateTime = function(str) {
		var result = str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/);
		if (result == null) return false;
		var d = new Date(result[1], result[3] - 1, result[4], result[5], result[6], result[7]);
		return (d.getFullYear() == result[1] && (d.getMonth() + 1) == result[3] && d.getDate() == result[4] && d.getHours() == result[5] && d.getMinutes() == result[6] && d.getSeconds() == result[7]);
	};
	// 整数
	FF.valid.isInteger = function(str) {
		return /^(-|\+)?\d+$/.test(str.trim());
	};
	// 正整数
	FF.valid.isPositiveInteger = function(str) {
		return /^\d+$/.test(str.trim()) && (-(-str)) > 0;
	};
	// 负整数
	FF.valid.isNegativeInteger = function(str) {
		return /^-\d+$/.test(str.trim());
	};
	FF.valid.isNumber = function(str) {
		return ! isNaN(str);
	};
	FF.valid.isEmail = function(str) {
		return /^([_a-zA-Z\d\-\.])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/.test(str.trim());
	};
	FF.valid.isMobile = function(str) {
		return /^(13|14|15|18)\d{9}$/.test(str.trim());
	};
	FF.valid.isPhone = function(str) {
		return /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/.test(str.trim());
	};
	FF.valid.isAreacode = function(str) {
		return /^0\d{2,3}$/.test(str.trim());
	};
	FF.valid.isPostcode = function(str) {
		return /^\d{6}$/.test(str.trim());
	};
	FF.valid.isLetters = function(str) {
		return /^[A-Za-z]+$/.test(str.trim());
	};
	FF.valid.isDigits = function(str) {
		return /^[1-9][0-9]+$/.test(str.trim());
	};
	FF.valid.isAlphanumeric = function(str) {
		return /^[a-zA-Z0-9]+$/.test(str.trim());
	};
	FF.valid.isValidString = function(str) {
		return /^[a-zA-Z0-9\s.\-_]+$/.test(str.trim());
	};
	FF.valid.isLowerCase = function(str) {
		return /^[a-z]+$/.test(str.trim());
	};
	FF.valid.isUpperCase = function(str) {
		return /^[A-Z]+$/.test(str.trim());
	};
	FF.valid.isChinese = function(str) {
		return /^[\u4e00-\u9fa5]+$/.test(str.trim());
	};
	FF.valid.isIDCard = function(str) {
		//这里没有验证有效性，只验证了格式
		var r15 = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/;
		var r18 = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X|x)$/;
		return (r15.test(str.trim()) || r18.test(str.trim()));
	};
	// 卡号校验 模10检查
	FF.valid.isCardNo = function(str, cardType) {
		var cards = {
			"Visa": {
				lengths: "13,16",
				prefixes: "4",
				checkdigit: true
			},
			"MasterCard": {
				lengths: "16",
				prefixes: "51,52,53,54,55",
				checkdigit: true
			},
			"BankCard": {
				lengths: "16,17,19",
				prefixes: "3,4,5,6,9",
				checkdigit: false
			}
		};
		if (!cards[cardType]) return false;
		var cardNo = str.replace(/[\s-]/g, ""); // remove spaces and dashes
		var cardexp = /^[0-9]{13,19}$/;
		if (cardNo.length == 0 || ! cardexp.exec(cardNo)) {
			return false;
		} else {
			cardNo = cardNo.replace(/\D/g, ""); // strip down to digits
			var modTenValid = true;
			var prefixValid = false;
			var lengthValid = false;
			// 模10检查
			if (cards[cardType].checkdigit) {
				var checksum = 0,
				mychar = "",
				j = 1,
				calc;
				for (i = cardNo.length - 1; i >= 0; i--) {
					calc = Number(cardNo.charAt(i)) * j;
					if (calc > 9) {
						checksum = checksum + 1;
						calc = calc - 10;
					}
					checksum = checksum + calc;
					if (j == 1) {
						j = 2
					} else {
						j = 1
					};
				}
				if (checksum % 10 != 0) modTenValid = false;
			}
			if (cards[cardType].prefixes == '') {
				prefixValid = true;
			} else {
				// 前缀字符检查
				var prefix = cards[cardType].prefixes.split(",");
				for (i = 0; i < prefix.length; i++) {
					var exp = new RegExp("^" + prefix[i]);
					if (exp.test(cardNo)) prefixValid = true;
				}
			}
			// 卡号长度检查
			var lengths = cards[cardType].lengths.split(",");
			for (j = 0; j < lengths.length; j++) {
				if (cardNo.length == lengths[j]) lengthValid = true;
			}
			if (!modTenValid || ! prefixValid || ! lengthValid) {
				return false;
			} else {
				return true;
			}
		}
	};
	FF.valid.isLogName = function(str) {
		return (FF.valid.isEmail(str) || FF.valid.isMobile(str));
	};
	FF.valid.isRealName = function(str) {
		return /^[A-Za-z \u4E00-\u9FA5]+$/.test(str);
	};
})(jQuery);

