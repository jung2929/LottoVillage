var pool = require(process.cwd() + '/config/maria.pool');

/*[url : /anaylze_user]
    [response]
- isSuccess (Boolean)
- results {
    user_tot_totay (int), // 오늘 가입자수
    user_tot (int), // 총 회원수(=총 가입자수)
    user_rate_login, // 회원 접속률 (= 오늘 로그인한 회원수/총 회원수)
}*/
exports.retrieveAnalyzeUser = function (req, res) {
    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "SELECT COUNT(1) AS USER_TOT_TODAY, \
                  (SELECT COUNT(1) FROM USER_INFO) AS USER_TOT, \
                  ROUND((SELECT COUNT(1) \
                   FROM USER_INFO \
                   WHERE DATE_FORMAT(CURRENT_DATETIME, '%y%m%d') = DATE_FORMAT(CURRENT_TIMESTAMP(), '%y%m%d')) \
                   / \
                  (SELECT COUNT(1) \
                   FROM USER_INFO) * 100, 0) AS USER_RATE_LOGIN \
                FROM USER_INFO \
                WHERE DATE_FORMAT(REGISTER_DATETIME, '%y%m%d') = DATE_FORMAT(CURRENT_TIMESTAMP(), '%y%m%d')",
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

/*[url : /week_lv]
    [response]
- isSuccess (Boolean)
- results {
    week_lv_date (array), // 차트 라벨에 쓰일 날짜 ex. ['12/03', '12/04', ’12/05',’12/06', ’12/07', ’12/08', ’12/09’]
    week_lv_one_cnt (array), // 차트에 뿌려줄 최근 1주일(오늘날짜는 제외 = 즉 어제까지의 최근 7일)동안 1시간 복권 참가수 ex. [600, 350, 1100, 420, 750, 1050, 670]
    week_lv_six_cnt (array), 차트에 뿌려줄 최근 1주일동안 6시간 복권 참가수
    week_lv_twelve_cnt (array), 차트에 뿌려줄 최근 1주일동안 12시간 복권 참가수
}*/
exports.retrieveWeekLv = function (req, res) {
    var resResults = {
        week_lv_date : [],
        week_lv_one_cnt : [],
        week_lv_six_cnt : [],
        week_lv_twelve_cnt : []
    };

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "SELECT DATE_FORMAT(CURRENT_TIMESTAMP(), '%m/%d') AS DATE_0, \
                  DATE_FORMAT(DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY), '%m/%d') AS DATE_1, \
                  DATE_FORMAT(DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 DAY), '%m/%d') AS DATE_2, \
                  DATE_FORMAT(DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 3 DAY), '%m/%d') AS DATE_3, \
                  DATE_FORMAT(DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 4 DAY), '%m/%d') AS DATE_4, \
                  DATE_FORMAT(DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 5 DAY), '%m/%d') AS DATE_5, \
                  DATE_FORMAT(DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 6 DAY), '%m/%d') AS DATE_6",
                timeout: 10000
            },
            [],
            function (error, results, columns) {
                if (error) {
                    connection.release();
                    return res.json({isSuccess: false, results: null});
                }

                resResults.week_lv_date.push(results[0].DATE_0);
                resResults.week_lv_date.push(results[0].DATE_1);
                resResults.week_lv_date.push(results[0].DATE_2);
                resResults.week_lv_date.push(results[0].DATE_3);
                resResults.week_lv_date.push(results[0].DATE_4);
                resResults.week_lv_date.push(results[0].DATE_5);
                resResults.week_lv_date.push(results[0].DATE_6);

                connection.query({
                        sql: "SELECT EVENT_DATE, COUNT(1) AS TOT_CNT \
                            FROM PARTICIPATION \
                            WHERE EVENT_TYPE = '1' \
                            AND EVENT_DATE <= DATE_FORMAT(DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY), '%y%m%d') \
                            GROUP BY EVENT_DATE \
                            ORDER BY EVENT_DATE DESC \
                            LIMIT 7",
                        timeout: 10000
                    },
                    [],
                    function (error, results, columns) {
                        if (error) {
                            connection.release();
                            return res.json({isSuccess: false, results: null});
                        }

                        resResults.week_lv_one_cnt.push(results[0].TOT_CNT);
                        resResults.week_lv_one_cnt.push(results[1].TOT_CNT);
                        resResults.week_lv_one_cnt.push(results[2].TOT_CNT);
                        resResults.week_lv_one_cnt.push(results[3].TOT_CNT);
                        resResults.week_lv_one_cnt.push(results[4].TOT_CNT);
                        resResults.week_lv_one_cnt.push(results[5].TOT_CNT);
                        resResults.week_lv_one_cnt.push(results[6].TOT_CNT);

                        connection.query({
                                sql: "SELECT EVENT_DATE, COUNT(1) AS TOT_CNT \
                                    FROM PARTICIPATION \
                                    WHERE EVENT_TYPE = '2' \
                                    AND EVENT_DATE <= DATE_FORMAT(DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY), '%y%m%d') \
                                    GROUP BY EVENT_DATE \
                                    ORDER BY EVENT_DATE DESC \
                                    LIMIT 7",
                                timeout: 10000
                            },
                            [],
                            function (error, results, columns) {
                                if (error) {
                                    connection.release();
                                    return res.json({isSuccess: false, results: null});
                                }

                                resResults.week_lv_six_cnt.push(results[0].TOT_CNT);
                                resResults.week_lv_six_cnt.push(results[1].TOT_CNT);
                                resResults.week_lv_six_cnt.push(results[2].TOT_CNT);
                                resResults.week_lv_six_cnt.push(results[3].TOT_CNT);
                                resResults.week_lv_six_cnt.push(results[4].TOT_CNT);
                                resResults.week_lv_six_cnt.push(results[5].TOT_CNT);
                                resResults.week_lv_six_cnt.push(results[6].TOT_CNT);

                                connection.query({
                                        sql: "SELECT EVENT_DATE, COUNT(1) AS TOT_CNT \
                                            FROM PARTICIPATION \
                                            WHERE EVENT_TYPE = '3' \
                                            AND EVENT_DATE <= DATE_FORMAT(DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY), '%y%m%d') \
                                            GROUP BY EVENT_DATE \
                                            ORDER BY EVENT_DATE DESC \
                                            LIMIT 7",
                                        timeout: 10000
                                    },
                                    [],
                                    function (error, results, columns) {
                                        if (error) {
                                            connection.release();
                                            return res.json({isSuccess: false, results: null});
                                        }

                                        resResults.week_lv_twelve_cnt.push(results[0].TOT_CNT);
                                        resResults.week_lv_twelve_cnt.push(results[1].TOT_CNT);
                                        resResults.week_lv_twelve_cnt.push(results[2].TOT_CNT);
                                        resResults.week_lv_twelve_cnt.push(results[3].TOT_CNT);
                                        resResults.week_lv_twelve_cnt.push(results[4].TOT_CNT);
                                        resResults.week_lv_twelve_cnt.push(results[5].TOT_CNT);
                                        resResults.week_lv_twelve_cnt.push(results[6].TOT_CNT);

                                        res.json({isSuccess: true, results: resResults});
                                    });
                            });
                    });
                //return res.json({isSuccess: true, results: results});
            });
    });
};

/*[url : /today_lv]
    [response]
- isSuccess (Boolean)
- results {
    today_lv_one_cnt (int), // 오늘 1시간 복권 참가자 수
    today_lv_six_cnt (int), // 오늘 6시간 복권 참가자 수
    today_lv_twelve_cnt (int), // 오늘 12시간 복권 참가자 수
    today_lv_tot_cnt (int), // 오늘 총 복권 참가자 수 (1시간 + 6시간 + 12시간 참가자수)
}*/
exports.retrieveTodayLv = function (req, res) {
    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "SELECT \
                    (SELECT COUNT(1) \
                    FROM PARTICIPATION \
                    WHERE EVENT_DATE = DATE_FORMAT(CURRENT_TIMESTAMP(), '%y%m%d') \
                    AND EVENT_TYPE = '1') AS TODAY_LV_ONE_CNT, \
                        (SELECT COUNT(1) \
                    FROM PARTICIPATION \
                    WHERE EVENT_DATE = DATE_FORMAT(CURRENT_TIMESTAMP(), '%y%m%d') \
                    AND EVENT_TYPE = '2') AS TODAY_LV_SiX_CNT, \
                        (SELECT COUNT(1) \
                    FROM PARTICIPATION \
                    WHERE EVENT_DATE = DATE_FORMAT(CURRENT_TIMESTAMP(), '%y%m%d') \
                    AND EVENT_TYPE = '3') AS TODAY_LV_TWELVE_CNT, \
                        (SELECT COUNT(1) \
                    FROM PARTICIPATION \
                    WHERE EVENT_DATE = DATE_FORMAT(CURRENT_TIMESTAMP(), '%y%m%d')) AS TODAY_LV_TOT_CNT",
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

/*[url : /week_profit]
    [response]
- isSuccess (Boolean)
- results {
    // 실 수익액 그래프에 받을 값은 지금은 생략하지만, 향후 발전 의향이 있다면 필요함 ㅎ
    // 생략 // week_ad (array), // 최근 1주일 광고 수익료
    // 생략 // week_point (array), // 최근 1주일 사용자에게 적립해준 포인트
    // 생략 // week_profit (array), // 최근 1주일 실제 수익료 ( week_ad - week_point )
}*/
exports.retrieveWeekProfit = function (req, res) {
    res.json({isSuccess: true});
};

/*[url : /tot_profit]
    [response]
- isSuccess (Boolean)
- results {
    // 생략 // tot_ad (int), // 총(지금까지) 광고로 번 수익료
    // 생략 // tot_profit (int), // 총 실수익액 (= 광고료 - 적립금 = tot_ad - tot_point)
    // 생략 // tot_ad_expose (int), // 총 광고 누출수
    // 생략 // tot_ad_click (int), // 총 광고 클릭수
    tot_point (int), // 총 사용자에게 적립해준 포인트
}*/
exports.retrieveTotProfit = function (req, res) {
    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "SELECT SUM(TOT.PRIZE) AS TOT_POINT \
                    FROM (SELECT CASE IFNULL(WINNING_RATE, 9) WHEN 1 THEN 500 \
                    WHEN 2 THEN 400 \
                    WHEN 3 THEN 300 \
                    WHEN 4 THEN 200 \
                    WHEN 5 THEN 100 \
                    ELSE 0 END AS PRIZE \
                    FROM PARTICIPATION) AS TOT",
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

/*[url : /rank_product]
    [response]
- isSuccess (Boolean)
- results  : [{ (Array)   // 인기 상품 top6
    ranking (int), // 순위
    name (string), // 상품명
    category (int), // 상품 카테고리
    price (int), // 상품 가격
}]   // 이거 상품 6가지를 배열로~ 이렇게 표현하는게 맞낭?
}*/
exports.retrieveRankProduct = function (req, res) {
    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "SELECT B.PRODUCT_NAME AS NAME, B.PRODUCT_CATEGORY AS CATEGORY, B.PRODUCT_PRICE AS PRICE \
                    FROM USER_PRODUCT_LIST AS A \
                    INNER JOIN PRODUCT_MASTER AS B \
                    ON A.PRODUCT_CODE = B.PRODUCT_CODE \
                    GROUP BY A.PRODUCT_CODE \
                    ORDER BY COUNT(1) DESC",
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

/*[url : /last_lv_win]
    [response]
- isSuccess (Boolean)
- results {
    last_lv_one_win (array), // 가장 마지막으로 결과 발표된 1시간짜리 빌리지 복권  등수별 당첨자수 (1~5등 등수별 당첨자 수 배열) 가장 마지막으로 나온 결과가 1등 0명, 2등 1명, 3등 2명, 4등 6명, 5등 9명 당첨 되었었다면 ex. [0,1,2,6,9]  로 보내면 됨.
    last_lv_six_win (array), // 가장 마지막 6시간짜리 빌리지 복권 등수별 당첨자수
    last_lv_twelve_win (array), // 가장 마지막 12시간짜리 빌리지 복권 등수별 당첨자수
}*/
exports.retrieveLastLvWin = function (req, res) {
    var resResults = {
        last_lv_one_win : [],
        last_lv_six_win : [],
        last_lv_twelve_win : []
    };

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: "SELECT CONCAT('1등 : ', CASE WINNING_RATE WHEN 1 THEN COUNT(1) \
                      ELSE 0 END, '명') ONE_CNT, \
                      CONCAT('2등 : ', CASE WINNING_RATE WHEN 2 THEN COUNT(1) \
                      ELSE 0 END, '명')  TWO_CNT, \
                      CONCAT('3등 : ', CASE WINNING_RATE WHEN 3 THEN COUNT(1) \
                      ELSE 0 END, '명')  THREE_CNT, \
                      CONCAT('4등 : ', CASE WINNING_RATE WHEN 4 THEN COUNT(1) \
                      ELSE 0 END, '명')  FOUR_CNT, \
                      CONCAT('5등 : ', CASE WINNING_RATE WHEN 5 THEN COUNT(1) \
                      ELSE 0 END, '명')  FIVE_CNT \
                    FROM PARTICIPATION AS A \
                    INNER JOIN (SELECT EVENT_TYPE, EVENT_DATE, EVENT_NUMBER \
                                FROM PARTICIPATION \
                                WHERE WINNING_TIME IS NOT NULL \
                                AND EVENT_TYPE = '1' \
                                ORDER BY EVENT_DATE DESC, EVENT_NUMBER DESC \
                                LIMIT 1) TOT \
                      ON A.EVENT_TYPE = TOT.EVENT_TYPE \
                      AND A.EVENT_DATE = TOT.EVENT_DATE \
                      AND A.EVENT_NUMBER = TOT.EVENT_NUMBER \
                    GROUP BY WINNING_RATE",
                timeout: 10000
            },
            [],
            function (error, results, columns) {
                if (error) {
                    connection.release();
                    return res.json({isSuccess: false, results: null});
                }

                resResults.last_lv_one_win.push(results[0].ONE_CNT);
                resResults.last_lv_one_win.push(results[0].TWO_CNT);
                resResults.last_lv_one_win.push(results[0].THREE_CNT);
                resResults.last_lv_one_win.push(results[0].FOUR_CNT);
                resResults.last_lv_one_win.push(results[0].FIVE_CNT);

                connection.query({
                        sql: "SELECT CONCAT('1등 : ', CASE WINNING_RATE WHEN 1 THEN COUNT(1) \
                              ELSE 0 END, '명') ONE_CNT, \
                              CONCAT('2등 : ', CASE WINNING_RATE WHEN 2 THEN COUNT(1) \
                              ELSE 0 END, '명')  TWO_CNT, \
                              CONCAT('3등 : ', CASE WINNING_RATE WHEN 3 THEN COUNT(1) \
                              ELSE 0 END, '명')  THREE_CNT, \
                              CONCAT('4등 : ', CASE WINNING_RATE WHEN 4 THEN COUNT(1) \
                              ELSE 0 END, '명')  FOUR_CNT, \
                              CONCAT('5등 : ', CASE WINNING_RATE WHEN 5 THEN COUNT(1) \
                              ELSE 0 END, '명')  FIVE_CNT \
                            FROM PARTICIPATION AS A \
                            INNER JOIN (SELECT EVENT_TYPE, EVENT_DATE, EVENT_NUMBER \
                                        FROM PARTICIPATION \
                                        WHERE WINNING_TIME IS NOT NULL \
                                        AND EVENT_TYPE = '2' \
                                        ORDER BY EVENT_DATE DESC, EVENT_NUMBER DESC \
                                        LIMIT 1) TOT \
                              ON A.EVENT_TYPE = TOT.EVENT_TYPE \
                              AND A.EVENT_DATE = TOT.EVENT_DATE \
                              AND A.EVENT_NUMBER = TOT.EVENT_NUMBER \
                            GROUP BY WINNING_RATE",
                        timeout: 10000
                    },
                    [],
                    function (error, results, columns) {
                        if (error) {
                            connection.release();
                            return res.json({isSuccess: false, results: null});
                        }

                        resResults.last_lv_six_win.push(results[0].ONE_CNT);
                        resResults.last_lv_six_win.push(results[0].TWO_CNT);
                        resResults.last_lv_six_win.push(results[0].THREE_CNT);
                        resResults.last_lv_six_win.push(results[0].FOUR_CNT);
                        resResults.last_lv_six_win.push(results[0].FIVE_CNT);

                        connection.query({
                                sql: "SELECT CONCAT('1등 : ', CASE WINNING_RATE WHEN 1 THEN COUNT(1) \
                                      ELSE 0 END, '명') ONE_CNT, \
                                      CONCAT('2등 : ', CASE WINNING_RATE WHEN 2 THEN COUNT(1) \
                                      ELSE 0 END, '명')  TWO_CNT, \
                                      CONCAT('3등 : ', CASE WINNING_RATE WHEN 3 THEN COUNT(1) \
                                      ELSE 0 END, '명')  THREE_CNT, \
                                      CONCAT('4등 : ', CASE WINNING_RATE WHEN 4 THEN COUNT(1) \
                                      ELSE 0 END, '명')  FOUR_CNT, \
                                      CONCAT('5등 : ', CASE WINNING_RATE WHEN 5 THEN COUNT(1) \
                                      ELSE 0 END, '명')  FIVE_CNT \
                                    FROM PARTICIPATION AS A \
                                    INNER JOIN (SELECT EVENT_TYPE, EVENT_DATE, EVENT_NUMBER \
                                                FROM PARTICIPATION \
                                                WHERE WINNING_TIME IS NOT NULL \
                                                AND EVENT_TYPE = '1' \
                                                ORDER BY EVENT_DATE DESC, EVENT_NUMBER DESC \
                                                LIMIT 1) TOT \
                                      ON A.EVENT_TYPE = TOT.EVENT_TYPE \
                                      AND A.EVENT_DATE = TOT.EVENT_DATE \
                                      AND A.EVENT_NUMBER = TOT.EVENT_NUMBER \
                                    GROUP BY WINNING_RATE",
                                timeout: 10000
                            },
                            [],
                            function (error, results, columns) {
                                if (error) {
                                    connection.release();
                                    return res.json({isSuccess: false, results: null});
                                }

                                resResults.last_lv_twelve_win.push(results[0].ONE_CNT);
                                resResults.last_lv_twelve_win.push(results[0].TWO_CNT);
                                resResults.last_lv_twelve_win.push(results[0].THREE_CNT);
                                resResults.last_lv_twelve_win.push(results[0].FOUR_CNT);
                                resResults.last_lv_twelve_win.push(results[0].FIVE_CNT);


                                res.json({isSuccess: true, results: resResults});
                            });
                    });
                //return res.json({isSuccess: true, results: results});
            });
    });
};