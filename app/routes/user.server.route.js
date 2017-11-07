var user = require(process.cwd() + '/app/controllers/user.server.controller');
module.exports = function(app){
    app.get('/my_point', user.retrievePoint);
    app.get('/details_of_point_history', user.detailsOfPointHistory);
	app.route('/login')
		.post(user.login);
	app.route('/register')
		.post(user.register);
};