$(window).ready(function() {
    product.init();
});

var url = "http://13.124.207.144/";

var product = {
    init: function() {
        this.getProductList();
        this.initEvent();
    },

    initEvent: function() {
        var _this = this;

        $(document).on('click touchend','.productUpdateBtn', this.gotoProductModify);
        $(document).on('click touchend','.productRegistBtn', this.postProductRegister);
        $(document).on('click touchend','.productDeleteBtn', this.postProductDelete);
    },

    drawProductTable : function(productData){
        var viewTable = $('#productList');
        viewTable.html('');

        for (var id in productData) {
            var product = productData[id];
            var category;
            var categoryTag;
            var status;

            switch(Number(product.PRODUCT_CATEGORY)){
                case 0:
                    category = '외식';
                    categoryTag = 'bg-primary';
                    break;
                case 1:
                    category = '카페';
                    categoryTag = 'bg-success';
                    break;
                case 2:
                    category = '편의점';
                    categoryTag = 'bg-info';
                    break;
                case 3:
                    category = '뷰티';
                    categoryTag = 'bg-warning';
                    break;
                case 4:
                    category = '문화생활';
                    categoryTag = 'bg-danger';
                    break;
                case 5:
                    category = '기타';
                    categoryTag = 'bg-success';
                    break;
                default:
                    categoryTag = 'bg-warning';
            }

            switch(product.PRODUCT_STATUS){
                case '0':
                case 'N':
                    status = '판매 중지';
                    break;
                case '1':
                case 'Y':
                    status = '판매중';
                    break;
                default:
                    status = '판매중';
            }

            var viewProduct = $("<div class=\"col-sm-6 col-lg-3\">");
            viewProduct
                .html(
                    "              <a class=\"product_data block block-link-hover2 text-center\" href=\"javascript:void(0)\">\n" +
                    "                <div class=\"block-header\">\n" +
                    "                  <h3 class=\"product_name block-title\">" + product.PRODUCT_NAME + "</h3>\n" +
                    "                </div>\n" +
                    "                <div class=\"block-content block-content-full " + categoryTag + "\">\n" +
                    "                  <div class=\"h1 font-w700 push-10\">&#8361; <span class=\"product_price\">" + product.PRODUCT_PRICE + "</span></div>\n" +
                    "                </div>\n" +
                    "                <div class=\"block-content\">\n" +
                    "                  <table class=\"table table-borderless table-condensed\">\n" +
                    "                    <tbody>\n" +
                    "                      <tr>\n" +
                    "                        <td>Code. <strong class=\"product_code\">" + product.PRODUCT_CODE + "</strong></td>\n" +
                    "                      </tr>\n" +
                    "                      <tr>\n" +
                    "                        <td>Category <strong class=\"product_category\" data-category=\"" + product.PRODUCT_CATEGORY + "\">" + category + "</strong></td>\n" +
                    "                      </tr>\n" +
                    "                      <tr>\n" +
                    "                        <td>Status <strong class=\"product_status\" data-status=\"" + product.PRODUCT_STATUS + "\">" + status + "</strong></td>\n" +
                    "                      </tr>\n" +
                    "                      <tr>\n" +
                    "                        <td>Description <br><strong class=\"product_contents\">" + product.PRODUCT_CONTENTS + "</strong></td>\n" +
                    "                      </tr>\n" +
                    "                    </tbody>\n" +
                    "                  </table>\n" +
                    "                </div>\n" +
                    "                <div class=\"block-content block-content-mini block-content-full bg-gray-lighter\">\n" +
                    "                  <span class=\"productUpdateBtn btn btn-default\" data-toggle=\"modal\" data-target=\"#modifyModal\">수정</span>\n" +
                    "                  <span class=\"productDeleteBtn btn btn-default\">삭제</span>\n" +
                    "                </div>\n" +
                    "              </a>\n" +
                    "\n" +
                    "            </div>");
            viewTable.append(viewProduct);
        }
    },

    getProductList: function() {
        $.ajax({
            type: "GET",
            url: url + 'product_list',
            dataType: "json",
            success: function(resData) {
                if (resData.isSuccess == true){
                    product.drawProductTable(resData.results);
                } else {
                    console.log('get product list 실패 ');
                }
            },
            error: function(request,status,error){
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    },

    postProductRegister: function() {
        var $form = $('form[name=product_register]');
        var $code = $form.find('input[name=product_code]');
        var $name = $form.find('input[name=product_name]');
        var $price = $form.find('input[name=product_price]');
        var $status = $form.find('input[name=product_status]:checked');
        var $category = $form.find('input[name=product_category]:checked');
        var $contents = $form.find('textarea[name=product_contents]');

        $.ajax({
            type: "POST",
            url: url + 'product_register',
            dataType: "json",
            data: {
                product_code : parseInt($code.val()),
                product_name : $name.val(),
                product_price : parseInt($price.val()),
                product_status : $status.val(),
                product_contents : $contents.val(),
                product_category : $category.val()
            },
            success: function(resData) {
                if (resData.isSuccess == true){
                    console.log('success product');
                    window.location.href = '/lottoVillage_productManage.html';
                } else {
                    alert('상품 등록에 실패하였습니다. 상품 정보를 다시 확인해주세요!');
                }
            },
            error: function(request,status,error){
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    },

    postProductDelete: function() {
        console.log($(this));
        var product_code = $(this).parent().parent().find(".product_code").text();

        $.ajax({
            type: "POST",
            url: url + 'product_delete',
            dataType: "json",
            data: {
                product_code : parseInt(product_code)
            },
            success: function(resData) {
                if (resData.isSuccess == true){
                    window.location.href = '/lottoVillage_productManage.html';
                }
            },
            error: function(request,status,error){
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    },

    gotoProductModify: function() {
        var product = $(this).closest(".product_data");
        product.code = product.find(".product_code").text();
        product.name = product.find(".product_name").text();
        product.price = product.find(".product_price").text();
        product.status = product.find(".product_status").data('status');
        product.category = product.find(".product_category").data('category');
        product.contents = product.find(".product_contents").text();

        window.location.href = '/lottoVillage_productModify.html?code=' + product.code + '&name=' + product.name + '&price=' + product.price + '&status=' + product.status + '&category=' + product.category + '&contents=' + product.contents;
    }
};
