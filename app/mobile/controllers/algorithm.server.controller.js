var logger = require(process.cwd() + '/config/winston'),
    pool = require(process.cwd() + '/config/maria.pool'),
    tokenCheck = require(process.cwd() + '/app/mobile/controllers/token.server.controller'),
    randomIntArray = require('random-int-array'),
    jwt = require('jsonwebtoken'),
    pythonShell = require('python-shell');

exports.prediction_algorithm = function (req, res) {
    var requestAlgorithmType = req.query.algorithm_type;

    var predictionResult = {
        requestPredictionNumber1: 0,
        requestPredictionNumber2: 0,
        requestPredictionNumber3: 0,
        requestPredictionNumber4: 0,
        requestPredictionNumber5: 0,
        requestPredictionNumber6: 0,
        requestBonusNumber: 0
    };

    // 시스템에 따라 경로 설정하기
    var options = {
        mode: 'text',
        pythonPath: '/usr/bin/python',
        scriptPath: '/home/Tues_4team/svr/src0.9/LottoVillage/Server/config/algorithm/'
    };

    switch (requestAlgorithmType) {
        case '1':
            pythonShell.run('lotto.py', options, function (err, results) {
                if (err) {
                    logger().info('알고리즘 결과 데이터 수신 오류 - 에러내용 : ' + err.message);
                }
                console.log('선택 알고리즘 결과 : %j', results);
                predictionResult.requestPredictionNumber1 = 1;
                predictionResult.requestPredictionNumber1 = Number(results[0]);
                predictionResult.requestPredictionNumber2 = Number(results[1]);
                predictionResult.requestPredictionNumber3 = Number(results[2]);
                predictionResult.requestPredictionNumber4 = Number(results[3]);
                predictionResult.requestPredictionNumber5 = Number(results[4]);
                predictionResult.requestPredictionNumber6 = Number(results[5]);
                predictionResult.requestBonusNumber = Number(results[6]);

                res.json({isSuccess: true, errorMessage: " ", results: predictionResult});
            });
            break;
        case '2':
            var lottoPredictionNumbers = randomIntArray({count: 7, min: 1, max: 45, unique: true});
            lottoPredictionNumbers.sort(function (a, b) {
                return a - b;
            });
            console.log('선택 알고리즘 결과 : %j', lottoPredictionNumbers);
            predictionResult.requestPredictionNumber1 = lottoPredictionNumbers[0];
            predictionResult.requestPredictionNumber2 = lottoPredictionNumbers[1];
            predictionResult.requestPredictionNumber3 = lottoPredictionNumbers[2];
            predictionResult.requestPredictionNumber4 = lottoPredictionNumbers[3];
            predictionResult.requestPredictionNumber5 = lottoPredictionNumbers[4];
            predictionResult.requestPredictionNumber6 = lottoPredictionNumbers[5];
            predictionResult.requestBonusNumber = lottoPredictionNumbers[6];

            res.json({isSuccess: true, errorMessage: " ", results: predictionResult});
            break;
        default:
            return res.json({isSuccess: false, errorMessage: "알고리즘 선택 값이 잘못되었습니다", results: predictionResult});

    }
};

exports.prediction = function (req, res) {
    var requestAlgorithmType = req.query.algorithm_type,
        isValidatedToken = tokenCheck.check(req),
        requestPhoneNumber;

    if (isValidatedToken) {
        var tokenData = jwt.verify(req.headers["x-access-token"], 'developmentTokenSecret');
        requestPhoneNumber = tokenData.phone_number;
    } else {
        return res.json({isSuccess: false, errorMessage: "토큰이 만료되었습니다."});
    }

    if (!requestAlgorithmType) return res.json({isSuccess: false, errorMessage: "알고리즘이 선택되지 않았습니다."});

    requestAlgorithmType = requestAlgorithmType.replace(/(\s*)/g, "");
    requestPhoneNumber = requestPhoneNumber.replace(/(\s*)/g, "");

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'UPDATE USER_INFO \
                    SET ALGORITHM_TYPE = ? \
                    WHERE PHONE_NUMBER = ?',
                timeout: 10000
            },
            [requestAlgorithmType, requestPhoneNumber],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    logger().info('알고리즘 선택 조회 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                    return res.json({isSuccess: false, errorMessage: "알고리즘 선택 오류 : " + error.sqlMessage});
                }

                if (requestAlgorithmType !== '1' && requestAlgorithmType !== '2') {
                    logger().info('알고리즘 선택 조회 - 존재하지 않는 알고리즘 : ' + requestAlgorithmType);
                    return res.json({
                        isSuccess: false, errorMessage: "선택한 알고리즘이 존재하지 않습니다.",
                        results: {
                            ALGORITHM_TYPE: requestAlgorithmType
                        }
                    });
                } else {
                    logger().info('알고리즘 선택 조회 - 선택한 알고리즘 : ' + requestAlgorithmType);
                    return res.json({
                        isSuccess: true, errorMessage: "",
                        results: {
                            ALGORITHM_TYPE: requestAlgorithmType
                        }
                    });
                }

            });

    });
};