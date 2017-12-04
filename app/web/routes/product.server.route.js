module.exports = function(app){
    var product = require(process.cwd() + '/app/web/controllers/product.server.controller');
    app.get('/product_list', product.retrieveProductList);
    app.route('/register_product')
        .post(product.insertProduct);
    app.route('/delete_product')
        .post(product.deleteProduct);
    app.route('/update_product')
        .post(product.updateProduct);
};