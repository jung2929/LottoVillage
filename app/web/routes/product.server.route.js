module.exports = function(app){
    var product = require(process.cwd() + '/app/web/controllers/product.server.controller');
    // 상품 관리 페이지
    app.get('/product_manage', product.productManage);

    // 상품 조회 페이지
    app.get('/product_list_web', product.retrieveProductListWeb);

    // 상품 등록
    app.route('/product_register')
        .post(product.registerProduct);

    // 상품 삭제
    app.route('/product_delete')
        .post(product.deleteProduct);

    // 상품 업데이트
    app.route('/product_update')
        .post(product.updateProduct);
};