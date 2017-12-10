module.exports = function(app){
	var index = require(process.cwd() + '/app/mobile/controllers/index.server.controller');
	app.get('/', index.render);
};