var user = require(process.cwd() + '/app/mobile/controllers/user.server.controller');
module.exports = function(app){
    app.get('/my_point', user.retrievePoint);
    app.get('/details_of_point_history', user.detailsOfPointHistory);
    app.route('/delete_user')
        .post(user.deleteUser);
    app.route('/update_user')
        .post(user.updateUser);
    app.get('/retrieve_user_info', user.retrieveUserInfo);
	app.route('/login')
		.post(user.login);
	app.route('/register')
		.post(user.register);
};