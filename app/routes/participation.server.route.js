module.exports = function(app){
    var participation = require(process.cwd() + '/app/controllers/participation.server.controller');
    app.get('/details_of_lotto', participation.details_of_lotto);
    app.get('/details_of_participation', participation.details_of_participation);
    app.route('/participation')
        .post(participation.participation);
};