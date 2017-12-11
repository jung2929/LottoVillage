var logger = require(process.cwd() + '/config/winston'),
    pool = require(process.cwd() + '/config/maria.pool'),
    jwt = require('jsonwebtoken'),
    tokenCheck = require(process.cwd() + '/app/mobile/controllers/token.server.controller');

exports.retrievePoint = function (req, res) {
    var isValidatedToken = tokenCheck.check(req),
        requestPhoneNumber;

    if (isValidatedToken) {
        var tokenData = jwt.verify(req.headers["x-access-token"], 'developmentTokenSecret');
        requestPhoneNumber = tokenData.phone_number;
    } else {
        return res.json({isSuccess: false, errorMessage: "토큰이 만료되었습니다."});
    }

    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT PERSONAL_SCORE \
                FROM USER_INFO \
                WHERE PHONE_NUMBER = ?\
                LIMIT 1',
                timeout: 10000
            },
            [requestPhoneNumber],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('나의 포인트 조회 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({
                        isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage, results: 0});
                }

                if (!results.length) {
                    return res.json({
                        isSuccess: false, errorMessage: "내 정보가 존재하지 않습니다.", results: 0});
                }

                return res.json({isSuccess: true, errorMessage: "", results: results[0].PERSONAL_SCORE});
            });
    });
};

exports.retrieveUserInfo = function (req, res) {
    var isValidatedToken = tokenCheck.check(req),
        requestPhoneNumber;

    if (isValidatedToken) {
        var tokenData = jwt.verify(req.headers["x-access-token"], 'developmentTokenSecret');
        requestPhoneNumber = tokenData.phone_number;
    } else {
        return res.json({isSuccess: false, name: "토큰이 만료되었습니다."});
    }

    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT NAME \
                FROM USER_INFO \
                WHERE PHONE_NUMBER = ?\
                LIMIT 1',
                timeout: 10000
            },
            [requestPhoneNumber],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('나의 정보 조회 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({
                        isSuccess: false, name: "데이터베이스 오류 : " + error.sqlMessage});
                }

                if (!results.length) {
                    return res.json({
                        isSuccess: false, name: "내 정보가 존재하지 않습니다."});
                }

                return res.json({isSuccess: true, name: results[0].NAME});
            });
    });
};

exports.detailsOfPointHistory = function (req, res) {
    var isValidatedToken = tokenCheck.check(req),
        requestPhoneNumber;

    if (isValidatedToken) {
        var tokenData = jwt.verify(req.headers["x-access-token"], 'developmentTokenSecret');
        requestPhoneNumber = tokenData.phone_number;
    } else {
        return res.json({isSuccess: false, errorMessage: "토큰이 만료되었습니다."});
    }

    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT SAVING_TIME, CASE SCORE_TYPE WHEN 0 THEN FALSE ELSE TRUE END SCORE_TYPE, SCORE \
                FROM SCORE_DETAIL \
                WHERE DATE_FORMAT(SAVING_TIME, \'%X%m\') = ? \
                AND PHONE_NUMBER = ?',
                timeout: 10000
            },
            [req.query.saving_time, requestPhoneNumber],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('포인트 내역 조회 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({
                        isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage, results: [{
                            SAVING_TIME:'0000-00-00 00:00:00', SCORE_TYPE:0, SCORE:0
                        }]
                    });
                }

                if (!results.length) {
                    return res.json({
                        isSuccess: false, errorMessage: "포인트 내역 정보가 존재하지 않습니다.", results: [{
                            SAVING_TIME:'0000-00-00 00:00:00', SCORE_TYPE:0, SCORE:0
                        }]
                    });
                }

                return res.json({isSuccess: true, errorMessage: "", results: results});
            });
    });
};

exports.deleteUser = function (req, res) {
    var isValidatedToken = tokenCheck.check(req),
        requestPhoneNumber;

    if (isValidatedToken) {
        var tokenData = jwt.verify(req.headers["x-access-token"], 'developmentTokenSecret');
        requestPhoneNumber = tokenData.phone_number;
    } else {
        return res.json({isSuccess: false, errorMessage: "토큰이 만료되었습니다."});
    }

    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "UPDATE USER_INFO \
                    SET USER_STATUS = '1' \
                    WHERE PHONE_NUMBER = ?",
                timeout: 10000
            },
            [requestPhoneNumber],
            function (error, results, columns) {
                connection.release();
                if (error) {
                    return res.json({isSuccess: false, errorMessage: ""});
                }

                return res.json({isSuccess: true, errorMessage: ""});
            });
    });
};

exports.updateUser = function (req, res) {
    var requestName = req.body.name,
        requestPassword = req.body.password,
        requestPasswordConfirm = req.body.password_confirm,
        requestPhoneNumber = req.body.phone_number;

    if (!requestName) return res.json({isSuccess: false, errorMessage: "이름을 입력해주세요."});
    if (!requestPassword) return res.json({isSuccess: false, errorMessage: "비밀번호를 입력해주세요."});
    if (!requestPasswordConfirm) return res.json({isSuccess: false, errorMessage: "비밀번호확인값을 입력해주세요."});
    if (!requestPhoneNumber) return res.json({isSuccess: false, errorMessage: "전화번호를 입력해주세요."});

    requestName = requestName.replace(/(\s*)/g, "");
    requestPassword = requestPassword.replace(/(\s*)/g, "");
    requestPasswordConfirm = requestPasswordConfirm.replace(/(\s*)/g, "");
    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");

    if (requestName.length < 3 || requestName.length > 10) return res.json({
        isSuccess: false,
        errorMessage: "이름은 3~10자리를 입력해주세요."
    });
    if (requestPassword.length < 6 || requestPassword.length > 10) return res.json({
        isSuccess: false,
        errorMessage: "비밀번호는 6~10자리를 입력해주세요."
    });
    if (requestPasswordConfirm.length < 6 || requestPasswordConfirm.length > 10) return res.json({
        isSuccess: false,
        errorMessage: "비밀번호확인값은 6~10자리를 입력해주세요."
    });

    if (requestPassword !== requestPasswordConfirm) return res.json({
        isSuccess: false,
        errorMessage: "비밀번호가 일치하지 않습니다."
    });

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT PK_ID, PHONE_NUMBER, PASSWORD \
                  FROM USER_INFO \
                  WHERE PHONE_NUMBER = ? \
                  AND PASSWORD = ?',
                timeout: 10000
            },
            [requestPhoneNumber, requestPassword],
            function (error, results, columns) {
                if (error) {
                    connection.release();
                    logger().info('로그인 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage});
                }

                pool.getConnection(function (err, connection) {
                    connection.query({
                            sql: 'UPDATE USER_INFO \
                              SET PASSWORD = ?, NAME = ? \
                              WHERE PHONE_NUMBER = ?',
                            timeout: 10000
                        },
                        [requestPassword, requestName, requestPhoneNumber],
                        function (error, results, columns) {
                            connection.release();

                            if (error) {
                                logger().info('회원 정보 수정 - 에러코드 : ' + error.code + ', 에러내용:' + error.sqlMessage);
                                return res.json({isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage});
                            }

                            logger().info('회원 정보 수정 - 전화번호 : ' + requestPhoneNumber);
                            res.json({isSuccess: true, errorMessage: ""});
                        });
                });
            });
    });
};


exports.login = function (req, res) {
    var isValidatedToken = tokenCheck.check(req),
        requestPhoneNumber,
        requestPassword,
        tokenValue;

    if (isValidatedToken) {
        var tokenData = jwt.verify(req.headers["x-access-token"], 'developmentTokenSecret');
        requestPhoneNumber = tokenData.phone_number;
        requestPassword = tokenData.password;
        tokenValue = req.headers["x-access-token"];
    } else {
        requestPhoneNumber = req.body.phone_number;
        requestPassword = req.body.password;
    }

    if (!requestPhoneNumber) return res.json({isSuccess: false, errorMessage: "전화번호를 입력해주세요."});
    if (!requestPassword) return res.json({isSuccess: false, errorMessage: "비밀번호를 입력해주세요."});

    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");
    requestPassword = requestPassword.replace(/(\s*)/g, "");

    var regExp = /^\d{3}-\d{3,4}-\d{4}$/;
    if (!regExp.test(requestPhoneNumber)) return res.json({isSuccess: false, errorMessage: "전화번호를 확인해주세요."});

    if (requestPassword.length < 6 || requestPassword.length > 10) return res.json({
        isSuccess: false,
        errorMessage: "비밀번호는 6~10자리를 입력해주세요."
    });

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT PK_ID, PHONE_NUMBER, PASSWORD, USER_STATUS \
                  FROM USER_INFO \
                  WHERE PHONE_NUMBER = ? \
                  AND PASSWORD = ?',
                timeout: 10000
            },
            [requestPhoneNumber, requestPassword],
            function (error, results, columns) {
                if (error) {
                    connection.release();
                    logger().info('로그인 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage});
                }

                if (!results.length) {
                    connection.release();
                    return res.json({isSuccess: false, errorMessage: "전화번호 혹은 비밀번호가 일치하지 않습니다."});
                }

                if (results[0].USER_STATUS === "1") {
                    connection.release();
                    return res.json({isSuccess: false, errorMessage: "탈퇴한 계정입니다."});
                }

                if (!isValidatedToken) tokenValue = jwt.sign(
                    {
                        _id: results[0].PK_ID,
                        phone_number: results[0].PHONE_NUMBER,
                        password: results[0].PASSWORD
                    },
                    'developmentTokenSecret',
                    {
                        expiresIn: '3d',
                        subject: 'userInfo'
                    }
                );

                connection.query({
                        sql: 'UPDATE USER_INFO \
                        SET CURRENT_DATETIME = CURRENT_TIMESTAMP \
                        WHERE PHONE_NUMBER = ? \
                        AND PASSWORD = ?',
                        timeout: 10000
                    },
                    [requestPhoneNumber, requestPassword],
                    function (error, results, columns) {
                        connection.release();

                        if (error) {
                            logger().info('로그인 - 에러코드 : ' + error.code + ', 에러내용:' + error.sqlMessage);
                            return res.json({isSuccess: false, errorMessage: "로그인 시도 오류 : " + error.sqlMessage});
                        }

                        logger().info('로그인 - 토큰 : ' + tokenValue);
                        res.header('x-access-token', tokenValue);
                        res.json({isSuccess: true, errorMessage: ""});
                    });
            });
    });
};

exports.register = function (req, res) {
    var requestName = req.body.name,
        requestPassword = req.body.password,
        requestPasswordConfirm = req.body.password_confirm,
        requestPhoneNumber = req.body.phone_number;

    if (!requestName) return res.json({isSuccess: false, errorMessage: "이름을 입력해주세요."});
    if (!requestPassword) return res.json({isSuccess: false, errorMessage: "비밀번호를 입력해주세요."});
    if (!requestPasswordConfirm) return res.json({isSuccess: false, errorMessage: "비밀번호확인값을 입력해주세요."});
    if (!requestPhoneNumber) return res.json({isSuccess: false, errorMessage: "전화번호를 입력해주세요."});

    requestName = requestName.replace(/(\s*)/g, "");
    requestPassword = requestPassword.replace(/(\s*)/g, "");
    requestPasswordConfirm = requestPasswordConfirm.replace(/(\s*)/g, "");
    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");

    if (requestName.length < 3 || requestName.length > 10) return res.json({
        isSuccess: false,
        errorMessage: "이름은 3~10자리를 입력해주세요."
    });
    if (requestPassword.length < 6 || requestPassword.length > 10) return res.json({
        isSuccess: false,
        errorMessage: "비밀번호는 6~10자리를 입력해주세요."
    });
    if (requestPasswordConfirm.length < 6 || requestPasswordConfirm.length > 10) return res.json({
        isSuccess: false,
        errorMessage: "비밀번호확인값은 6~10자리를 입력해주세요."
    });

    if (requestPassword !== requestPasswordConfirm) return res.json({
        isSuccess: false,
        errorMessage: "비밀번호가 일치하지 않습니다."
    });

    var regExp = /^\d{3}-\d{3,4}-\d{4}$/;
    if (!regExp.test(requestPhoneNumber)) return res.json({isSuccess: false, errorMessage: "전화번호를 확인해주세요."});

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'INSERT INTO USER_INFO(PHONE_NUMBER, PASSWORD, NAME) \
                  VALUES(?, ?, ?)',
                timeout: 10000
            },
            [requestPhoneNumber, requestPassword, requestName],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('회원가입 - 에러코드 : ' + error.code + ', 에러내용:' + error.sqlMessage);
                    return res.json({isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage});
                }

                logger().info('회원가입 - 전화번호 : ' + requestPhoneNumber);
                res.json({isSuccess: true, errorMessage: ""});
            });
    });
};