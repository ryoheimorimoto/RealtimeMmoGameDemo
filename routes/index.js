/*
 * GET home page.
 */
exports.index = function(req, res) {
	res.render('index', {
		title : 'node.js de Realtime MMO proto',
	});
};
