var logger = require(process.cwd() + '/config/winston'),
    pool = require(process.cwd() + '/config/maria.pool'),
    request = require('request'),
    cheerio = require('cheerio'),
    iconv = require('iconv-lite');

exports.drawLottery = function (eventType, eventDate, eventNumber) {
    logger().info('매시간 마다 울리는 스케쥴러 작동');

    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'INSERT INTO WINNING_INFO(EVENT_TYPE, EVENT_DATE, EVENT_NUMBER,\
                WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3,\
                WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6,\
                BONUS_NUMBER, PRIZE_1, PRIZE_2, \
                PRIZE_3, PRIZE_4, PRIZE_5)  \
                VALUES(?, ?, ?,\
                ?, ?, ?,\
                ?, ?, ?,\
                ?, ?, ?,\
                ?, ?, ?)',
                timeout: 10000
            },
            [eventType, eventDate, eventNumber,
                9, 30, 34,
                35, 39, 41,
                21, 500, 400,
                300, 200, 100],
            function (error, results, columns) {
                connection.release();

                if (error) {
                    return logger().info('매 1시간 자동 추첨 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                }

                logger().info('매 1시간 자동 추첨 완료');
            });
    });
};

exports.everySixHour = function () {
    logger().info('6시간 마다 울리는 스케쥴러 작동');
};

exports.everyTwelveHour = function () {
    logger().info('12시간 마다 울리는 스케쥴러 작동');
};

exports.everySunday = function () {
    logger().info('일요일 밤12시 마다 울리는 스케쥴러 작동');
    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT PK_ID \
                FROM LOTTO_INFO \
                ORDER BY PK_ID DESC \
                LIMIT 1',
                timeout: 10000
            },
            [],
            function (error, results, columns) {
                if (error) {
                    connection.release();
                    return logger().info('자동 로또당첨번호 회차 불러오기 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                }

                if (!results[0].PK_ID) {
                    connection.release();
                    return logger().info('자동 로또당첨번호 회차 불러오기 - 불러온 회차 : ' + results[0].PK_ID);
                }

                var number = results[0].PK_ID;

                var requestOptions = {
                    method: 'GET',
                    uri: 'http://www.nlotto.co.kr/gameResult.do?method=byWin&drwNo=' + number,
                    headers: {'User-Agent': 'Mozilla/5.0'},
                    encoding: null
                };

                request(requestOptions, function (err, res, body) {
                    if (err) return logger().info(number + '회 자동 로또당첨번호 크롤링 오류 : ' + err.message);

                    var strContents = new Buffer(body);

                    var $ = cheerio.load(iconv.decode(strContents, 'EUC-KR').toString());
                    var baseElements = $('section.contentSection article.contentsArticle article div.content_wrap');
                    var lottoDate = baseElements.find('div.lotto_win_number.mt12 h3.result_title span').text();
                    var lottoNumbers = baseElements.find('div.lotto_win_number.mt12 p.number img');
                    var lottoDetails = baseElements.find('table.tblType1.f12.mt40 tbody tr td[class=rt]');

                    pool.getConnection(function (err, connection) {
                        connection.query({
                                sql: 'INSERT INTO LOTTO_INFO(PK_ID, WINNING_DATE, \
                                        WINNING_NUMBER_1, WINNING_NUMBER_2, WINNING_NUMBER_3, \
                                        WINNING_NUMBER_4, WINNING_NUMBER_5, WINNING_NUMBER_6, BONUS_NUMBER, \
                                        TOTAL_PRIZE_1, TOTAL_NUMBER_1, PER_PRIZE_1,\
                                        TOTAL_PRIZE_2, TOTAL_NUMBER_2, PER_PRIZE_2,\
                                        TOTAL_PRIZE_3, TOTAL_NUMBER_3, PER_PRIZE_3,\
                                        TOTAL_PRIZE_4, TOTAL_NUMBER_4, PER_PRIZE_4,\
                                        TOTAL_PRIZE_5, TOTAL_NUMBER_5, PER_PRIZE_5) \
                                        VALUES(?, ?, \
                                        ?, ?, ?, \
                                        ?, ?, ?, ?, \
                                        ?, ?, ?, \
                                        ?, ?, ?, \
                                        ?, ?, ?, \
                                        ?, ?, ?, \
                                        ?, ?, ?)',
                                timeout: 10000
                            },
                            [number, lottoDate,
                                $(lottoNumbers[0]).attr('alt'), $(lottoNumbers[1]).attr('alt'), $(lottoNumbers[2]).attr('alt'),
                                $(lottoNumbers[3]).attr('alt'), $(lottoNumbers[4]).attr('alt'), $(lottoNumbers[5]).attr('alt'), $(lottoNumbers[6]).attr('alt'),
                                $(lottoDetails[0]).text(), $(lottoDetails[1]).text(), $(lottoDetails[2]).text(),
                                $(lottoDetails[3]).text(), $(lottoDetails[4]).text(), $(lottoDetails[5]).text(),
                                $(lottoDetails[6]).text(), $(lottoDetails[7]).text(), $(lottoDetails[8]).text(),
                                $(lottoDetails[9]).text(), $(lottoDetails[10]).text(), $(lottoDetails[11]).text(),
                                $(lottoDetails[12]).text(), $(lottoDetails[13]).text(), $(lottoDetails[14]).text()],
                            function (error, results, columns) {
                                connection.release();

                                if (error) {
                                    return logger().info(number + '회 자동 로또당첨번호 등록 - 에러코드 : ' + error.code + ', 에러내용 : ' + error.sqlMessage);
                                }

                                logger().info(number + '회 자동 로또당첨번호 등록 완료');
                            });
                    });
                });
            });
    });
};