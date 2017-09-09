var logger = require(process.cwd() + '/config/winston'),
    pool = require(process.cwd() + '/config/maria.pool'),
    jwt = require('jsonwebtoken'),
    tokenCheck = require(process.cwd() + '/app/controllers/token.server.controller'),
    randomIntArray = require('random-int-array'),
    dateFormat = require('dateformat');

exports.lotto_rounds = function (req, res) {
    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT PK_ID AS MAX_ROUND \
                FROM LOTTO_INFO \
                ORDER BY PK_ID DESC\
                LIMIT 1',
                timeout: 10000
            },
            [],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('로또 회차 자료 조회 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage, results: ''});
                }

                if (!results.length) {
                    return res.json({isSuccess: false, errorMessage: "로또 회차 자료가 존재하지 않습니다.", results: ''});
                }

                return res.json({isSuccess: true, errorMessage: "", results: results[0].MAX_ROUND});
            });
    });
};

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
                    return res.json({
                        isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage,
                        results: [{
                            WINNING_DATE: '', WINNING_NUMBER_1: 0, WINNING_NUMBER_2: 0, WINNING_NUMBER_3: 0,
                            WINNING_NUMBER_4: 0, WINNING_NUMBER_5: 0, WINNING_NUMBER_6: 0, BONUS_NUMBER: 0,
                            TOTAL_PRIZE_1: '', TOTAL_NUMBER_1: '', PER_PRIZE_1: '',
                            TOTAL_PRIZE_2: '', TOTAL_NUMBER_2: '', PER_PRIZE_2: '',
                            TOTAL_PRIZE_3: '', TOTAL_NUMBER_3: '', PER_PRIZE_3: '',
                            TOTAL_PRIZE_4: '', TOTAL_NUMBER_4: '', PER_PRIZE_4: '',
                            TOTAL_PRIZE_5: '', TOTAL_NUMBER_5: '', PER_PRIZE_5: ''
                        }]
                    });
                }

                if (!results.length) {
                    return res.json({
                        isSuccess: false, errorMessage: "로또당첨번호가 존재하지 않습니다.",
                        results: [{
                            WINNING_DATE: '', WINNING_NUMBER_1: 0, WINNING_NUMBER_2: 0, WINNING_NUMBER_3: 0,
                            WINNING_NUMBER_4: 0, WINNING_NUMBER_5: 0, WINNING_NUMBER_6: 0, BONUS_NUMBER: 0,
                            TOTAL_PRIZE_1: '', TOTAL_NUMBER_1: '', PER_PRIZE_1: '',
                            TOTAL_PRIZE_2: '', TOTAL_NUMBER_2: '', PER_PRIZE_2: '',
                            TOTAL_PRIZE_3: '', TOTAL_NUMBER_3: '', PER_PRIZE_3: '',
                            TOTAL_PRIZE_4: '', TOTAL_NUMBER_4: '', PER_PRIZE_4: '',
                            TOTAL_PRIZE_5: '', TOTAL_NUMBER_5: '', PER_PRIZE_5: ''
                        }]
                    });
                }

                return res.json({isSuccess: true, errorMessage: "", results: results});
            });
    });
};

exports.details_of_winning_info = function (req, res) {
    var requestEventType = req.query.event_type,
        requestEventDate = req.query.event_date,
        requestEventNumber = req.query.event_number;

    if (!requestEventType) return res.json({isSuccess: false, errorMessage: "조회하려는 타입을 골라주세요."});
    if (!requestEventDate) return res.json({isSuccess: false, errorMessage: "조회하려는 날짜를 골라주세요."});
    if (!requestEventNumber) return res.json({isSuccess: false, errorMessage: "조회하려는 시간을 골라주세요."});

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT EVENT_TYPE, WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
                WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6, BONUS_NUMBER \
                FROM WINNING_INFO \
                WHERE EVENT_TYPE = ? \
                AND EVENT_DATE = ? \
                AND EVENT_NUMBER = ?',
                timeout: 10000
            },
            [requestEventType, requestEventDate, requestEventNumber],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('당첨 번호 조회 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({
                        isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage,
                        results: [{
                            EVENT_TYPE: requestEventType, WINNING_NUMBER_1: 0, WINNING_NUMBER_2: 0, WINNING_NUMBER_3: 0,
                            WINNING_NUMBER_4: 0, WINNING_NUMBER_5: 0, WINNING_NUMBER_6: 0, BONUS_NUMBER: 0
                        }]
                    });
                }

                if (!results.length) {
                    return res.json({
                        isSuccess: false, errorMessage: "당첨 번호가 존재하지 않습니다.",
                        results: [{
                            EVENT_TYPE: requestEventType, WINNING_NUMBER_1: 0, WINNING_NUMBER_2: 0, WINNING_NUMBER_3: 0,
                            WINNING_NUMBER_4: 0, WINNING_NUMBER_5: 0, WINNING_NUMBER_6: 0, BONUS_NUMBER: 0
                        }]
                    });
                }

                return res.json({isSuccess: true, errorMessage: "", results: results});
            });
    });
};

exports.details_of_all_winning_info = function (req, res) {
    var originalEventDate = new Date(),
        eventDate = new Date(),
        requestEventDate_1 = dateFormat(eventDate, 'yymmdd'),
        requestEventDate_2 = dateFormat(eventDate, 'yymmdd'),
        requestEventDate_3 = dateFormat(eventDate, 'yymmdd'),
        requestEventNumber_1 = dateFormat(eventDate, 'HH'),
        requestEventNumber_2 = dateFormat(eventDate, 'HH'),
        requestEventNumber_3 = dateFormat(eventDate, 'HH');

    // 6시간 단위 조건 값
    switch (true) {
        case (requestEventNumber_2 >= 0 && requestEventNumber_2 < 6):
            eventDate.setDate(originalEventDate.getDate() - 1);
            requestEventDate_2 = dateFormat(eventDate, 'yymmdd');
            requestEventNumber_2 = '00';
            break;
        case (requestEventNumber_2 >= 6 && requestEventNumber_2 < 12):
            requestEventNumber_2 = '06';
            break;
        case (requestEventNumber_2 >= 12 && requestEventNumber_2 < 18):
            requestEventNumber_2 = '12';
            break;
        case (requestEventNumber_2 >= 18 && requestEventNumber_2 <= 23):
            requestEventNumber_2 = '18';
            break;
    }

    // 12시간 단위 조건 값
    switch (true) {
        case (requestEventNumber_3 >= 0 && requestEventNumber_3 < 12):
            eventDate.setDate(originalEventDate.getDate() - 1);
            requestEventDate_3 = dateFormat(eventDate, 'yymmdd');
            requestEventNumber_3 = '00';
            break;
        case (requestEventNumber_3 >= 12 && requestEventNumber_3 <= 23):
            requestEventNumber_3 = '12';
            break;
    }

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT EVENT_TYPE, CONCAT(CONCAT("20", EVENT_DATE), CONCAT("-", EVENT_NUMBER)) AS EVENT_DATE_HOUR, WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
                WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6, BONUS_NUMBER \
                FROM WINNING_INFO \
                WHERE EVENT_TYPE = ? \
                AND EVENT_DATE = ? \
                AND EVENT_NUMBER = ? \
                \
                UNION ALL\
                \
                SELECT EVENT_TYPE, CONCAT(CONCAT("20", EVENT_DATE), CONCAT("-", EVENT_NUMBER)) AS EVENT_DATE_HOUR, WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
                WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6, BONUS_NUMBER \
                FROM WINNING_INFO \
                WHERE EVENT_TYPE = ? \
                AND EVENT_DATE = ? \
                AND EVENT_NUMBER = ? \
                \
                UNION ALL\
                \
                SELECT EVENT_TYPE, CONCAT(CONCAT("20", EVENT_DATE), CONCAT("-", EVENT_NUMBER)) AS EVENT_DATE_HOUR, WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
                WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6, BONUS_NUMBER \
                FROM WINNING_INFO \
                WHERE EVENT_TYPE = ? \
                AND EVENT_DATE = ? \
                AND EVENT_NUMBER = ?',
                timeout: 10000
            },
            ['1', requestEventDate_1, requestEventNumber_1,
                '2', requestEventDate_2, requestEventNumber_2,
                '3', requestEventDate_3, requestEventNumber_3
            ],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('당첨 번호 조회 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({
                        isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage,
                        results: [{
                            EVENT_TYPE: '', WINNING_NUMBER_1: 0, WINNING_NUMBER_2: 0, WINNING_NUMBER_3: 0,
                            WINNING_NUMBER_4: 0, WINNING_NUMBER_5: 0, WINNING_NUMBER_6: 0, BONUS_NUMBER: 0
                        }]
                    });
                }

                if (!results.length) {
                    return res.json({
                        isSuccess: false, errorMessage: "당첨 번호가 존재하지 않습니다.",
                        results: [{
                            EVENT_TYPE: '', WINNING_NUMBER_1: 0, WINNING_NUMBER_2: 0, WINNING_NUMBER_3: 0,
                            WINNING_NUMBER_4: 0, WINNING_NUMBER_5: 0, WINNING_NUMBER_6: 0, BONUS_NUMBER: 0
                        }]
                    });
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
        var eventDate = new Date();
        requestEventDate = dateFormat(eventDate, 'yymmdd');
        requestEventNumber = dateFormat(eventDate, 'HH');
    }

    switch (requestEventType) {
        case '1':
            requestEventNumber++;
            requestEventNumber = requestEventNumber < 10 ? '0' + requestEventNumber : requestEventNumber;
            if (requestEventNumber === 24) {
                eventDate.setDate(eventDate.getDate() + 1);
                requestEventDate = dateFormat(eventDate, 'yymmdd');
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
                    eventDate.setDate(eventDate.getDate() + 1);
                    requestEventDate = dateFormat(eventDate, 'yymmdd');
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
                    eventDate.setDate(eventDate.getDate() + 1);
                    requestEventDate = dateFormat(eventDate, 'yymmdd');
                    requestEventNumber = '00';
                    break;
            }
            break;
        default:
            return res.json({isSuccess: false, errorMessage: "로또 타입 값이 잘못되었습니다."});
    }

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT EVENT_TYPE, WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
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
                    return res.json({
                        isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage,
                        results: [{
                            EVENT_TYPE: requestEventType,
                            WINNING_NUMBER_1: 0,
                            WINNING_NUMBER_2: 0,
                            WINNING_NUMBER_3: 0,
                            WINNING_NUMBER_4: 0,
                            WINNING_NUMBER_5: 0,
                            WINNING_NUMBER_6: 0,
                            PARTICIPATING_TIME: ""
                        }]
                    });
                }

                if (!results.length) {
                    return res.json({
                        isSuccess: false, errorMessage: "참가내역이 존재하지 않습니다.",
                        results: [{
                            EVENT_TYPE: requestEventType,
                            WINNING_NUMBER_1: 0,
                            WINNING_NUMBER_2: 0,
                            WINNING_NUMBER_3: 0,
                            WINNING_NUMBER_4: 0,
                            WINNING_NUMBER_5: 0,
                            WINNING_NUMBER_6: 0,
                            PARTICIPATING_TIME: ""
                        }]
                    });
                }

                return res.json({isSuccess: true, errorMessage: "", results: results});
            });
    });
};

exports.details_of_all_participation = function (req, res) {
    var isValidatedToken = tokenCheck.check(req),
        requestPhoneNumber;

    if (isValidatedToken) {
        var tokenData = jwt.verify(req.headers["x-access-token"], 'developmentTokenSecret');
        requestPhoneNumber = tokenData.phone_number;
    } else {
        return res.json({isSuccess: false, errorMessage: "토큰이 만료되었습니다."});
    }

    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");

    var originalEventDate = new Date(),
        eventDate = new Date(),
        requestEventDate_1 = dateFormat(eventDate, 'yymmdd'),
        requestEventDate_2 = dateFormat(eventDate, 'yymmdd'),
        requestEventDate_3 = dateFormat(eventDate, 'yymmdd'),
        requestEventNumber_1 = dateFormat(eventDate, 'HH'),
        requestEventNumber_2 = dateFormat(eventDate, 'HH'),
        requestEventNumber_3 = dateFormat(eventDate, 'HH');

    // 1시간 단위 조건 값
    requestEventNumber_1++;
    requestEventNumber_1 = requestEventNumber_1 < 10 ? '0' + requestEventNumber_1 : requestEventNumber_1;
    if (requestEventNumber_1 === 24) {
        eventDate.setDate(originalEventDate.getDate() + 1);
        requestEventDate_1 = dateFormat(eventDate, 'yymmdd');
        requestEventNumber_1 = '00';
    }

    // 6시간 단위 조건 값
    switch (true) {
        case (requestEventNumber_2 >= 0 && requestEventNumber_2 < 6):
            requestEventNumber_2 = '06';
            break;
        case (requestEventNumber_2 >= 6 && requestEventNumber_2 < 12):
            requestEventNumber_2 = '12';
            break;
        case (requestEventNumber_2 >= 12 && requestEventNumber_2 < 18):
            requestEventNumber_2 = '18';
            break;
        case (requestEventNumber_2 >= 18 && requestEventNumber_2 <= 23):
            eventDate.setDate(originalEventDate.getDate() + 1);
            requestEventDate_2 = dateFormat(eventDate, 'yymmdd');
            requestEventNumber_2 = '00';
            break;
    }

    // 12시간 단위 조건 값
    switch (true) {
        case (requestEventNumber_3 >= 0 && requestEventNumber_3 < 12):
            requestEventNumber_3 = '12';
            break;
        case (requestEventNumber_3 >= 12 && requestEventNumber_3 <= 23):
            eventDate.setDate(originalEventDate.getDate() + 1);
            requestEventDate_3 = dateFormat(eventDate, 'yymmdd');
            requestEventNumber_3 = '00';
            break;
    }

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: '\
                SELECT EVENT_TYPE, WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
                WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6, PARTICIPATING_TIME \
                FROM PARTICIPATION \
                WHERE EVENT_TYPE = ? \
                AND EVENT_DATE = ? \
                AND EVENT_NUMBER = ? \
                AND PHONE_NUMBER = ? \
                AND CONFIRM_STATUS = 0 \
                \
                UNION ALL\
                \
                SELECT EVENT_TYPE, WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
                WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6, PARTICIPATING_TIME \
                FROM PARTICIPATION \
                WHERE EVENT_TYPE = ? \
                AND EVENT_DATE = ? \
                AND EVENT_NUMBER = ? \
                AND PHONE_NUMBER = ? \
                AND CONFIRM_STATUS = 0 \
                \
                UNION ALL\
                \
                SELECT EVENT_TYPE, WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
                WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6, PARTICIPATING_TIME \
                FROM PARTICIPATION \
                WHERE EVENT_TYPE = ? \
                AND EVENT_DATE = ? \
                AND EVENT_NUMBER = ? \
                AND PHONE_NUMBER = ? \
                AND CONFIRM_STATUS = 0',
                timeout: 10000
            },
            ['1', requestEventDate_1, requestEventNumber_1, requestPhoneNumber,
                '2', requestEventDate_2, requestEventNumber_2, requestPhoneNumber,
                '3', requestEventDate_3, requestEventNumber_3, requestPhoneNumber
            ],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('참여내역조회 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({
                        isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage,
                        results: [{
                            EVENT_TYPE: "", WINNING_NUMBER_1: 0, WINNING_NUMBER_2: 0, WINNING_NUMBER_3: 0,
                            WINNING_NUMBER_4: 0, WINNING_NUMBER_5: 0, WINNING_NUMBER_6: 0, PARTICIPATING_TIME: ''
                        }
                        ]
                    });
                }

                if (!results.length) {
                    return res.json({
                        isSuccess: false, errorMessage: "참가내역이 존재하지 않습니다.",
                        results: [{
                            EVENT_TYPE: '', WINNING_NUMBER_1: 0, WINNING_NUMBER_2: 0, WINNING_NUMBER_3: 0,
                            WINNING_NUMBER_4: 0, WINNING_NUMBER_5: 0, WINNING_NUMBER_6: 0, PARTICIPATING_TIME: ''
                        }]
                    });
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
        eventDate = new Date(),
        requestEventDate = dateFormat(eventDate, 'yymmdd'),
        requestEventNumber = dateFormat(eventDate, 'HH');

    if (!requestEventType) return res.json({isSuccess: false, errorMessage: "조회하려는 타입을 골라주세요."});

    requestEventType = requestEventType.replace(/(\s*)/g, "");
    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");

    switch (requestEventType) {
        case '1':
            requestEventNumber++;
            requestEventNumber = requestEventNumber < 10 ? '0' + requestEventNumber : requestEventNumber;
            if (requestEventNumber === 24) {
                eventDate.setDate(eventDate.getDate() + 1);
                requestEventDate = dateFormat(eventDate, 'yymmdd');
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
                    eventDate.setDate(eventDate.getDate() + 1);
                    requestEventDate = dateFormat(eventDate, 'yymmdd');
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
                    eventDate.setDate(eventDate.getDate() + 1);
                    requestEventDate = dateFormat(eventDate, 'yymmdd');
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

                var lottoVillageWinnerNumbers = randomIntArray({count: 7, min: 1, max: 45, unique: true});
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