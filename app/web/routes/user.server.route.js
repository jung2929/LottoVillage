var user = require(process.cwd() + '/app/web/controllers/user.server.controller');
module.exports = function(app){
    app.route('/login_web')
        .post(user.loginWeb);
    app.get('/user_list', user.retrieveUserList);
    app.route('/user_block')
        .post(user.updateUserStatus);
    app.get('/details_of_point_history_web', user.retrieveUserPointHistory);
    app.get('/details_of_all_product_web', user.retrieveUserAllProduct);
    app.get('/details_of_all_participation_web', user.retrieveUserAllParticipation);
};