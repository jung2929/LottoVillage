module.exports = function(app){
	var index = require(__dirname + '\\../../app/controllers/index.server.controller');
	app.get('/', index.render);
};