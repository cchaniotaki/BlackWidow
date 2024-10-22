const lib = document.createElement('lib');
lib.src = 'js/lib.js'; // Adjust the path accordingly
document.head.appendChild(lib);

const property_obs = document.createElement('property_obs');
property_obs.src = 'js/property_obs.js'; // Adjust the path accordingly
document.head.appendChild(lib);

const md5 = document.createElement('md5');
md5.src = 'js/md5.js'; // Adjust the path accordingly
document.head.appendChild(property_obs);

const addeventlistener_wrapper = document.createElement('addeventlistener_wrapper');
addeventlistener_wrapper.src = 'js/addeventlistener_wrapper.js'; // Adjust the path accordingly
document.head.appendChild(addeventlistener_wrapper);

const timing_wrapper = document.createElement('timing_wrapper');
timing_wrapper.src = 'js/timing_wrapper.js'; // Adjust the path accordingly
document.head.appendChild(timing_wrapper);

const window_wrapper = document.createElement('window_wrapper');
window_wrapper.src = 'js/window_wrapper.js'; // Adjust the path accordingly
document.head.appendChild(window_wrapper);

const forms = document.createElement('forms');
forms.src = 'js/forms.js'; // Adjust the path accordingly
document.head.appendChild(forms);

const xss_xhr = document.createElement('xss_xhr');
xss_xhr.src = 'js/xss_xhr.js'; // Adjust the path accordingly
document.head.appendChild(xss_xhr);

const remove_alerts = document.createElement('remove_alerts');
remove_alerts.src = 'js/remove_alerts.js'; // Adjust the path accordingly
document.head.appendChild(remove_alerts);


