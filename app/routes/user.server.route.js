var user = require(process.cwd() + '/app/controllers/user.server.controller');
module.exports = function(app){
	app.route('/login')
		.get(user.render);
};