var user = require(process.cwd() + '/app/web/controllers/user.server.controller');
module.exports = function(app){

    // 로그인 API
    app.route('/login_admin')
        .post(user.loginAdmin);
    app.get('/login_admin', user.loginAdmin);

    // 회원 관리 페이지
    app.get('/user_manage', user.userManage);

    // 회원 상세 정보 페이지
    app.get('/user_details', user.userDetails);

    // 회원 정보 조회 API
    app.get('/user_list', user.retrieveUserList);

    // 회원 영구 정지 API
    app.route('/user_block')
        .post(user.updateUserStatus);

    // 회원 포인트, 상품 구매 내역, 복권 참가 내역 API
    app.get('/details_of_point_history_web', user.retrieveUserPointHistory);
    app.get('/details_of_all_product_web', user.retrieveUserAllProduct);
    app.get('/details_of_all_participation_web', user.retrieveUserAllParticipation);
};