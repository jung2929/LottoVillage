var logger = require(__dirname + '\\../../config/winston'),
    pool = require(__dirname + '\\../../config/maria.pool'),
    jwt = require('jsonwebtoken'),
    tokenCheck = require(__dirname + '\\token.server.controller');

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
        if (req.headers["x-access-token"] === undefined) {
            requestPhoneNumber = req.body.phone_number;
            requestPassword = req.body.password;
        } else {
            return res.json({isSuccess: false, errorMessage: "로그인 인증값이 잘못되었습니다."});
        }
    }

    if (requestPhoneNumber === undefined) return res.json({isSuccess: false, errorMessage: "전화번호를 입력해주세요."});
    if (requestPassword === undefined) return res.json({isSuccess: false, errorMessage: "비밀번호를 입력해주세요."});

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
                sql: 'SELECT PK_ID, PHONE_NUMBER, PASSWORD \
                  FROM USER_INFO \
                  WHERE PHONE_NUMBER = ? \
                  AND PASSWORD = ?',
                timeout: 10000
            },
            [requestPhoneNumber, requestPassword],
            function (error, results, columns) {
                if (error) {
                    logger().info('로그인 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage});
                }

                if (!results.length) {
                    return res.json({isSuccess: false, errorMessage: "전화번호 혹은 비밀번호가 일치하지 않습니다."});
                }

                if (!isValidatedToken) tokenValue = jwt.sign(
                    {
                        _id: results[0].PK_ID,
                        phone_number: results[0].PHONE_NUMBER,
                        password: results[0].PASSWORD
                    },
                    'developmentTokenSecret',
                    {
                        expiresIn: '7d',
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

    if (requestName === undefined) return res.json({isSuccess: false, errorMessage: "이름을 입력해주세요."});
    if (requestPassword === undefined) return res.json({isSuccess: false, errorMessage: "비밀번호를 입력해주세요."});
    if (requestPasswordConfirm === undefined) return res.json({isSuccess: false, errorMessage: "비밀번호확인값을 입력해주세요."});
    if (requestPhoneNumber === undefined) return res.json({isSuccess: false, errorMessage: "전화번호를 입력해주세요."});

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