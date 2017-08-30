var logger = require(__dirname + '\\../../config/winston'),
    pool = require(__dirname + '\\../../config/maria.pool'),
    jwt = require('jsonwebtoken'),
    tokenCheck = require(__dirname + '\\token.server.controller');

exports.details_of_participation = function (req, res) {
    var isValidatedToken = tokenCheck.check(req),
        requestPhoneNumber;

    if (isValidatedToken) {
        var tokenData = jwt.verify(req.headers["x-access-token"], 'developmentTokenSecret');
        requestPhoneNumber = tokenData.phone_number;
    } else {
        return res.json({isSuccess: false, errorMessage: "토큰이 만료되었습니다."});
    }

    var requestEventType = req.body.event_type,
        requestEventDate = req.body.event_date,
        requestEventNumber = req.body.event_number,
        requestConfirmStatus = req.body.confirm_status;

    if (!requestEventType) return res.json({isSuccess: false, errorMessage: "조회하려는 타입을 골라주세요."});
    if (!requestEventDate) return res.json({isSuccess: false, errorMessage: "조회하려는 날짜를 입력해주세요."});
    if (!requestEventNumber) return res.json({isSuccess: false, errorMessage: "조회하려는 회차를 입력해주세요."});
    if (!requestConfirmStatus) return res.json({isSuccess: false, errorMessage: "조회하려는 추첨여부를 입력해주세요."});

    requestEventType = requestEventType.replace(/(\s*)/g, "");
    requestEventDate = requestEventDate.replace(/(\s*)/g, "");
    requestEventNumber = requestEventNumber.replace(/(\s*)/g, "");
    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
                WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6, PARTICIPATING_TIME \
                FROM PARTICIPATION \
                WHERE EVENT_TYPE = ? \
                AND EVENT_DATE = ? \
                AND EVENT_NUMBER = ? \
                AND PHONE_NUMBER = ? \
                AND CONFIRM_STATUS = ?',
                timeout: 10000
            },
            [requestEventType, requestEventDate, requestEventNumber,
                requestPhoneNumber, requestConfirmStatus],
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
    var isValidatedToken = tokenCheck.check(req),
        requestPhoneNumber;

    if (isValidatedToken) {
        var tokenData = jwt.verify(req.headers["x-access-token"], 'developmentTokenSecret');
        requestPhoneNumber = tokenData.phone_number;
    } else {
        return res.json({isSuccess: false, errorMessage: "토큰이 만료되었습니다."});
    }

    var requestEventType = req.body.event_type,
        requestEventDate = req.body.event_date,
        requestEventNumber = req.body.event_number,
        requestWinningNumber1 = req.body.winning_number_1,
        requestWinningNumber2 = req.body.winning_number_2,
        requestWinningNumber3 = req.body.winning_number_3,
        requestWinningNumber4 = req.body.winning_number_4,
        requestWinningNumber5 = req.body.winning_number_5,
        requestWinningNumber6 = req.body.winning_number_6;

    if (!requestEventType) return res.json({isSuccess: false, errorMessage: "조회하려는 타입을 골라주세요."});
    if (!requestEventDate) return res.json({isSuccess: false, errorMessage: "조회하려는 날짜를 입력해주세요."});
    if (!requestEventNumber) return res.json({isSuccess: false, errorMessage: "조회하려는 회차를 입력해주세요."});
    if (!requestWinningNumber1) return res.json({isSuccess: false, errorMessage: "첫번째 추첨번호를 입력해주세요."});
    if (!requestWinningNumber2) return res.json({isSuccess: false, errorMessage: "두번째 추첨번호를 입력해주세요."});
    if (!requestWinningNumber3) return res.json({isSuccess: false, errorMessage: "세번째 추첨번호를 입력해주세요."});
    if (!requestWinningNumber4) return res.json({isSuccess: false, errorMessage: "네번째 추첨번호를 입력해주세요."});
    if (!requestWinningNumber5) return res.json({isSuccess: false, errorMessage: "다섯번째 추첨번호를 입력해주세요."});
    if (!requestWinningNumber6) return res.json({isSuccess: false, errorMessage: "여섯번째 추첨번호를 입력해주세요."});

    requestEventType = requestEventType.replace(/(\s*)/g, "");
    requestEventDate = requestEventDate.replace(/(\s*)/g, "");
    requestEventNumber = requestEventNumber.replace(/(\s*)/g, "");
    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");

    if (requestEventType === '1') {
        if (parseInt(requestEventNumber, 10) < 0 || parseInt(requestEventNumber, 10) > 23) {
            return res.json({isSuccess: false, errorMessage: "로또 회차 값이 잘못되었습니다."});
        }
    } else if (requestEventType === '2') {
        if (requestEventNumber !== '00' && requestEventNumber !== '06' && requestEventNumber !== '12' && requestEventNumber !== '18') {
            return res.json({isSuccess: false, errorMessage: "로또 회차 값이 잘못되었습니다."});
        }
    } else if (requestEventType === '3') {
        if (requestEventNumber !== '00' && requestEventNumber !== '12') {
            return res.json({isSuccess: false, errorMessage: "로또 회차 값이 잘못되었습니다."});
        }
    } else {
        return res.json({isSuccess: false, errorMessage: "로또 타입 값이 잘못되었습니다."});
    }

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT COUNT(1) AS COUNT \
                FROM PARTICIPATION \
                WHERE EVENT_TYPE = ? \
                AND EVENT_DATE = ? \
                AND EVENT_NUMBER = ? \
                AND PHONE_NUMBER = ?',
                timeout: 10000
            },
            [requestEventType, requestEventDate, requestEventNumber,
                requestPhoneNumber],
            function (error, results, columns) {
                if (error) {
                    connection.release();
                    logger().info('참여내역조회 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage});
                }

                if (results[0].COUNT > 0) {
                    connection.release();
                    return res.json({isSuccess: false, errorMessage: "이미 참가한 내역이 존재합니다."});
                }

                connection.query({
                        sql: 'INSERT INTO PARTICIPATION (EVENT_TYPE, EVENT_DATE, EVENT_NUMBER, PHONE_NUMBER, \
                        WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
                        WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6) \
                        VALUES (?, ?, ?, ?, \
                        ?, ?, ?, \
                        ?, ?, ?)',
                        timeout: 10000
                    },
                    [requestEventType, requestEventDate, requestEventNumber, requestPhoneNumber,
                        requestWinningNumber1, requestWinningNumber2, requestWinningNumber3,
                        requestWinningNumber4, requestWinningNumber5, requestWinningNumber6],
                    function (error, results, columns) {
                        connection.release();

                        if (error) {
                            logger().info('로또참여 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                            return res.json({isSuccess: false, errorMessage: "로또참여 오류 : " + error.sqlMessage});
                        }

                        return res.json({isSuccess: true, errorMessage: ""});
                    });
            });
    });
};