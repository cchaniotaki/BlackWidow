// content.js
// Create a new script element
const script = document.createElement('script');

// Set the script content
script.textContent = 'var x = 10; console.log("Variable x set to:", x);';

// Append the script to the document body
(document.head || document.documentElement).appendChild(script);

// Optionally, remove the script element after execution
script.remove();
