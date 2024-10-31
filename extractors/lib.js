// content.js
/*
 * Simulate.js from https://github.com/airportyh/simulate.js
 */
!function () {
    function extend(dst, src) {
        for (var key in src) dst[key] = src[key]
        return src
    }

    var Simulate = {
        event: function (element, eventName) {
            if (document.createEvent) {
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent(eventName, true, true);
                element.dispatchEvent(evt);
            } else {
                var evt = document.createEventObject();
                element.fireEvent('on' + eventName, evt);
            }
        }, keyEvent: function (element, type, options) {
            var evt, e = {
                bubbles: true,
                cancelable: true,
                view: window,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                keyCode: 0,
                charCode: 0
            };
            extend(e, options);
            if (document.createEvent) {
                try {
                    evt = document.createEvent('KeyEvents');
                    evt.initKeyEvent(type, e.bubbles, e.cancelable, e.view, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.keyCode, e.charCode);
                    element.dispatchEvent(evt);
                } catch (err) {
                    evt = document.createEvent("Events");
                    evt.initEvent(type, e.bubbles, e.cancelable);
                    extend(evt, {
                        view: e.view,
                        ctrlKey: e.ctrlKey,
                        altKey: e.altKey,
                        shiftKey: e.shiftKey,
                        metaKey: e.metaKey,
                        keyCode: e.keyCode,
                        charCode: e.charCode
                    });
                    element.dispatchEvent(evt);
                }
            }
        }, keypress: function (element, chr) {
            var charCode = chr.charCodeAt(0);
            this.keyEvent(element, 'keypress', {
                keyCode: charCode, charCode: charCode
            });
        }, keydown: function (element, chr) {
            var charCode = chr.charCodeAt(0);
            this.keyEvent(element, 'keydown', {
                keyCode: charCode, charCode: charCode
            });
        }, keyup: function (element, chr) {
            var charCode = chr.charCodeAt(0);
            this.keyEvent(element, 'keyup', {
                keyCode: charCode, charCode: charCode
            });
        }, change: function (element) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            element.dispatchEvent(evt);
        }
    };

    var events = ['click', 'focus', 'blur', 'dblclick', 'input', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'resize', 'scroll', 'select', 'submit', 'load', 'unload', 'mouseleave'];
    for (var i = events.length; i--;) {
        (function (evt) {
            Simulate[evt] = function (element) {
                this.event(element, evt);
            };
        }(events[i]));
    }

    // Attach the Simulate object to the window
    window.Simulate = Simulate;
}();
/*
 * From down here
 *
 *Copyright (C) 2015 Constantin Tschuertz
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 *This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// Test for send wrapper (TODO)
// Global variable to track waiting state
window.need_to_wait = false;

// Save the original XMLHttpRequest 'open' method
var originalOpen = XMLHttpRequest.prototype['open'];

// Override the 'open' method of XMLHttpRequest
XMLHttpRequest.prototype['open'] = function () {
    window.need_to_wait = true; // Set the need_to_wait flag
    return originalOpen.apply(this, arguments); // Call the original method
}

// Callback wrapper function
function callbackWrap(object, property, argumentIndex, wrapperFactory) {
    var original = object[property]; // Store the original method
    object[property] = function () {
        wrapperFactory(this, arguments); // Execute the wrapper factory
        return original.apply(this, arguments); // Call the original method
    }
    return original; // Return the original method
}

// Define waiting time limits
window.max_waiting_time = 65000; // Maximum waiting time
window.min_waiting_time = 0; // Minimum waiting time


// Function to wrap timing callback
function timingCallbackWrap(object, property, argumentIndex, wrapperFactory) {
    var original = object[property];

    object[property] = function () {
        // Limit the waiting time
        if (arguments[1] > window.max_waiting_time) {
            arguments[1] = window.max_waiting_time;
        }
        wrapperFactory(this, arguments);
        return original.apply(this, arguments);
    }
    return original;
}

// Function to wrap call interception
function callInterceptionWrapper(object, property, argumentIndex, wrapperFactory) {
    var original = object[property];
    object[property] = function () {
        wrapperFactory(this, arguments);
        return null; // Return null instead of original call
    }
    return original;
}

// Function to observe XMLHttpRequest 'open' method
function XMLHTTPObserverOpen(elem, args) {
    var resp = {
        "url": args[1], "method": args[0]
    };
    var random_num = Math.floor((Math.random() * 10000) + 1);
    //console.log("Uniq Id set: " + random_num);
    elem.jaeks_id = random_num; // Assign unique ID to the element
    //resp = JSON.stringify(resp);
    window.timeouts.push(resp); // Ensure timeouts is on the window object
    console.log("Observer " + resp);
    //jswrapper.xmlHTTPRequestOpen(resp);
}

// Function to observe XMLHttpRequest 'send' method
function XMLHTTPObserverSend(elem, args) {
    var elems = [];
    for (var i = 0; i < args.length; i++) {
        elems.push(args[i]);
    }
    var resp = {
        "parameters": elems
    };
    //console.log("Uniq Id: " + elem.jaeks_id);
    resp = JSON.stringify(resp);
    console.log("Send " + resp);
    //jswrapper.xmlHTTPRequestSend(resp);
}


window.window_open_urls = []

function openWrapper(elem, args) {
    console.log("edo mpike omos");
    window.window_open_urls.push(args[0])
}

window.timeouts = Array();

function timeoutWrapper(elem, args) {
    function_id = MD5(args[0].toString());
    resp = {
        "function_id": function_id, "function_name": args[0].name, "time": args[1]
    };
    //resp = JSON.stringify(resp)
    window.timeouts.push(resp);
    //jswrapper.timeout(resp)
}

function intervallWrapper(elem, args) {
    function_id = MD5(args[0].toString());
    resp = {
        "function_id": function_id, "time": args[1]
    };
    resp = JSON.stringify(resp)
    //jswrapper.intervall(resp)
}

function getXPath(element) {

    try {
        var xpath = '';

        // Updated by Benjamin
        if (element.id) {
            return '//*[@id="' + element.id + '"]';
        }
        //

        for (; element && element.nodeType == 1; element = element.parentNode) {

            var sibblings = element.parentNode.childNodes;
            var same_tags = []
            for (var i = 0; i < sibblings.length; i++) { // collecting same
                if (element.tagName === sibblings[i].tagName) {
                    same_tags[same_tags.length] = sibblings[i]
                }
            }

            var id = same_tags.indexOf(element) + 1;
            id > 1 ? (id = '[' + id + ']') : (id = '');
            xpath = '/' + element.tagName.toLowerCase() + id + xpath;
        }
        return xpath;
    } catch (e) {
        console.log("Error: " + e)
        return "";
    }
}


window.added_events = Array();

function addEventListenerWrapper(elem, args) {


    // Could move and only use when XPATH fails
    // console.log(elem)
    // console.log("ID: " + elem.id)
    // console.log("HTML: " + elem.outerHTML)

    tag = elem.tagName
    dom_adress = "";
    id = elem.id;
    html_class = elem.className;
    //console.log("AddEventLIstenerWrapper: " + tag + " - Event: " + args[0] + " ID " + id)
    dom_adress = getXPath(elem);

    if (!dom_adress) {
        console.log("No dom_adress, using fake-id")
        elem.id = MD5(elem.outerHTML);
        dom_adress = '//*[@id="' + elem.id + '"]';
    }

    function_id = MD5(args[1].toString())
    resp = {
        "event": args[0], "function_id": function_id, "addr": dom_adress, "id": id, "tag": tag, "class": html_class
    }
    //console.log(resp)
    //resp = JSON.stringify(resp)
    window.added_events.push(resp)
    //jswrapper.add_eventListener_to_element(resp)
    if (args[0] == "change") {
        inputs = elem.querySelectorAll("input");
        selects = elem.querySelectorAll("select");
        options = elem.querySelectorAll("option");

        for (i = 0; i < inputs.length; i++) {
            e = inputs[i];
            if (e.getAttribute("type") == "radio" || e.getAttribute("type") == "checkbox") {
                tag = e.tagName
                id = e.id;
                html_class = e.className;
                dom_adress = getXPath(e);
                function_id = "";
                resp = {
                    "event": "change",
                    "function_id": function_id,
                    "addr": dom_adress,
                    "id": id,
                    "tag": tag,
                    "class": html_class
                }
                resp = JSON.stringify(resp)
                jswrapper.add_eventListener_to_element(resp)
            }
        }
        for (i = 0; i < selects.length; i++) {
            s = selects[i];
            tag = s.tagName
            id = s.id;
            html_class = s.className;
            dom_adress = getXPath(s);
            function_id = "";
            resp = {
                "event": "change",
                "function_id": function_id,
                "addr": dom_adress,
                "id": id,
                "tag": tag,
                "class": html_class
            }
            resp = JSON.stringify(resp)
            jswrapper.add_eventListener_to_element(resp)
        }
        for (xx = 0; xx < options.length; xx++) {
            element = options[i]
            tag = element.tagName
            id = element.id;
            html_class = element.className;
            dom_adress = getXPath(element);
            function_id = "";
            resp = {
                "event": "change",
                "function_id": function_id,
                "addr": dom_adress,
                "id": id,
                "tag": tag,
                "class": html_class
            }
            resp = JSON.stringify(resp)
            jswrapper.add_eventListener_to_element(resp)
        }
    }
    if (tag == "TABLE" && args[0] == "click") {
        candidates = elem.querySelectorAll("button");
        for (xx = 0; xx < candidates.length; xx++) {
            var element = candidates[xx];
            tag = element.tagName;
            id = element.id;
            html_class = element.className;
            dom_adress = getXPath(element);
            function_id = "";
            resp = {
                "event": "click",
                "function_id": function_id,
                "addr": dom_adress,
                "id": id,
                "tag": tag,
                "class": html_class
            };
            //resp = JSON.stringify(resp);
            window.added_events.push(resp)
            //console.log("Hello " + resp)
            //console.log(element.click)
            //jswrapper.add_eventListener_to_element(resp);
        }
        ;
    }
}

function bodyAddEventListenerWrapper(elem, args) {
    tag = "body"
    dom_adress = "";
    id = elem.id;
    html_class = elem.className;
    function_id = MD5(args[1].toString())
    dom_adress = "/html/body"
    resp = {
        "event": args[0], "function_id": function_id, "addr": dom_adress, "id": id, "tag": tag, "class": html_class
    }
    resp = JSON.stringify(resp)
    console.log(resp)
    //jswrapper.add_eventListener_to_element(resp)

}

// property_obs.js

/*
 *Copyright (C) 2015 Constantin Tschuertz
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 *This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


function catch_properties() {

    resps = []
    var elems = document.getElementsByTagName('*')
    // console.log(elems.length + " elems found...")
    for (my_counter_i = 0; my_counter_i < elems.length; my_counter_i++) {
        events = []
        tag = elems[my_counter_i].tagName
        dom_address = ""
        id = elems[my_counter_i].id
        if (elems[my_counter_i].onclick != null) {
            events.push({"method": "onclick", "func": elems[my_counter_i].onclick})
        }
        if (elems[my_counter_i].onmouseover != null) {
            events.push({"method": "onmouseover", "func": elems[my_counter_i].onmouseover})
        }
        if (elems[my_counter_i].onabort != null) {
            events.push({"method": "onabort", "func": elems[my_counter_i].onabort})
        }
        if (elems[my_counter_i].onblur != null) {
            events.push({"method": "onblur", "func": elems[my_counter_i].onblur})
        }
        if (elems[my_counter_i].onchange != null) {
            events.push({"method": "onchange", "func": elems[my_counter_i].onchange})
        }
        if (elems[my_counter_i].oninput != null) {
            events.push({"method": "oninput", "func": elems[my_counter_i].oninput})
        }
        if (elems[my_counter_i].ondblclick != null) {
            events.push({"method": "ondblclick", "func": elems[my_counter_i].ondblclick})
        }
        if (elems[my_counter_i].onerror != null) {
            events.push({"method": "onerror", "func": elems[my_counter_i].onerror})
        }
        if (elems[my_counter_i].onfocus != null) {
            events.push({"method": "onfocus", "func": elems[my_counter_i].onfocus})
        }
        if (elems[my_counter_i].onkeydown != null) {
            events.push({"method": "onkeydown", "func": elems[my_counter_i].onkeydown})
        }
        if (elems[my_counter_i].onkeypress != null) {
            events.push({"method": "onkeypress", "func": elems[my_counter_i].onkeypress})
        }
        if (elems[my_counter_i].onkeyup != null) {
            events.push({"method": "onkeyup", "func": elems[my_counter_i].onkeyup})
        }
        if (elems[my_counter_i].onmousedown != null) {
            events.push({"method": "onmousedown", "func": elems[my_counter_i].onmousedown})
        }
        if (elems[my_counter_i].onmousemove != null) {
            events.push({"method": "onmousemove", "func": elems[my_counter_i].onmousemove})
        }
        if (elems[my_counter_i].onmouseout != null) {
            events.push({"method": "onmouseout", "func": elems[my_counter_i].onmouseout})
        }
        if (elems[my_counter_i].onmouseup != null) {
            events.push({"method": "onmouseup", "func": elems[my_counter_i].onmouseup})
        }
        //console.log("We have: " + events.length + " events");
        if (events.length > 0) {
            elem = elems[my_counter_i]
            dom_adress = getXPath(elem);
            html_class = elems[my_counter_i].className;
            for (my_counter_j = 0; my_counter_j < events.length; my_counter_j++) {
                //function_id = MD5(events[my_counter_j].func.toString() )
                function_id = MD5(events[my_counter_j].func.toString() + dom_adress)

                f = events[my_counter_j].func.toString()
                e = events[my_counter_j].event_type
                //clickable = JSON.parse(events[j])
                tut1 = events[my_counter_j];
                resp = {
                    "function_id": function_id,
                    "event": events[my_counter_j].method,
                    "func": events[my_counter_j].func.toString(),
                    "id": id,
                    "tag": tag,
                    "addr": dom_adress,
                    "class": html_class
                }
                //resp = JSON.stringify(resp);
                resps.push(resp);
            }
        }

    }
    return JSON.stringify(resps);
}

// md5.js

function md5cycle(x, k) {
    var a = x[0], b = x[1], c = x[2], d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);

}

function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
}

function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
}

function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
}

function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
}

function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
}

function md51(s) {
    txt = '';
    var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i;
    for (i = 64; i <= s.length; i += 64) {
        md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
        md5cycle(state, tail);
        for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
}

/* there needs to be support for Unicode here,
 * unless we pretend that we can redefine the MD-5
 * algorithm for multi-byte characters (perhaps
 * by adding every four 16-bit characters and
 * shortening the sum to 32 bits). Otherwise
 * I suggest performing MD-5 as if every character
 * was two bytes--e.g., 0040 0025 = @%--but then
 * how will an ordinary MD-5 sum be matched?
 * There is no way to standardize text to something
 * like UTF-8 before transformation; speed cost is
 * utterly prohibitive. The JavaScript standard
 * itself needs to look at this: it should start
 * providing access to strings as preformed UTF-8
 * 8-bit unsigned value arrays.
 */
function md5blk(s) { /* I figured global was faster.   */
    var md5blks = [], i; /* Andy King said do it this way. */
    for (i = 0; i < 64; i += 4) {
        md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
}

var hex_chr = '0123456789abcdef'.split('');

function rhex(n) {
    var s = '', j = 0;
    for (; j < 4; j++) s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
    return s;
}

function hex(x) {
    for (var i = 0; i < x.length; i++) x[i] = rhex(x[i]);
    return x.join('');
}

function MD5(s) {
    return hex(md51(s));
}

/* this function is much faster,
so if possible we use it. Some IEs
are the only ones I know of that
need the idiotic second function,
generated by an if clause.  */

function add32(a, b) {
    return (a + b) & 0xFFFFFFFF;
}

// addeventlistener_wrapper.js

/*
 *Copyright (C) 2015 Constantin Tschuertz
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 *This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


// This JS-Script wrapps the addEventListener-Function, that is used by JQuery
callbackWrap(Element.prototype, "addEventListener", 1, addEventListenerWrapper);
callbackWrap(Document.prototype, "addEventListener", 1, bodyAddEventListenerWrapper);

// timing_wrapper.js

/*
 *Copyright (C) 2015 Constantin Tschuertz
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 *This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


// This JS-Script wrapps the addEventListener-Function, that is used by JQuery
timingCallbackWrap(window, "setTimeout", 0, timeoutWrapper);
timingCallbackWrap(window, "setInterval", 0, intervallWrapper);

//window_wrapper.js


//timingCallbackWrap(window, "open", 0, openWrapper);

window["open"] = function () {
    openWrapper(this, arguments);
}


//timingCallbackWrap(window, "setInterval", 0, intervallWrapper);


// xss_xhr.js


window.xss_array = []

function xss(data) {
    // var oReq = new XMLHttpRequest();
    // oReq.open("GET", "http://localhost:9001/?data=" + data);
    // oReq.send();
    window.xss_array.push(data);
}

// remove_alerts.js

(function (proxied) {
    window.alert = function () {
    };
})(window.alert);

(function (proxied) {
    window.confirm = function () {
        return true;
    };
})(window.confirm);

// forms.js


function get_forms() {
    var forms = document.forms;
    var obj_forms = [];
    for (var i = 0; i < forms.length; i++) {
        form = {
            "action": forms[i].action, "method": forms[i].method, "elements": []
        };
        els = forms[i].elements;
        for (var j = 0; j < els.length; j++) {
            form.elements.push({
                "name": els[j].name, "type": els[j].type, "xpath": getXPath(els[j])
            });
        }
        obj_forms.push(form);
    }
    return JSON.stringify(obj_forms);
}

function hello() {
    console.log("helloooo");
}