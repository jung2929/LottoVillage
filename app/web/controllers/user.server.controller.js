var pool = require(process.cwd() + '/config/maria.pool');

exports.loginWeb = function (req, res) {
    var requestPhoneNumber,
        requestPassword;

    requestPhoneNumber = req.body.phone_number;
    requestPassword = req.body.password;

    if (!requestPhoneNumber) return res.json({isSuccess: false});
    if (!requestPassword) return res.json({isSuccess: false});

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT COUNT(1) AS CNT \
                  FROM USER_INFO \
                  WHERE PHONE_NUMBER = ? \
                  AND PASSWORD = ?',
                timeout: 10000
            },
            [requestPhoneNumber, requestPassword],
            function (error, results, columns) {
                connection.release();
                if (error) {
                    return res.json({isSuccess: false});
                }

                if (results[0].CNT === 0) {
                    return res.json({isSuccess: false});
                }

                return res.json({isSuccess: true});
            });
    });
};

exports.retrieveUserList = function (req, res) {
    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "SELECT A.PHONE_NUMBER, \
                    A.NAME AS USER_NAME, \
                    A.USER_STATUS, \
                    A.PERSONAL_SCORE AS USER_TOT_POINT, \
                    (SELECT COUNT(1) AS TOT_CNT \
                        FROM PARTICIPATION AS B \
                        WHERE A.PHONE_NUMBER = B.PHONE_NUMBER \
                        AND B.EVENT_TYPE =  '1 ') AS ONE_TOT_CNT, \
                    (SELECT COUNT(1) AS TOT_CNT \
                        FROM PARTICIPATION AS B \
                        WHERE A.PHONE_NUMBER = B.PHONE_NUMBER \
                        AND B.EVENT_TYPE =  '2 ') AS SIX_TOT_CNT, \
                    (SELECT COUNT(1) AS TOT_CNT \
                        FROM PARTICIPATION AS B \
                        WHERE A.PHONE_NUMBER = B.PHONE_NUMBER \
                        AND B.EVENT_TYPE =  '3 ') AS TWELVE_TOT_CNT, \
                    A.CURRENT_DATETIME, \
                    A.REGISTER_DATETIME \
                    FROM USER_INFO AS A \
                    WHERE PK_ID <> '1' \
                    ORDER BY NAME",
                timeout: 10000
            },
            [],
            function (error, results, columns) {
                connection.release();
                if (error) {
                    return res.json({isSuccess: false, results:null});
                }

                return res.json({isSuccess: true, results:results});
            });
    });
};

exports.updateUserStatus = function (req, res) {
    var requestPhoneNumber;

    requestPhoneNumber = req.body.phone_number;

    if (!requestPhoneNumber) return res.json({isSuccess: false});

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
                    return res.json({isSuccess: false});
                }

                return res.json({isSuccess: true});
            });
    });
};

exports.retrieveUserPointHistory = function (req, res) {
    var requestPhoneNumber = req.query.phone_number,
        requestEventDate = req.query.event_date;

    if (!requestPhoneNumber) return res.json({isSuccess: false});
    if (!requestEventDate) return res.json({isSuccess: false});

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "SELECT SUBSTRING(SAVING_TIME, 6, 14) AS DATE_TIME, \
                    CASE SCORE_TYPE WHEN 0 THEN '+' \
                        ELSE '-' END AS CONTENTS, \
                    CONCAT(SCORE, ' P') AS POINT \
                    FROM SCORE_DETAIL \
                    WHERE PHONE_NUMBER = ? \
                    AND DATE_FORMAT(SAVING_TIME, '%y%m') = ?",
                timeout: 10000
            },
            [requestPhoneNumber, requestEventDate],
            function (error, results, columns) {
                connection.release();
                if (error) {
                    return res.json({isSuccess: false, results:null});
                }

                return res.json({isSuccess: true, results:results});
            });
    });
};

exports.retrieveUserAllProduct = function (req, res) {
    var requestPhoneNumber = req.query.phone_number,
        requestEventDate = req.query.event_date;

    if (!requestPhoneNumber) return res.json({isSuccess: false});
    if (!requestEventDate) return res.json({isSuccess: false});

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "SELECT SUBSTRING(SAVING_TIME, 6, 14) AS DATE_TIME, \
                        B.PRODUCT_NAME AS CONTENTS, \
                        CONCAT(B.PRODUCT_PRICE, ' P') AS POINT \
                    FROM USER_PRODUCT_LIST AS A \
                    INNER JOIN PRODUCT_MASTER AS B \
                        ON A.PRODUCT_CODE = B.PRODUCT_CODE \
                    WHERE PHONE_NUMBER = ? \
                    AND DATE_FORMAT(SAVING_TIME, '%y%m') = ?",
                timeout: 10000
            },
            [requestPhoneNumber, requestEventDate],
            function (error, results, columns) {
                connection.release();
                if (error) {
                    return res.json({isSuccess: false, results:null});
                }

                return res.json({isSuccess: true, results:results});
            });
    });
};

exports.retrieveUserAllParticipation = function (req, res) {
    var requestPhoneNumber = req.query.phone_number,
        requestEventDate = req.query.event_date;

    if (!requestPhoneNumber) return res.json({isSuccess: false});
    if (!requestEventDate) return res.json({isSuccess: false});

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "SELECT SUBSTRING(PARTICIPATING_TIME, 6, 14) AS DATE_TIME, \
                CONCAT( \
                    CASE EVENT_TYPE WHEN 1 THEN '1시간 - ' \
                                    WHEN 2 THEN '6시간 - ' \
                                    WHEN 3 THEN '12시간 - ' \
                                    ELSE 0 END, \
                    CASE WINNING_RATE WHEN 9 THEN '꽝' \
                                      ELSE CONCAT(WINNING_RATE, '등') END \
                    ) AS CONTENTS, \
                CONCAT( \
                    CASE WINNING_RATE WHEN 1 THEN 500 \
                                      WHEN 2 THEN 400 \
                                      WHEN 3 THEN 300 \
                                      WHEN 4 THEN 200 \
                                      WHEN 5 THEN 100 \
                                      ELSE 0 \
                                    END, ' P') AS POINT \
                FROM PARTICIPATION \
                WHERE PHONE_NUMBER = ? \
                AND DATE_FORMAT(PARTICIPATING_TIME, '%y%m') = ?",
                timeout: 10000
            },
            [requestPhoneNumber, requestEventDate],
            function (error, results, columns) {
                connection.release();
                if (error) {
                    return res.json({isSuccess: false, results:null});
                }

                return res.json({isSuccess: true, results:results});
            });
    });
};