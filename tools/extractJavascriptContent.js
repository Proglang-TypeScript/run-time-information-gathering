/* global require */

"use strict";

var HTMLParser = require('node-html-parser');
const getStdin = async () => (await import('get-stdin')).default();
 
getStdin().then(html => {
	var root = HTMLParser.parse(
		html,
		{
			script: true,
		}
	);

	root.querySelectorAll("script").map(function(elem) {
		console.log(elem.rawText);
	});
});
