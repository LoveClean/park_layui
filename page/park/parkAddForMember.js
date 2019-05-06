layui.config({
    base: "../../js/"
}).extend({
    "address": "address"
});
layui.use(['form', 'layer', "address", 'upload'], function () {
    const form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        address = layui.address,
        upload = layui.upload,
        $ = layui.jquery;

    let longitude = null,
        latitude = null,
        tempList = [],
        coverUrl = null;

    //获取省信息
    address.provinces();

    //标签
    $.ajax({
        url: "http://122.112.225.34:8089/app/selectList?pageNum=1&pageSize=99",
        type: "GET",
        success: function (result) {
            $.each(result.content,
                function (index, item) {
                    $(".appList").append($('<input type="checkbox" lay-filter="appList" title="' + item.name + '" value="' + item.id + '">'));
                });
            form.render();
        }
    });

    form.on('checkbox(appList)', function (data) {
        data.elem.checked ? tempList.push(data.value) : (tempList = $.grep(tempList, function (item) {
            return item !== data.value;
        }));
        console.log(tempList);
    });

    //封面图上传
    const uploadInst = upload.render({
        elem: '#test1'
        , url: $.cookie("tempUrl") + 'file/uploadImage'
        , method: 'post'  //可选项。HTTP类型，默认post
        , before: function (obj) {
            //预读本地文件示例，不支持ie8
            obj.preview(function (index, file, result) {
                $('#demo1').attr('src', result); //图片链接（base64）
            });
        }
        , done: function (res) {
            //如果上传失败
            if (res.code > 0) {
                return layer.msg('上传失败');
            } else {
                //上传成功
                coverUrl = res.data;
            }
        }
        , error: function () {
            //演示失败状态，并实现重传
            const demoText = $('#demoText');
            demoText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-mini demo-reload">重试</a>');
            demoText.find('.demo-reload').on('click', function () {
                uploadInst.upload();
            });
        }
    });

    form.verify({
        name: function (val) {
            if (val.length > 16) {
                return "名称过长";
            }
        }
    });

    form.on("submit(addNews)", function (data) {
        const province = $("#province").parent().find("div").find("div").find("input").val();
        const city = $("#city").parent().find("div").find("div").find("input").val();
        const area = $("#area").parent().find("div").find("div").find("input").val();
        const address = province + city + area;
        //坐标
        $.ajax({
            url: "http://122.112.225.34:8089/common/geocoderByAddress?address=" + address + $(".address").val(),
            type: "GET",
            async: false,
            success: function (result) {
                longitude = result.result.location.lng;
                latitude = result.result.location.lat;
            }
        });
        // 弹出loading
        const index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        $.ajax({
            url: "http://122.112.225.34:8089/park/insertSelectiveForMember",
            type: "POST",
            datatype: "application/json",
            contentType: "application/json;charset=utf-8",
            async: false,
            data: JSON.stringify({
                name: $(".name").val(),
                logo: coverUrl,
                location: data.field.area,
                address: $(".address").val(),
                longitude: longitude,
                latitude: latitude,
                introduction: $(".introduction").val(),
                sort: null,
                appIds: tempList
            }),
            success: function (result) {
                if (result.code === 0) {
                    layer.msg("申请成功，请等待管理员审核。。");
                    setTimeout(function () {
                        window.location.href = "./temp.html";
                    }, 1000);
                } else {
                    layer.msg(result.exception, {icon: 7, anim: 6});
                }
            }
        });
        return false;
    });
});