var express = require(__dirname + '/config/express'),
    schedule = require('node-schedule'),
    scheduleController = require(__dirname + '/app/controllers/schedule.server.controller');

// *     *     *     *     *     *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    |
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)
/*schedule.scheduleJob('0 * * * *', function () {
    scheduleController.drawLottery('1', '170824', '16');
});*/

schedule.scheduleJob('0 */6 * * *', function () {
    scheduleController.everySixHour();
});

schedule.scheduleJob('0 */12 * * *', function () {
    scheduleController.everyTwelveHour();
});

schedule.scheduleJob('0 0 * * 4', function () {
    scheduleController.everySunday();
});

var app = express();
app.listen(3000);
module.exports = app;
console.log('Server Running 3000 Port');