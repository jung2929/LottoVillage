var logger = require(__dirname + '\\../../config/winston'),
    pool = require(__dirname + '\\../../config/maria.pool'),
    jwt = require('jsonwebtoken'),
    tokenCheck = require(__dirname + '\\token.server.controller');

exports.details_of_participation = function (req, res) {
    var isValidatedToken = tokenCheck.check(req),
        requestPhoneNumber;

    console.log(req.body);

    if (isValidatedToken) {
        var tokenData = jwt.verify(req.headers["x-access-token"], 'developmentTokenSecret');
        requestPhoneNumber = tokenData.phone_number;
    } else {
        return res.json({isSuccess: false, errorMessage: "토큰이 만료되었습니다."});
    }

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
                WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6, PARTICIPATING_TIME \
                FROM PARTICIPATION \
                WHERE EVENT_TYPE = ? \
                AND EVENT_DATE = ? \
                AND EVENT_NUMBER = ? \
                AND PHONE_NUMBER = ? \
                AND CONFIRM_STATUS = ?'
            },
            [req.body.event_type, req.body.event_date, req.body.event_number,
                requestPhoneNumber, req.body.confirm_status],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('참여내역조회 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage});
                }

                if (!results.length) {
                    return res.json({isSuccess: false, errorMessage: "참가내역이 존재하지 않습니다."});
                }

                return res.json({isSuccess: true, errorMessage: "", results: results});
            });
    });
};

exports.participation = function (req, res) {
    if (req.session.phone_number === undefined || req.session.password === undefined) {
        logger().info('쿠키/세션 내역 없는데 로또 참여 시도 흔적');
        return res.json({isSuccess: false, errorMessage: "로그인된 내역이 없습니다."});
    }

    console.log('req - ' +req.cookies.jjsoft_lotto_village);
    console.log('req.session - ' + req.session.cookies);

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'INSERT INTO PARTICIPATION (EVENT_TYPE, EVENT_DATE, EVENT_NUMBER, PHONE_NUMBER, \
                WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
                WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6) \
                VALUES (?, ?, ?, ?, \
                ?, ?, ?, \
                ?, ?, ?);',
                timeout: 10000
            },
            [req.body.event_type, req.body.event_date, req.body.event_number, req.body.phone_number,
                req.body.winning_number_1, req.body.winning_number_2, req.body.winning_number_3,
                req.body.winning_number_4, req.body.winning_number_5, req.body.winning_number_6],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('로또참여 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({isSuccess: false, errorMessage: "로또참여 오류 : " + error.sqlMessage});
                }

                return res.json({isSuccess: true, errorMessage: ""});
            });
    });
};