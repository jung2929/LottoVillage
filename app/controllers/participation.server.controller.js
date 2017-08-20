var logger = require(__dirname + '\\../../config/winston'),
    pool = require(__dirname + '\\../../config/maria.pool');

exports.details_of_participation = function (req, res) {
    if (req.session.id === undefined || req.session.password === undefined) {
        logger().info('쿠키/세션 내역 없는데 로그아웃 시도 흔적');
        return res.json({isSuccess: false, errorMessage: "로그인된 내역이 없습니다."});
    }
    logger().info("내가 참여한내역 통신완료");
    return res.json({isSuccess: false, errorMessage: "내가 참여한내역 통신완료"});
};

exports.participation = function (req, res) {
    if (req.session.id === undefined || req.session.password === undefined) {
        logger().info('쿠키/세션 내역 없는데 로그아웃 시도 흔적');
        return res.json({isSuccess: false, errorMessage: "로그인된 내역이 없습니다."});
    }
    logger().info("참여하기 완료");
    return res.json({isSuccess: false, errorMessage: "참여하기 완료"});
};