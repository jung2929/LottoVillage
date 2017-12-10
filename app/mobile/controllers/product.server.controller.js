var logger = require(process.cwd() + '/config/winston'),
    pool = require(process.cwd() + '/config/maria.pool'),
    tokenCheck = require(process.cwd() + '/app/mobile/controllers/token.server.controller'),
    jwt = require('jsonwebtoken');

exports.render = function(req, res){
	/*if (req.session.visit){
		req.session.lastVisit = req.session.visit;
		req.session.visit = new Date();
	}

	req.session.visit = new Date();
	console.log('접속시간 : ' + req.session.visit);

	if (req.session.lastVisit !== undefined) {
		console.log('마지막접속시간 : ' + req.session.lastVisit)
	}*/
	res.render('index', {
		title: 'Hello EJS World'
	})
};

/*exports.reward_list_info = function (req, res) {
    var requestRewardNumber = req.query.product_code;

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT PRODUCT_CODE, PRODUCT_NAME, PRODUCT_PRICE, PRODUCT_STATUS, PRODUCT_CONTENTS, PRODUCT_CATEGORY \
                FROM PRODUCT_MASTER',
                timeout: 10000
            },
            [requestRewardNumber],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('Reward 상품 리스트 조회 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage,
                        results: [{
                            PRODUCT_CODE: 0, PRODUCT_NAME: '', PRODUCT_PRICE: 0,
                            PRODUCT_STATUS: '', PRODUCT_CONTENTS: ''
                        }]
                    });
                }

                if (!results.length) {
                    return res.json({isSuccess: false, errorMessage: "Reward 상품 리스트가 존재하지 않습니다.",
                        results: [{
                            PRODUCT_CODE: 0, PRODUCT_NAME: '', PRODUCT_PRICE: 0,
                            PRODUCT_STATUS: '', PRODUCT_CONTENTS: ''
                        }]
                    });
                } else {
                    logger().info('Reward 상품 리스트 조회');
                    return res.json({
                        isSuccess: true, errorMessage: "", results: results});
                }
            });
    });
};*/

/*exports.reward_exchange_info = function (req, res) {
    var isValidatedToken = tokenCheck.check(req),
        requestRewardNumber = req.query.product_code,
        requestPhoneNumber;

    if (isValidatedToken) {
        var tokenData = jwt.verify(req.headers["x-access-token"], 'developmentTokenSecret');
        requestPhoneNumber = tokenData.phone_number;
    } else {
        return res.json({isSuccess: false, errorMessage: "토큰이 만료되었습니다."});
    }

    if (!requestRewardNumber) return res.json({isSuccess: false, errorMessage: "교환하려는 상품을 골라주세요."});

    requestRewardNumber = requestRewardNumber.replace(/(\s*)/g, "");
    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");


    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT PRODUCT_CODE, PRODUCT_STATUS \
                FROM PRODUCT_MASTER \
                WHERE PRODUCT_CODE = ?',
                timeout: 10000
            },
            [requestRewardNumber],
            function (error, results, columns) {

                if (error) {
                    connection.release();
                    logger().info('Reward 교환 상품 조회 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({isSuccess: false, errorMessage: "데이터베이스 오류 : " + error.sqlMessage,
                        results: [{
                            PRODUCT_CODE: 0, PRODUCT_STATUS: ''
                        }]
                    });
                }

                if (!results.length) {
                    connection.release();
                    return res.json({isSuccess: false, errorMessage: "해당 Reward 상품이 존재하지 않습니다.",
                        results: [{
                            PRODUCT_CODE: 0, PRODUCT_STATUS: ''
                        }]
                    });
                }

                // 관리자가 사용자 Reward 상품 구매 내역에서 해당 상품 삭제하면 0으로 바꾸기
                var requestUserRewardStatus = '1';

                connection.query({
                        sql: 'INSERT INTO USER_PRODUCT_LIST (PHONE_NUMBER, PRODUCT_CODE, PRODUCT_EXPIRATION_DATE, USER_PRODUCT_STATUS) \
                        VALUES (?, ?, NOW() + INTERVAL 2160 HOUR, ?)',
                        timeout: 10000
                    },
                    [requestPhoneNumber, requestRewardNumber, requestUserRewardStatus],
                    function (error, results, columns) {
                        connection.release();

                        if (error) {
                            logger().info('Reward 상품 교환 요청 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                            return res.json({isSuccess: false, errorMessage: "Reward 상품 교환 오류 : " + error.sqlMessage});
                        }
                        logger().info('Reward 상품 교환');
                        return res.json({isSuccess: true, errorMessage: ""});
                    });
            });
    });
};*/

exports.retrieveProductList = function (req, res) {
    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "SELECT PRODUCT_CODE, PRODUCT_NAME, PRODUCT_PRICE, \
                  CASE PRODUCT_STATUS WHEN 1 THEN 'Y' \
                    ELSE 'N' END PRODUCT_STATUS \
                    , PRODUCT_CONTENTS, PRODUCT_CATEGORY \
                    FROM PRODUCT_MASTER",
                timeout: 10000
            },
            [],
            function (error, results, columns) {
                connection.release();
                if (error) {
                    return res.json({isSuccess: false, results: null});
                }

                return res.json({isSuccess: true, results: results});
            });
    });
};

exports.insertProduct = function (req, res) {
    var requestProductCode,
        requestProductName,
        requestProductPrice,
        requestProductStatus,
        requestProductContents,
        requestProductCategory;

    requestProductCode = req.body.product_code;
    requestProductName = req.body.product_name;
    requestProductPrice = req.body.product_price;
    requestProductStatus = req.body.product_status;
    requestProductContents = req.body.product_contents;
    requestProductCategory = req.body.product_category;

    if (!requestProductCode) return res.json({isSuccess: false});
    if (!requestProductName) return res.json({isSuccess: false});
    if (!requestProductPrice) return res.json({isSuccess: false});
    if (!requestProductStatus) return res.json({isSuccess: false});
    if (!requestProductContents) return res.json({isSuccess: false});
    if (!requestProductCategory) return res.json({isSuccess: false});

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "INSERT INTO PRODUCT_MASTER(PRODUCT_CODE, PRODUCT_NAME, PRODUCT_PRICE, PRODUCT_STATUS, PRODUCT_CONTENTS, PRODUCT_CATEGORY) \
                    VALUES (?, ?, ?, ?, ?, ?)",
                timeout: 10000
            },
            [requestProductCode, requestProductName, requestProductPrice, requestProductStatus, requestProductContents, requestProductCategory],
            function (error, results, columns) {
                connection.release();
                if (error) {
                    return res.json({isSuccess: false});
                }

                return res.json({isSuccess: true});
            });
    });
};

exports.deleteProduct = function (req, res) {
    var requestProductCode;

    requestProductCode = req.body.product_code;

    if (!requestProductCode) return res.json({isSuccess: false});

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "DELETE FROM PRODUCT_MASTER \
                    WHERE PRODUCT_CODE = ?",
                timeout: 10000
            },
            [requestProductCode],
            function (error, results, columns) {
                connection.release();
                if (error) {
                    return res.json({isSuccess: false});
                }

                return res.json({isSuccess: true});
            });
    });
};

exports.updateProduct = function (req, res) {
    var requestProductCode,
        requestProductName,
        requestProductPrice,
        requestProductStatus,
        requestProductContents,
        requestProductCategory;

    requestProductCode = req.body.product_code;
    requestProductName = req.body.product_name;
    requestProductPrice = req.body.product_price;
    requestProductStatus = req.body.product_status;
    requestProductContents = req.body.product_contents;
    requestProductCategory = req.body.product_category;

    if (!requestProductCode) return res.json({isSuccess: false});
    if (!requestProductName) return res.json({isSuccess: false});
    if (!requestProductPrice) return res.json({isSuccess: false});
    if (!requestProductStatus) return res.json({isSuccess: false});
    if (!requestProductContents) return res.json({isSuccess: false});
    if (!requestProductCategory) return res.json({isSuccess: false});

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "UPDATE PRODUCT_MASTER\
                    SET PRODUCT_NAME = ?, \
                        PRODUCT_PRICE = ?, \
                        PRODUCT_STATUS = ?, \
                        PRODUCT_CONTENTS = ?, \
                        PRODUCT_CATEGORY = ? \
                    WHERE PRODUCT_CODE = ?",
                timeout: 10000
            },
            [requestProductName, requestProductPrice, requestProductStatus, requestProductContents, requestProductCategory, requestProductCode],
            function (error, results, columns) {
                connection.release();
                if (error) {
                    return res.json({isSuccess: false});
                }

                return res.json({isSuccess: true});
            });
    });
};