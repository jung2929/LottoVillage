module.exports = function(app){
    var product = require(process.cwd() + '/app/mobile/controllers/product.server.controller');
    app.get('/', product.render);

    //app.get('/reward/list', product.reward_list_info);
    //app.route('/reward/list')
    //    .post(product.reward_exchange_info);

    app.get('/product_list', product.retrieveProductList);
};