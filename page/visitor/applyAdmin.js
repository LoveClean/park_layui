layui.use(['form', 'layer'], function () {
    const form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery;

    form.verify({
        password: function (value, item) {
            if (value.length < 6) {
                return "密码长度不能小于6位";
            } else if (value.length > 13) {
                return "密码长度不能大于13位";
            }
        },
        rePassword: function (value, item) {
            if (!new RegExp($("#password").val()).test(value)) {
                return "两次输入密码不一致，请重新输入！";
            }
        }
    });

    form.on("submit(addNews)", function (data) {
        const applyAdminPhone = $(".phone").val();
        // 弹出loading
        const index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        $.ajax({
            url: "http://122.112.225.34:8089/admin/apply",
            type: "POST",
            datatype: "application/json",
            contentType: "application/json;charset=utf-8",
            async: false,
            data: JSON.stringify({
                account: applyAdminPhone,
                password: $(".password").val(),
                phone: applyAdminPhone
            }),
            success: function (result) {
                if (result.code === 0) {
                    // layer.msg("申请成功，请等待管理员审核。。");
                    $.cookie('applyAdminPhone', applyAdminPhone, {path: '/'});
                    setTimeout(function () {
                        window.location.href = "./applyPark.html";
                    }, 500);
                } else {
                    layer.msg(result.exception, {icon: 7, anim: 6});
                }
            }
        });
        return false;
    });
});