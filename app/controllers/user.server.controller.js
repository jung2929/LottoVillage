var logger = require(__dirname + '\\../../config/winston'),
    pool = require(__dirname + '\\../../config/maria.pool');

exports.login = function (req, res) {
    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT PHONE_NO \
                  FROM USER_INFO \
                  WHERE PHONE_NO = ? \
                  AND PASSWORD = ?',
                timeout: 10000
            },
            [req.query.phone_no, req.query.password],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('로그인 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage});
                }

                if (!results.length) {
                    return res.json({isSuccess: false, errorMessage: "전화번호 혹은 비밀번호가 일치하지 않습니다."});
                }

                req.session.phone_no = req.query.phone_no;
                req.session.password = req.query.password;
                req.session.cookies = req.cookies.jjsoft_lotto_village;

                logger().info('로그인 - 전화번호 : ' + req.session.phone_no);
                res.json({isSuccess: true, errorMessage: ""});
            });
    });
};

exports.logout = function (req, res) {
    if (req.session.id === undefined || req.session.password === undefined) {
        logger().info('쿠키/세션 내역 없는데 로그아웃 시도 흔적');
        return res.json({isSuccess: false, errorMessage: "로그인된 내역이 없습니다."});
    }
    logger().info('로그아웃 - 전화번호:' + req.session.phone_no);
    req.session.destroy();
    res.clearCookie('jjsoft_lotto_village');
    res.json({isSuccess: true, errorMessage: ""});
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

    requestName = requestName.replace( /(\s*)/g,"");
    requestPassword = requestPassword.replace( /(\s*)/g,"");
    requestPasswordConfirm = requestPasswordConfirm.replace( /(\s*)/g,"");
    requestPhoneNumber = requestPhoneNumber.replace( /(\s*)/g,"");

    if (requestName.length < 3 || requestName.length > 10) return res.json({isSuccess: false, errorMessage: "이름은 3~10자리를 입력해주세요."});
    if (requestPassword.length < 6 || requestPassword.length > 10) return res.json({isSuccess: false, errorMessage: "비밀번호는 6~10자리를 입력해주세요."});
    if (requestPasswordConfirm.length < 6 || requestPasswordConfirm.length > 10) return res.json({isSuccess: false, errorMessage: "비밀번호확인값은 6~10자리를 입력해주세요."});

    if (requestPassword !== requestPasswordConfirm) return res.json({isSuccess: false, errorMessage: "비밀번호가 일치하지 않습니다."});

    var regExp = /^\d{3}-\d{3,4}-\d{4}$/;
    if (!regExp.test(requestPhoneNumber)) return res.json({isSuccess: false, errorMessage: "전화번호를 확인해주세요."});

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'INSERT INTO USER_INFO(PHONE_NO, PASSWORD, NAME) \
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

                res.json({isSuccess: true, errorMessage: ""});
            });
    });
};