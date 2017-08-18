var user = require(__dirname + '\\../../app/controllers/user.server.controller');
module.exports = function(app){
	app.route('/login')
		.get(user.login);
	app.route('/logout')
		.get(user.logout);
	app.route('/register')
		.post(user.register);
};