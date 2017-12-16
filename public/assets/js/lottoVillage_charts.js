/*
 *  Document   : base_comp_charts.js
 *  Author     : pixelcave
 *  Description: Custom JS code used in Charts Page
 */

$(window).ready(function() {
    BaseCompCharts.init();
});

//var url = "http://localhost:3000/";
var url = "http://13.124.207.144/";
// var url = "http://192.9.44.53:65004/";

var week1 = [];
var week6 = [];
var week12 = [];

var BaseCompCharts = {
    init: function() {
        this.getAnalyzeUser();
        this.getTodayLv();
        this.getTotalProfit();
        this.getRankProductList();
        this.getLastWin();
    },

    getAnalyzeUser: function() {
        $.ajax({
            type: "GET",
            url: url + 'analyze_user',
            dataType: "json",
            success: function(resData) {
                if (resData.isSuccess == true){
                    $('#USER_TOT_TODAY').text(resData.results[0].USER_TOT_TODAY);
                    $('#USER_TOT').text(resData.results[0].USER_TOT);
                    $('#USER_RATE_LOGIN').text(resData.results[0].USER_RATE_LOGIN + '%');
                }
            },
            error: function(request,status,error){
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    },

    getTodayLv: function() {
        $.ajax({
            type: "GET",
            url: url + 'today_lv',
            dataType: "json",
            success: function(resData) {
                if (resData.isSuccess == true){
                    $('#TODAY_LV_ONE_CNT').text('1시간 ' + resData.results[0].TODAY_LV_ONE_CNT + '명');
                    $('#TODAY_LV_SiX_CNT').text('6시간 ' + resData.results[0].TODAY_LV_SiX_CNT +'명');
                    $('#TODAY_LV_TWELVE_CNT').text('12시간 ' + resData.results[0].TODAY_LV_TWELVE_CNT +'명');
                    $('#TODAY_LV_TOT_CNT').text('오늘 참가수 ' + resData.results[0].TODAY_LV_TOT_CNT +'명');
                }
            },
            error: function(request,status,error){
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    },

    getTotalProfit: function() {
        $.ajax({
            type: "GET",
            url: url + 'tot_profit',
            dataType: "json",
            success: function(resData) {
                if (resData.isSuccess == true){
                    $('#TOT_POINT').text('지급 포인트 ' + resData.results[0].TOT_POINT +'p');
                }
            },
            error: function(request,status,error){
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    },

    getRankProductList: function() {
        $.ajax({
            type: "GET",
            url: url + 'rank_product',
            dataType: "json",
            success: function(resData) {
                if (resData.isSuccess == true){
                    BaseCompCharts.drawRankProductTable(resData.results);
                }
            },
            error: function(request,status,error){
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    },

    drawRankProductTable : function(productData){
        var wrapper = $('#productLankTB');
        var viewTable = wrapper.find('tbody');
        viewTable.html('');

        for (var id in productData) {
            var product = productData[id];

            // 0 : store_meal  외식
            // 1 : store_coffee커피/베이커리
            // 2 : store_convenience편의점
            // 3 : store_beauty        뷰티
            // 4 : store_culture          문화생활
            // 5 : store_etc                기타
            var category;
            var categoryTag;

            switch(Number(product.CATEGORY)){
                case 0:
                    category = '외식';
                    categoryTag = 'label-primary';
                    break;
                case 1:
                    category = '카페';
                    categoryTag = 'label-success';
                    break;
                case 2:
                    category = '편의점';
                    categoryTag = 'label-info';
                    break;
                case 3:
                    category = '뷰티';
                    categoryTag = 'label-warning';
                    break;
                case 4:
                    category = '문화생활';
                    categoryTag = 'label-danger';
                    break;
                case 5:
                    category = '기타';
                    categoryTag = 'label-success';
                    break;
            }

            var viewProduct = $("<tr>");
            viewProduct
                .html(
                    "                                    <td class=\"text-center\">" + ++id + "</td>\n" +
                    "                                    <td>"+product.NAME + "</td>\n" +
                    "                                    <td class=\"hidden-xs\">\n" +
                    "                                        <span class=\"label " + categoryTag + "\">"+ category + "</span>\n" +
                    "                                    </td>\n" +
                    "                                    <td class=\"text-center\">" + product.PRICE + "원</td>\n" +
                    "                                </tr>"
                );
            viewTable.append(viewProduct);
        }
    },

    getLastWin : function() {
        $.ajax({
            type: "GET",
            url: url + 'last_lv_win',
            dataType: "json",
            success: function(resData) {
                if (resData.isSuccess == true){
                    week1 = resData.results.last_lv_one_win;
                    week6 = resData.results.last_lv_six_win;
                    week12 = resData.results.last_lv_twelve_win;
                }

                // Init ChartJS charts
                BaseCompCharts.initChartsSparkline();
            },
            error: function(request,status,error){
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    },

    // jQuery Sparkline Charts, for more examples you can check out http://omnipotent.net/jquery.sparkline/#s-docs
    initChartsSparkline: function(){
        console.log(week1);
        var ranking = 1;
        // Bar Charts
        var $barOptions = {
            type: 'bar',
            barWidth: 8,
            barSpacing: 6,
            height: '70px',
            barColor: '#fadb7d',
            tooltipFormat: '{{value}}'
        };
        jQuery('.js-slc-bar1').sparkline([1,2,4,27,3,2], $barOptions);
        //[1,2,4,27,3,2]

        $barOptions['barColor']         = '#abe37d';
        // $barOptions['tooltipPrefix']    = '';
        // $barOptions['tooltipSuffix']    = '';
        jQuery('.js-slc-bar2').sparkline([1,7,2,1,3,2], $barOptions);
        //[1,7,2,1,3,2]

        $barOptions['barColor']         = '#faad7d';
        // $barOptions['tooltipPrefix']    = '';
        // $barOptions['tooltipSuffix']    = ' Sales';
        jQuery('.js-slc-bar3').sparkline([3,2,4,5,3,2], $barOptions);
        //[3,2,4,5,3,2]

        // Pie Charts
        var $pieCharts = {
            type: 'pie',
            width: '50px',
            height: '50px',
            sliceColors: ['#fadb7d','#faad7d', '#a886fb', '#75b0eb','#abe37d'],
            tooltipFormat: '{{value}}'
        };
        jQuery('.js-slc-pie1').sparkline([1,2,4,27,3,2], $pieCharts);

        $pieCharts['tooltipPrefix'] = '$ ';
        $pieCharts['tooltipSuffix'] = '';
        jQuery('.js-slc-pie2').sparkline([1,7,2,1,3,2], $pieCharts);

        $pieCharts['tooltipPrefix'] = '';
        $pieCharts['tooltipSuffix'] = ' Sales';
        jQuery('.js-slc-pie3').sparkline([3,2,4,5,3,2], $pieCharts);
    }
};