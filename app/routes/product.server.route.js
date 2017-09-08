module.exports = function(app){
	var product = require(process.cwd() + '/app/controllers/product.server.controller');
	app.get('/', product.render);
};