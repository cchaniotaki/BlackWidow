// content.js
// Create a new script element
const lib = document.createElement('script');
lib.textContent = 'function catch_properties(){\n\
  resps = []\n\
  var elems = document.getElementsByTagName(\'*\')\n\
  for (my_counter_i = 0; my_counter_i < elems.length; my_counter_i++) {\n\
    events = []\n\
    tag = elems[my_counter_i].tagName\n\
    dom_address = ""\n\
    id = elems[my_counter_i].id\n\
    if (elems[my_counter_i].onclick != null) {\n\
      events.push({"method": "onclick", "func": elems[my_counter_i].onclick})\n\
    }\n\
    if (elems[my_counter_i].onmouseover != null) {\n\
      events.push({"method": "onmouseover", "func": elems[my_counter_i].onmouseover})\n\
    }\n\
    if (elems[my_counter_i].onabort != null) {\n\
      events.push({"method": "onabort", "func": elems[my_counter_i].onabort})\n\
    }\n\
    if (elems[my_counter_i].onblur != null) {\n\
      events.push({"method": "onblur", "func": elems[my_counter_i].onblur})\n\
    }\n\
    if (elems[my_counter_i].onchange != null) {\n\
      events.push({"method": "onchange", "func": elems[my_counter_i].onchange})\n\
    }\n\
    if (elems[my_counter_i].oninput != null) {\n\
      events.push({"method": "oninput", "func": elems[my_counter_i].oninput})\n\
    }\n\
    if (elems[my_counter_i].ondblclick != null) {\n\
      events.push({"method": "ondblclick", "func": elems[my_counter_i].ondblclick})\n\
    }\n\
    if (elems[my_counter_i].onerror != null) {\n\
      events.push({"method": "onerror", "func": elems[my_counter_i].onerror})\n\
    }\n\
    if (elems[my_counter_i].onfocus != null) {\n\
      events.push({"method": "onfocus", "func": elems[my_counter_i].onfocus})\n\
    }\n\
    if (elems[my_counter_i].onkeydown != null) {\n\
      events.push({"method": "onkeydown", "func": elems[my_counter_i].onkeydown})\n\
    }\n\
    if (elems[my_counter_i].onkeypress != null) {\n\
      events.push({"method": "onkeypress", "func": elems[my_counter_i].onkeypress})\n\
    }\n\
    if (elems[my_counter_i].onkeyup != null) {\n\
      events.push({"method": "onkeyup", "func": elems[my_counter_i].onkeyup})\n\
    }\n\
    if (elems[my_counter_i].onmousedown != null) {\n\
      events.push({"method": "onmousedown", "func": elems[my_counter_i].onmousedown})\n\
    }\n\
    if (elems[my_counter_i].onmousemove != null) {\n\
      events.push({"method": "onmousemove", "func": elems[my_counter_i].onmousemove})\n\
    }\n\
    if (elems[my_counter_i].onmouseout != null) {\n\
      events.push({"method": "onmouseout", "func": elems[my_counter_i].onmouseout})\n\
    }\n\
    if (elems[my_counter_i].onmouseup != null) {\n\
      events.push({"method": "onmouseup", "func": elems[my_counter_i].onmouseup})\n\
    }\n\
    if (events.length > 0) {\n\
      elem = elems[my_counter_i];\n\
      dom_adress = getXPath(elem);\n\
      html_class = elems[my_counter_i].className;\n\
      for (my_counter_j = 0; my_counter_j < events.length; my_counter_j++) {\n\
        //function_id = MD5(events[my_counter_j].func.toString() )\n\
        function_id = MD5(events[my_counter_j].func.toString() + dom_adress )\n\
        f = events[my_counter_j].func.toString()\n\
        e = events[my_counter_j].event_type\n\
        tut1 = events[my_counter_j];\n\
        resp = {\n\
          "function_id" : function_id,\n\
          "event" : events[my_counter_j].method,\n\
          "func" : events[my_counter_j].func.toString(),\n\
          "id" : id,\n\
          "tag" : tag,\n\
          "addr" : dom_adress,\n\
          "class" : html_class\n\
        }\n\
        resps.push(resp);\n\
      }\n\
    }\n\
  }\n\
  return JSON.stringify(resps);\n\
}\n\
function md5cycle(x, k) {\n\
var a = x[0], b = x[1], c = x[2], d = x[3];\n\
a = ff(a, b, c, d, k[0], 7, -680876936);\n\
d = ff(d, a, b, c, k[1], 12, -389564586);\n\
c = ff(c, d, a, b, k[2], 17,  606105819);\n\
b = ff(b, c, d, a, k[3], 22, -1044525330);\n\
a = ff(a, b, c, d, k[4], 7, -176418897);\n\
d = ff(d, a, b, c, k[5], 12,  1200080426);\n\
c = ff(c, d, a, b, k[6], 17, -1473231341);\n\
b = ff(b, c, d, a, k[7], 22, -45705983);\n\
a = ff(a, b, c, d, k[8], 7,  1770035416);\n\
d = ff(d, a, b, c, k[9], 12, -1958414417);\n\
c = ff(c, d, a, b, k[10], 17, -42063);\n\
b = ff(b, c, d, a, k[11], 22, -1990404162);\n\
a = ff(a, b, c, d, k[12], 7,  1804603682);\n\
d = ff(d, a, b, c, k[13], 12, -40341101);\n\
c = ff(c, d, a, b, k[14], 17, -1502002290);\n\
b = ff(b, c, d, a, k[15], 22,  1236535329);\n\
a = gg(a, b, c, d, k[1], 5, -165796510);\n\
d = gg(d, a, b, c, k[6], 9, -1069501632);\n\
c = gg(c, d, a, b, k[11], 14,  643717713);\n\
b = gg(b, c, d, a, k[0], 20, -373897302);\n\
a = gg(a, b, c, d, k[5], 5, -701558691);\n\
d = gg(d, a, b, c, k[10], 9,  38016083);\n\
c = gg(c, d, a, b, k[15], 14, -660478335);\n\
b = gg(b, c, d, a, k[4], 20, -405537848);\n\
a = gg(a, b, c, d, k[9], 5,  568446438);\n\
d = gg(d, a, b, c, k[14], 9, -1019803690);\n\
c = gg(c, d, a, b, k[3], 14, -187363961);\n\
b = gg(b, c, d, a, k[8], 20,  1163531501);\n\
a = gg(a, b, c, d, k[13], 5, -1444681467);\n\
d = gg(d, a, b, c, k[2], 9, -51403784);\n\
c = gg(c, d, a, b, k[7], 14,  1735328473);\n\
b = gg(b, c, d, a, k[12], 20, -1926607734);\n\
a = hh(a, b, c, d, k[5], 4, -378558);\n\
d = hh(d, a, b, c, k[8], 11, -2022574463);\n\
c = hh(c, d, a, b, k[11], 16,  1839030562);\n\
b = hh(b, c, d, a, k[14], 23, -35309556);\n\
a = hh(a, b, c, d, k[1], 4, -1530992060);\n\
d = hh(d, a, b, c, k[4], 11,  1272893353);\n\
c = hh(c, d, a, b, k[7], 16, -155497632);\n\
b = hh(b, c, d, a, k[10], 23, -1094730640);\n\
a = hh(a, b, c, d, k[13], 4,  681279174);\n\
d = hh(d, a, b, c, k[0], 11, -358537222);\n\
c = hh(c, d, a, b, k[3], 16, -722521979);\n\
b = hh(b, c, d, a, k[6], 23,  76029189);\n\
a = hh(a, b, c, d, k[9], 4, -640364487);\n\
d = hh(d, a, b, c, k[12], 11, -421815835);\n\
c = hh(c, d, a, b, k[15], 16,  530742520);\n\
b = hh(b, c, d, a, k[2], 23, -995338651);\n\
a = ii(a, b, c, d, k[0], 6, -198630844);\n\
d = ii(d, a, b, c, k[7], 10,  1126891415);\n\
c = ii(c, d, a, b, k[14], 15, -1416354905);\n\
b = ii(b, c, d, a, k[5], 21, -57434055);\n\
a = ii(a, b, c, d, k[12], 6,  1700485571);\n\
d = ii(d, a, b, c, k[3], 10, -1894986606);\n\
c = ii(c, d, a, b, k[10], 15, -1051523);\n\
b = ii(b, c, d, a, k[1], 21, -2054922799);\n\
a = ii(a, b, c, d, k[8], 6,  1873313359);\n\
d = ii(d, a, b, c, k[15], 10, -30611744);\n\
c = ii(c, d, a, b, k[6], 15, -1560198380);\n\
b = ii(b, c, d, a, k[13], 21,  1309151649);\n\
a = ii(a, b, c, d, k[4], 6, -145523070);\n\
d = ii(d, a, b, c, k[11], 10, -1120210379);\n\
c = ii(c, d, a, b, k[2], 15,  718787259);\n\
b = ii(b, c, d, a, k[9], 21, -343485551);\n\
x[0] = add32(a, x[0]);\n\
x[1] = add32(b, x[1]);\n\
x[2] = add32(c, x[2]);\n\
x[3] = add32(d, x[3]);\n\
}\n\
function cmn(q, a, b, x, s, t) {\n\
a = add32(add32(a, q), add32(x, t));\n\
return add32((a << s) | (a >>> (32 - s)), b);\n\
}\n\
function ff(a, b, c, d, x, s, t) {\n\
return cmn((b & c) | ((~b) & d), a, b, x, s, t);\n\
}\n\
function gg(a, b, c, d, x, s, t) {\n\
return cmn((b & d) | (c & (~d)), a, b, x, s, t);\n\
}\n\
function hh(a, b, c, d, x, s, t) {\n\
return cmn(b ^ c ^ d, a, b, x, s, t);\n\
}\n\
function ii(a, b, c, d, x, s, t) {\n\
return cmn(c ^ (b | (~d)), a, b, x, s, t);\n\
}\n\
function md51(s) {\n\
txt = "";\n\
var n = s.length,\n\
state = [1732584193, -271733879, -1732584194, 271733878], i;\n\
for (i=64; i<=s.length; i+=64) {\n\
md5cycle(state, md5blk(s.substring(i-64, i)));\n\
}\n\
s = s.substring(i-64);\n\
var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];\n\
for (i=0; i<s.length; i++)\n\
tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);\n\
tail[i>>2] |= 0x80 << ((i%4) << 3);\n\
if (i > 55) {\n\
md5cycle(state, tail);\n\
for (i=0; i<16; i++) tail[i] = 0;\n\
}\n\
tail[14] = n*8;\n\
md5cycle(state, tail);\n\
return state;\n\
}\n\
function md5blk(s) {\n\
var md5blks = [], i;\n\
for (i=0; i<64; i+=4) {\n\
md5blks[i>>2] = s.charCodeAt(i)\n\
+ (s.charCodeAt(i+1) << 8)\n\
+ (s.charCodeAt(i+2) << 16)\n\
+ (s.charCodeAt(i+3) << 24);\n\
}\n\
return md5blks;\n\
}\n\
var hex_chr = \'0123456789abcdef\'.split(\'\');\n\
function rhex(n)\n\
{\n\
var s=\'\', j=0;\n\
for(; j<4; j++)\n\
s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]\n\
+ hex_chr[(n >> (j * 8)) & 0x0F];\n\
return s;\n\
}\n\
function hex(x) {\n\
for (var i=0; i<x.length; i++)\n\
x[i] = rhex(x[i]);\n\
return x.join(\'\');\n\
}\n\
function MD5(s) {\n\
return hex(md51(s));\n\
}\n\
function add32(a, b) {\n\
return (a + b) & 0xFFFFFFFF;\n\
}\n\
window["open"] = function() {\n\
    openWrapper(this, arguments);\n\
}\n\
!function() {\n\
	function extend(dst, src) {\n\
		for ( var key in src)\n\
			dst[key] = src[key]\n\
		return src\n\
	}\n\
	var Simulate = {\n\
		event : function(element, eventName) {\n\
			if (document.createEvent) {\n\
				var evt = document.createEvent("HTMLEvents")\n\
				evt.initEvent(eventName, true, true)\n\
				element.dispatchEvent(evt)\n\
			} else {\n\
				var evt = document.createEventObject()\n\
				element.fireEvent(\'on\' + eventName, evt)\n\
			}\n\
		},\n\
		keyEvent : function(element, type, options) {\n\
			var evt, e = {\n\
				bubbles : true,\n\
				cancelable : true,\n\
				view : window,\n\
				ctrlKey : false,\n\
				altKey : false,\n\
				shiftKey : false,\n\
				metaKey : false,\n\
				keyCode : 0,\n\
				charCode : 0\n\
			}\n\
			extend(e, options)\n\
			if (document.createEvent) {\n\
				try {\n\
					evt = document.createEvent(\'KeyEvents\')\n\
					evt.initKeyEvent(type, e.bubbles, e.cancelable, e.view,\n\
							e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,\n\
							e.keyCode, e.charCode)\n\
					element.dispatchEvent(evt)\n\
				} catch (err) {\n\
					evt = document.createEvent("Events")\n\
					evt.initEvent(type, e.bubbles, e.cancelable)\n\
					extend(evt, {\n\
						view : e.view,\n\
						ctrlKey : e.ctrlKey,\n\
						altKey : e.altKey,\n\
						shiftKey : e.shiftKey,\n\
						metaKey : e.metaKey,\n\
						keyCode : e.keyCode,\n\
						charCode : e.charCode\n\
					})\n\
					element.dispatchEvent(evt)\n\
				}\n\
			}\n\
		}\n\
	}\n\
	Simulate.keypress = function(element, chr) {\n\
		var charCode = chr.charCodeAt(0)\n\
		this.keyEvent(element, \'keypress\', {\n\
			keyCode : charCode,\n\
			charCode : charCode\n\
		})\n\
	}\n\
	Simulate.keydown = function(element, chr) {\n\
		var charCode = chr.charCodeAt(0)\n\
		this.keyEvent(element, \'keydown\', {\n\
			keyCode : charCode,\n\
			charCode : charCode\n\
		})\n\
	}\n\
	Simulate.keyup = function(element, chr) {\n\
		var charCode = chr.charCodeAt(0)\n\
		this.keyEvent(element, \'keyup\', {\n\
			keyCode : charCode,\n\
			charCode : charCode\n\
		})\n\
	}\n\
	Simulate.change = function(element) {\n\
		var evt = document.createEvent("HTMLEvents");\n\
		evt.initEvent("change", false, true);\n\
		element.dispatchEvent(evt);\n\
	}\n\
	var events = [\'click\',\'focus\', \'blur\', \'dblclick\', \'input\', \'mousedown\',\n\
			\'mousemove\', \'mouseout\', \'mouseover\', \'mouseup\', \'resize\',\n\
			\'scroll\', \'select\', \'submit\', \'load\', \'unload\', \'mouseleave\' ]\n\
	for (var i = events.length; i--;) {\n\
		var event = events[i]\n\
		Simulate[event] = (function(evt) {\n\
			return function(element) {\n\
				this.event(element, evt)\n\
			}\n\
		}(event))\n\
	}\n\
	if (typeof module !== \'undefined\') {\n\
		module.exports = Simulate\n\
	} else if (typeof window !== \'undefined\') {\n\
		window.Simulate = Simulate\n\
	} else if (typeof define !== \'undefined\') {\n\
		define(function() {\n\
			return Simulate\n\
		})\n\
	}\n\
}();\n\
need_to_wait = false;\n\
var original = XMLHttpRequest.prototype[\'open\'];\n\
XMLHttpRequest.prototype[\'open\'] = function() {\n\
  need_to_wait = true;\n\
  return original.apply(this, arguments);\n\
}\n\
function callbackWrap(object, property, argumentIndex, wrapperFactory) {\n\
	var original = object[property];\n\
	object[property] = function() {\n\
		wrapperFactory(this, arguments);\n\
		return original.apply(this, arguments);\n\
	}\n\
	return original;\n\
}\n\
var max_waiting_time = 65000\n\
var min_waiting_time = 0\n\
function timingCallbackWrap(object, property, argumentIndex, wrapperFactory) {\n\
	var original = object[property];\n\
	object[property] = function() {\n\
		if (arguments[1] > max_waiting_time) {\n\
			arguments[1] = max_waiting_time\n\
		}\n\
		wrapperFactory(this, arguments);\n\
		return original.apply(this, arguments);\n\
	}\n\
	return original;\n\
}\n\
function callInterceptionWrapper(object, property, argumentIndex,\n\
		wrapperFactory) {\n\
	var original = object[property];\n\
	object[property] = function() {\n\
		wrapperFactory(this, arguments);\n\
		return null;\n\
	}\n\
	return original;\n\
}\n\
function XMLHTTPObserverOpen(elem, args) {\n\
	resp = {\n\
		"url" : args[1],\n\
		"method" : args[0]\n\
	};\n\
	random_num =  Math.floor((Math.random() * 10000) + 1);\n\
	elem.jaeks_id = random_num;\n\
  timeouts.push(resp);\n\
  console.log("Observer " + resp);\n\
}\n\
function XMLHTTPObserverSend(elem, args) {\n\
	elems = []\n\
	for (i = 0; i < args.length; i++) {\n\
		elems.push(args[i])\n\
	}\n\
	resp = {\n\
		"parameters" : elems\n\
	};\n\
	resp = JSON.stringify(resp)\n\
  console.log("Send " + resp);\n\
}\n\
window_open_urls = []\n\
function openWrapper(elem, args) {\n\
    window_open_urls.push(args[0])\n\
}\n\
timeouts = Array();\n\
function timeoutWrapper(elem, args) {\n\
	function_id = MD5(args[0].toString());\n\
	resp = {\n\
		"function_id" : function_id,\n\
		"function_name" : args[0].name,\n\
		"time" : args[1]\n\
	};\n\
  timeouts.push(resp);\n\
}\n\
function intervallWrapper(elem, args) {\n\
	function_id = MD5(args[0].toString());\n\
	resp = {\n\
		"function_id" : function_id,\n\
		"time" : args[1]\n\
	};\n\
	resp = JSON.stringify(resp)\n\
}\n\
function getXPath(element) {\n\
	try {\n\
		var xpath = \'\';\n\
    if (element.id) {\n\
      return \'//*[@id="\'+element.id+\'"]\';\n\
    }\n\
		for (; element && element.nodeType == 1; element = element.parentNode) {\n\
			var sibblings = element.parentNode.childNodes;\n\
			var same_tags = []\n\
			for (var i = 0; i < sibblings.length; i++) { // collecting same\n\
				if (element.tagName === sibblings[i].tagName) {\n\
					same_tags[same_tags.length] = sibblings[i]\n\
				}\n\
			}\n\
			var id = same_tags.indexOf(element) + 1;\n\
			id > 1 ? (id = \'[\' + id + \']\') : (id = \'\');\n\
			xpath = \'/\' + element.tagName.toLowerCase() + id + xpath;\n\
		}\n\
		return xpath;\n\
	} catch (e) {\n\
		console.log("Error: " + e)\n\
		return "";\n\
	}\n\
}\n\
added_events = Array();\n\
function addEventListenerWrapper(elem, args) {\n\
	tag = elem.tagName\n\
	dom_adress = "";\n\
	id = elem.id;\n\
	html_class = elem.className;\n\
	dom_adress = getXPath(elem);\n\
  if( !dom_adress ) {\n\
    console.log("No dom_adress, using fake-id")\n\
    elem.id = MD5(elem.outerHTML);\n\
    dom_adress = \'//*[@id="\'+elem.id+\'"]\';\n\
  }\n\
	function_id = MD5(args[1].toString())\n\
	resp = {\n\
		"event" : args[0],\n\
		"function_id" : function_id,\n\
		"addr" : dom_adress,\n\
		"id" : id,\n\
		"tag" : tag,\n\
		"class" : html_class\n\
	}\n\
  added_events.push( resp )\n\
	if (args[0] == "change") {\n\
		inputs = elem.querySelectorAll("input");\n\
		selects = elem.querySelectorAll("select");\n\
		options = elem.querySelectorAll("option");\n\
		for (i = 0; i < inputs.length; i++) {\n\
			e = inputs[i];\n\
			if (e.getAttribute("type") == "radio"\n\
					|| e.getAttribute("type") == "checkbox") {\n\
				tag = e.tagName\n\
				id = e.id;\n\
				html_class = e.className;\n\
				dom_adress = getXPath(e);\n\
				function_id = "";\n\
				resp = {\n\
					"event" : "change",\n\
					"function_id" : function_id,\n\
					"addr" : dom_adress,\n\
					"id" : id,\n\
					"tag" : tag,\n\
					"class" : html_class\n\
				}\n\
				resp = JSON.stringify(resp)\n\
				jswrapper.add_eventListener_to_element(resp)\n\
			}\n\
		}\n\
		for (i = 0; i < selects.length; i++) {\n\
			s = selects[i];\n\
			tag = s.tagName\n\
			id = s.id;\n\
			html_class = s.className;\n\
			dom_adress = getXPath(s);\n\
			function_id = "";\n\
			resp = {\n\
				"event" : "change",\n\
				"function_id" : function_id,\n\
				"addr" : dom_adress,\n\
				"id" : id,\n\
				"tag" : tag,\n\
				"class" : html_class\n\
			}\n\
			resp = JSON.stringify(resp)\n\
			jswrapper.add_eventListener_to_element(resp)\n\
		}\n\
		for (xx = 0; xx < options.length; xx++) {\n\
			element = options[i]\n\
			tag = element.tagName\n\
			id = element.id;\n\
			html_class = element.className;\n\
			dom_adress = getXPath(element);\n\
			function_id = "";\n\
			resp = {\n\
				"event" : "change",\n\
				"function_id" : function_id,\n\
				"addr" : dom_adress,\n\
				"id" : id,\n\
				"tag" : tag,\n\
				"class" : html_class\n\
			}\n\
			resp = JSON.stringify(resp)\n\
			jswrapper.add_eventListener_to_element(resp)\n\
		}\n\
	}\n\
    if (tag == "TABLE" && args[0] == "click"){\n\
        candidates = elem.querySelectorAll("button");\n\
        for( xx = 0; xx < candidates.length; xx++) {\n\
            var element = candidates[xx];\n\
            tag = element.tagName;\n\
            id = element.id;\n\
            html_class = element.className;\n\
            dom_adress = getXPath(element);\n\
            function_id = "";\n\
            resp = {\n\
                "event": "click",\n\
                "function_id": function_id,\n\
                "addr": dom_adress,\n\
                "id": id,\n\
                "tag": tag,\n\
                "class": html_class\n\
            };\n\
            added_events.push( resp )\n\
        };\n\
    }\n\
}\n\
function bodyAddEventListenerWrapper(elem, args) {\n\
	tag = "body"\n\
	dom_adress = "";\n\
	id = elem.id;\n\
	html_class = elem.className;\n\
	function_id = MD5(args[1].toString())\n\
	dom_adress = "/html/body"\n\
	resp = {\n\
		"event" : args[0],\n\
		"function_id" : function_id,\n\
		"addr" : dom_adress,\n\
		"id" : id,\n\
		"tag" : tag,\n\
		"class" : html_class\n\
	}\n\
	resp = JSON.stringify(resp)\n\
  console.log(resp)\n\
}\n\
function get_forms() {\n\
  var forms = document.forms;\n\
  var obj_forms = [];\n\
  for(var i = 0; i < forms.length; i++) {\n\
      form = {"action": forms[i].action,\n\
              "method": forms[i].method,\n\
              "elements": []};\n\
      els = forms[i].elements;\n\
      for(var j = 0; j < els.length; j++) {\n\
        form.elements.push( {"name": els[j].name,\n\
                             "type": els[j].type,\n\
                             "xpath": getXPath(els[j])} );\n\
      }\n\
      obj_forms.push(form);\n\
  }\n\
  return JSON.stringify(obj_forms);\n\
}\n\
xss_array = []\n\
function xss(data) {\n\
  xss_array.push(data);\n\
}\n\
(function(proxied) {\n\
  window.alert = function() { };\n\
})(window.alert);\n\
(function(proxied) {\n\
  window.confirm = function() { return true; };\n\
})(window.confirm);\n\
callbackWrap(Element.prototype, "addEventListener", 1, addEventListenerWrapper);\n\
callbackWrap(Document.prototype, "addEventListener", 1,bodyAddEventListenerWrapper);\n\
timingCallbackWrap(window, "setTimeout", 0, timeoutWrapper);\n\
timingCallbackWrap(window, "setInterval", 0, intervallWrapper);\n\
console.log("opa tis, ola kala"); var x = 10; console.log(x);\n\
';

// Append the script to the document body
(document.head || document.documentElement).appendChild(lib);

// Optionally, remove the script element after execution
//script.remove();
