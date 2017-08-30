module.exports = function(app){
	var index = require(process.cwd() + '/app/controllers/index.server.controller');
	app.get('/', index.render);
};