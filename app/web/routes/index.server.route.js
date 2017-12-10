module.exports = function(app){
	var index = require(process.cwd() + '/app/web/controllers/index.server.controller');
	app.get('/', index.render);
    app.get('/lottoVillage_counselManage', index.counselManage);
};