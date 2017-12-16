$(window).ready(function() {
    userDetails.init();
});

// 이전 화면에서 보내준 핸드폰 번호 저장하기
var phone = location.href.substr(
    location.href.lastIndexOf('=') + 1
);

var url = "http://13.124.207.144/";

var userDetails = {
    init: function() {
        this.getPointList();
        this.getProductList();
        this.getLotteryList();
        this.initEvent();
    },

    initEvent: function() {
        var _this = this;

        $(document).on('change','#detail-point-month', this.getPointList);
        $(document).on('change','#detail-product-month', this.getProductList);
        $(document).on('change','#detail-lottery-month', this.getLotteryList);
    },

    drawPointTable : function(userData){
        var wrapper = $('#userPointTB');
        var viewTable = wrapper.find('tbody');
        viewTable.html('');

        for (var id in userData) {
            var user = userData[id];

            var viewUser = $("<tr>");
            viewUser
                .html(
                    "     <td class=\"text-center\">" + user.DATE_TIME + "</td>\n" +
                    "     <td class=\"text-center\">" + user.CONTENTS + "</td>\n" +
                    "     <td class=\"text-center font-w600\">" + user.POINT + "</td>\n" +
                    "</tr>");

            viewTable.append(viewUser);
        }
    },

    drawProductTable : function(userData){
        var wrapper = $('#userProductTB');
        var viewTable = wrapper.find('tbody');
        viewTable.html('');

        for (var id in userData) {
            var user = userData[id];

            var viewUser = $("<tr>");
            viewUser
                .html(
                    "     <td class=\"text-center\">" + user.DATE_TIME + "</td>\n" +
                    "     <td class=\"text-center\">" + user.CONTENTS + "</td>\n" +
                    "     <td class=\"text-center font-w600\">" + user.POINT + "</td>\n" +
                    "</tr>");

            viewTable.append(viewUser);
        }
    },

    drawLotteryTable : function(userData){
        var wrapper = $('#userLotteryTB');
        var viewTable = wrapper.find('tbody');
        viewTable.html('');

        for (var id in userData) {
            var user = userData[id];

            var viewUser = $("<tr>");
            viewUser
                .html(
                    "     <td class=\"text-center\">" + user.DATE_TIME + "</td>\n" +
                    "     <td class=\"text-center\">" + user.CONTENTS + "</td>\n" +
                    "     <td class=\"text-center font-w600\">" + user.POINT + "</td>\n" +
                    "</tr>");

            viewTable.append(viewUser);
        }
    },

    getPointList: function() {
        var point_year = $('#detail-point-year').val();
        var point_month = $('#detail-point-month').val();

        $.ajax({
            type: "GET",
            url: url + 'details_of_point_history_web',
            data: {
                phone_number: phone,
                event_date: point_year + point_month
            },
            dataType: "json",
            success: function(resData) {
                if (resData.isSuccess == true){
                    userDetails.drawPointTable(resData.results);
                }
            },
            error: function(request,status,error){
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    },

    getProductList: function() {
        var product_year = $('#detail-product-year').val();
        var product_month = $('#detail-product-month').val();

        $.ajax({
            type: "GET",
            url: url + 'details_of_all_product_web',
            data: {
                phone_number: phone,
                event_date: product_year + product_month
            },
            dataType: "json",
            success: function(resData) {
                if (resData.isSuccess == true){
                    userDetails.drawProductTable(resData.results);
                }
            },
            error: function(request,status,error){
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    },

    getLotteryList: function() {
        var lottery_year = $('#detail-lottery-year').val();
        var lottery_month = $('#detail-lottery-month').val();

        $.ajax({
            type: "GET",
            url: url + 'details_of_all_participation_web',
            data: {
                phone_number: phone,
                event_date: lottery_year + lottery_month
            },
            dataType: "json",
            success: function(resData) {
                if (resData.isSuccess == true){
                    userDetails.drawLotteryTable(resData.results);
                }
            },
            error: function(request,status,error){
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    }

};
