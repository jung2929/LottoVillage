var logger = require(__dirname + '\\../../config/winston'),
    pool = require(__dirname + '\\../../config/maria.pool');

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
                5, 15, 25,
                35, 44, 45,
                40, 500, 400,
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