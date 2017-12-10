module.exports = function(app){
    var prediction = require(process.cwd() + '/app/mobile/controllers/algorithm.server.controller');
    app.get('/prediction_algorithm', prediction.prediction_algorithm);
    app.route('/prediction')
        .post(prediction.prediction);
};