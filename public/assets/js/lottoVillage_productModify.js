$(window).ready(function() {
    modify.init();
});

var url = "http://13.124.207.144/";

var modify = {
    init: function () {
        this.initGetData();
        this.initEvent();
    },

    initEvent: function () {
        var _this = this;

        $(document).on('click touchend', '#finishedProductUpdateBtn', this.postProductUpdate);
    },

    initGetData: function() {
        // 이전 화면에서 보내준 상품정보 저장하기
        var $d_form = $('form[name=product_update]');
        var $d_code = $d_form.find('input[name=product_code]');
        var $d_name = $d_form.find('input[name=product_name]');
        var $d_price = $d_form.find('input[name=product_price]');
        var $d_status = $d_form.find('input[name=product_status]');
        var $d_category = $d_form.find('input[name=product_category]');
        var $d_contents = $d_form.find('textarea[name=product_contents]');
        var getStatus;

        if (modify.getParameter('status') == 'N') {
            getStatus = '0';
        } else if (modify.getParameter('status') == 'Y') {
            getStatus = '1';
        }

        $d_code.val(modify.getParameter('code'));
        $d_name.val(modify.getParameter('name'));
        $d_price.val(modify.getParameter('price'));
        $d_status.filter('[value=\'' + getStatus + '\']').attr("checked", true);
        $d_category.filter('[value=\'' + modify.getParameter('category') + '\']').attr("checked", true);
        $d_contents.val(modify.getParameter('contents'));
    },

    getParameter: function (param) {
        var returnValue;
        var url = location.href;
        var parameters = (url.slice(url.indexOf('?') + 1, url.length)).split('&');
        for (var i = 0; i < parameters.length; i++) {
            var varName = parameters[i].split('=')[0];
            if (varName.toUpperCase() == param.toUpperCase()) {
                returnValue = parameters[i].split('=')[1];
                return decodeURIComponent(returnValue);
            }
        }
    },

    postProductUpdate: function () {
        var $form = $('form[name=product_update]');
        var $code = $form.find('input[name=product_code]');
        var $name = $form.find('input[name=product_name]');
        var $price = $form.find('input[name=product_price]');
        var $status = $form.find('input[name=product_status]:checked');
        var $category = $form.find('input[name=product_category]:checked');
        var $contents = $form.find('textarea[name=product_contents]');
        // var $contents = $('#product_contents');

        $.ajax({
            type: "POST",
            url: url + 'product_update',
            dataType: "json",
            data: {
                product_code: parseInt($code.val()),
                product_name: $name.val(),
                product_price: parseInt($price.val()),
                product_status: $status.val(),
                product_contents: $contents.val(),
                product_category: $category.val()
            },
            success: function (resData) {
                console.log('success');
                if (resData.isSuccess == true) {
                    window.location.href = '/lottoVillage_productManage.html';
                } else {
                    alert('상품 수정을 실패하였습니다. 상품 정보를 다시 확인해주세요!');
                }
            },
            error: function (request, status, error) {
                alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
            }
        });
    }
};
