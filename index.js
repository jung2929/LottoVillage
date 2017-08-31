var express = require(process.cwd() + '/config/express'),
    schedule = require('node-schedule'),
    scheduleController = require(process.cwd() + '/app/controllers/schedule.server.controller'),
    logger = require(process.cwd() + '/config/winston'),
    dateFormat = require('dateformat');

// *     *     *     *     *     *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    |
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)
schedule.scheduleJob('0 * * * *', function () {
    logger().info('매시간 마다 울리는 스케쥴러 작동');
    scheduleController.drawLottery('1', dateFormat(new Date(), 'yymmdd'), dateFormat(new Date(), 'HH'));
});

schedule.scheduleJob('0 */6 * * *', function () {
    logger().info('6시간 마다 울리는 스케쥴러 작동');
    scheduleController.drawLottery('2', dateFormat(new Date(), 'yymmdd'), dateFormat(new Date(), 'HH'));
});

schedule.scheduleJob('0 */12 * * *', function () {
    logger().info('12시간 마다 울리는 스케쥴러 작동');
    scheduleController.drawLottery('3', dateFormat(new Date(), 'yymmdd'), dateFormat(new Date(), 'HH'));
});

schedule.scheduleJob('0 0 * * 4', function () {
    logger().info('일요일 밤12시 마다 울리는 스케쥴러 작동');
    scheduleController.everySunday();
});

var app = express();
app.listen(3000);
module.exports = app;
logger().info('로또빌리지 서버 시작');