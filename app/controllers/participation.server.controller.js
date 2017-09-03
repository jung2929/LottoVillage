var logger = require(process.cwd() + '/config/winston'),
    pool = require(process.cwd() + '/config/maria.pool'),
    jwt = require('jsonwebtoken'),
    tokenCheck = require(process.cwd() + '/app/controllers/token.server.controller'),
    randomIntArray = require('random-int-array'),
    dateFormat = require('dateformat');

exports.details_of_lotto = function (req, res) {
    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT WINNING_DATE, WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
                WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6, BONUS_NUMBER, \
                TOTAL_PRIZE_1, TOTAL_NUMBER_1, PER_PRIZE_1, \
                TOTAL_PRIZE_2, TOTAL_NUMBER_2, PER_PRIZE_2, \
                TOTAL_PRIZE_3, TOTAL_NUMBER_3, PER_PRIZE_3, \
                TOTAL_PRIZE_4, TOTAL_NUMBER_4, PER_PRIZE_4, \
                TOTAL_PRIZE_5, TOTAL_NUMBER_5, PER_PRIZE_5 \
                FROM LOTTO_INFO \
                WHERE PK_ID = ?',
                timeout: 10000
            },
            [req.query.rounds],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('로또당첨번호 조회 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage});
                }

                if (!results.length) {
                    return res.json({isSuccess: false, errorMessage: "로또당첨번호가 존재하지 않습니다."});
                }

                return res.json({isSuccess: true, errorMessage: "", results: results});
            });
    });
};

exports.details_of_participation = function (req, res) {
    var isValidatedToken = tokenCheck.check(req),
        requestPhoneNumber;

    if (isValidatedToken) {
        var tokenData = jwt.verify(req.headers["x-access-token"], 'developmentTokenSecret');
        requestPhoneNumber = tokenData.phone_number;
    } else {
        return res.json({isSuccess: false, errorMessage: "토큰이 만료되었습니다."});
    }

    var requestEventType = req.query.event_type,
        requestEventDate = req.query.event_date,
        requestEventNumber = req.query.event_number,
        requestConfirmStatus = req.query.confirm_status;

    if (!requestEventType) return res.json({isSuccess: false, errorMessage: "조회하려는 타입을 골라주세요."});
    if (requestConfirmStatus === undefined) return res.json({isSuccess: false, errorMessage: "조회하려는 추첨여부를 입력해주세요."});

    requestEventType = requestEventType.replace(/(\s*)/g, "");
    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");

    if (requestConfirmStatus === 'false') {
        requestEventDate = dateFormat(new Date(), 'yymmdd');
        requestEventNumber = dateFormat(new Date(), 'HH');
    }

    switch (requestEventType) {
        case '1':
            requestEventNumber++;
            if (requestEventNumber === 24) {
                requestEventNumber = '00';
            }
            break;
        case '2':
            switch (true) {
                case (requestEventNumber >= 0 && requestEventNumber < 6):
                    requestEventNumber = '06';
                    break;
                case (requestEventNumber >= 6 && requestEventNumber < 12):
                    requestEventNumber = '12';
                    break;
                case (requestEventNumber >= 12 && requestEventNumber < 18):
                    requestEventNumber = '18';
                    break;
                case (requestEventNumber >= 18 && requestEventNumber <= 23):
                    requestEventNumber = '00';
                    break;
            }
            break;
        case '3':
            switch (true) {
                case (requestEventNumber >= 0 && requestEventNumber < 12):
                    requestEventNumber = '12';
                    break;
                case (requestEventNumber >= 12 && requestEventNumber <= 23):
                    requestEventNumber = '00';
                    break;
            }
            break;
        default:
            return res.json({isSuccess: false, errorMessage: "로또 타입 값이 잘못되었습니다."});
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
        requestEventDate = dateFormat(new Date(), 'yymmdd'),
        requestEventNumber = dateFormat(new Date(), 'HH');

    if (!requestEventType) return res.json({isSuccess: false, errorMessage: "조회하려는 타입을 골라주세요."});

    requestEventType = requestEventType.replace(/(\s*)/g, "");
    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");

    switch (requestEventType) {
        case '1':
            requestEventNumber++;
            requestEventNumber = requestEventNumber < 10 ? '0' + requestEventNumber : requestEventNumber;
            if (requestEventNumber === 24) {
                requestEventDate = dateFormat(new Date().getDate() + 1, 'yymmdd');
                requestEventNumber = '00';
            }
            break;
        case '2':
            switch (true) {
                case (requestEventNumber >= 0 && requestEventNumber < 6):
                    requestEventNumber = '06';
                    break;
                case (requestEventNumber >= 6 && requestEventNumber < 12):
                    requestEventNumber = '12';
                    break;
                case (requestEventNumber >= 12 && requestEventNumber < 18):
                    requestEventNumber = '18';
                    break;
                case (requestEventNumber >= 18 && requestEventNumber <= 23):
                    requestEventDate = dateFormat(new Date().getDate() + 1, 'yymmdd');
                    requestEventNumber = '00';
                    break;
            }
            break;
        case '3':
            switch (true) {
                case (requestEventNumber >= 0 && requestEventNumber < 12):
                    requestEventNumber = '12';
                    break;
                case (requestEventNumber >= 12 && requestEventNumber <= 23):
                    requestEventDate = dateFormat(new Date().getDate() + 1, 'yymmdd');
                    requestEventNumber = '00';
                    break;
            }
            break;
        default:
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

                var lottoVillageWinnerNumbers = randomIntArray({count : 7, min: 1, max: 45, unique: true});
                lottoVillageWinnerNumbers.sort(function (a, b) {
                    return a - b;
                });
                var requestWinningNumber1 = lottoVillageWinnerNumbers[0],
                    requestWinningNumber2 = lottoVillageWinnerNumbers[1],
                    requestWinningNumber3 = lottoVillageWinnerNumbers[2],
                    requestWinningNumber4 = lottoVillageWinnerNumbers[3],
                    requestWinningNumber5 = lottoVillageWinnerNumbers[4],
                    requestWinningNumber6 = lottoVillageWinnerNumbers[5];

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