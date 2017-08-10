module.exports = function(app){
	var user = require(process.cwd() + '/app/controllers/user.server.controller');
	app.get('/login', user.render);
};