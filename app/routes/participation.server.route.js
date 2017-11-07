module.exports = function(app){
    var participation = require(process.cwd() + '/app/controllers/participation.server.controller');
    app.get('/lotto_rounds', participation.lotto_rounds);
    app.get('/details_of_lotto', participation.details_of_lotto);
    app.get('/details_of_winning_info', participation.details_of_winning_info);
    app.get('/details_of_all_winning_info', participation.details_of_all_winning_info);
    app.get('/details_of_participation', participation.details_of_participation);
    app.get('/details_of_one_day_participation', participation.details_of_one_day_participation);
    app.get('/details_of_all_participation', participation.details_of_all_participation);
    app.route('/participation')
        .post(participation.participation);
};