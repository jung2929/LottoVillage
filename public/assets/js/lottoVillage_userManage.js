$(window).ready(function() {
    userAdmin.init();
});

var url = "http://localhost:3000/";
//var url = "http://192.9.44.53:65004/";

var userAdmin = {
    init: function() {
        // this.drawUserTable(myJson.results);
        this.getUserList();
        this.initEvent();
    },

    initEvent: function() {
        var _this = this;

        $(document).on('click touchend','.ban-btn', this.banUser);
        $(document).on('click touchend','.details-btn', this.detailUser);
    },

    drawUserTable : function(userData){
        var wrapper = $('#userListTB');
        var viewTable = wrapper.find('tbody');
        viewTable.html('');

        for (var id in userData) {
            var user = userData[id];
            var userState = '';
            if (user.USER_STATUS == 0){
                userState = "<td class=\"hidden-xs text-left \">\n" +
                            "    <span class=\"label label-success\">일반</span>\n" +
                            "    <button class=\"ban-btn btn btn-xs btn-default\" type=\"button\" data-toggle=\"tooltip\" title=\"영구 정지\"><i class=\"fa fa-close\"></i></button>\n" +
                            "</td>";
            } else {
                userState = "<td class=\"hidden-xs text-left\">\n" +
                            "    <span class=\"label label-danger\">정지</span>\n" +
                            "</td>";
            }

            var viewUser = $("<tr>");
            viewUser
                .html(
                    "        <td class=\"font-w600 text-center sorting_1\">" + user.USER_NAME + "</td>\n" +
                    "            <td class=\"user-phone text-center\">" + user.PHONE_NUMBER + "</td>\n" +
                    "            <td class=\"hidden-xs text-right\">" + user.USER_TOT_POINT + " p</td>\n" +
                    "        <td class=\"hidden-xs text-center\">" + user.REGISTER_DATETIME + "</td>\n" +
                    "        <td class=\"hidden-xs text-center\">" + user.CURRENT_DATETIME + "</td>\n" + userState +
                    "            <td class=\"text-center\">\n" +
                    "            <div class=\"btn-group\">\n" +
                    "            <button class=\"details-btn btn btn-xs btn-default\" type=\"button\" data-toggle=\"tooltip\" title=\"내역 보기\">자세히 보기 <i class=\"fa fa-angle-right\"></i></button>\n" +
                    "        </div>\n" +
                    "        </td>\n" +
                    "        </tr>");
            viewTable.append(viewUser);
        }
    },

    getUserList: function() {
        $.ajax({
            type: "GET",
            url: url + 'user_list',
            dataType: "json",
            success: function(resData) {
                if (resData.isSuccess == true){
                    userAdmin.drawUserTable(resData.results);
                }
            },
            error: function(request,status,error){
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    },

    banUser: function() {
        var phone = $(this).closest("tr")
            .find(".user-phone")
            .text();

        $.ajax({
            type: "POST",
            url: url + 'user_block',
            dataType: "json",
            data: {
                phone_number : phone
            },
            success: function(resData) {
                if (resData.isSuccess == true){
                    alert('영구정지 했습니다!');
                    window.location.href = '/lottoVillage_userManage.html';
                }
            },
            error: function(request,status,error){
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
                window.location.href = '/lottoVillage_userManage.html';
            }
        });
    },

    detailUser: function(){
        var phone = $(this).closest("tr")
            .find(".user-phone")
            .text();

        window.location.href = '/lottoVillage_userDetails.html?index=' + phone;
    }
};
