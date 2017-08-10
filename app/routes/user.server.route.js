module.exports = function(app){
	var user = require('../controllers/user.server.controller');
	app.get('/login', user.render);
};