module.exports = function(app) {
    var main = require(process.cwd() + '/app/web/controllers/main.server.controller');
    app.get('/lottoVillage_main', main.main);
    app.get('/analyze_user', main.retrieveAnalyzeUser);
    app.get('/week_lv', main.retrieveWeekLv);
    app.get('/today_lv', main.retrieveTodayLv);
    app.get('/week_profit', main.retrieveWeekProfit);
    app.get('/tot_profit', main.retrieveTotProfit);
    app.get('/rank_product', main.retrieveRankProduct);
    app.get('/last_lv_win', main.retrieveLastLvWin);
};