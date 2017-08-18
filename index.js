var express = require(__dirname + '/config/express'),
    schedule = require('node-schedule'),
    logger = require(__dirname + '/config/winston');
// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    |
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

schedule.scheduleJob('0 * * * *', function () {
    logger().info('매시 0분에 울리는 스케쥴러 작동');
});

schedule.scheduleJob('0 */6 * * *', function () {
    logger().info('6시간마다 울리는 스케쥴러 작동');
});

schedule.scheduleJob('0 */12 * * *', function () {
    logger().info('12시간마다 울리는 스케쥴러 작동');
});

var app = express();
app.listen(3000);
module.exports = app;
console.log('Server Running 3000 Port');