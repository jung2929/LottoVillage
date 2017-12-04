var pool = require(process.cwd() + '/config/maria.pool');

exports.retrieveProductList = function (req, res) {
    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "SELECT PRODUCT_CODE, PRODUCT_NAME, PRODUCT_PRICE, \
                  CASE PRODUCT_STATUS WHEN 1 THEN 'Y' \
                    ELSE 'N' END PRODUCT_STATUS \
                    , PRODUCT_CONTENTS \
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