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
        //变化后的数组
        tempList = [],
        //提交表单时赋值，值与tempList相同
        tempList2 = [],
        tempList3 = [],
        //原始数组
        tempListStatic = [],
        //要加上的数组
        tempListFinal2 = [],
        //要减去的数组
        tempListFinal3 = [],
        coverUrl = null;

    //获取省信息,并赋值
    const location = sessionStorage.getItem("location");
    address.init(location.slice(0, 2), location.slice(0, 4), location);

    setTimeout(function () {
        //获取list
        $.ajax({
            url: $.cookie("tempUrl") + "connection/selectListByParkId?token=" + $.cookie("token") + "&parkId=" + $(".id").val(),
            type: "GET",
            success: function (result) {
                tempListStatic = result;
                tempList = result;
                //渲染标签
                $.ajax({
                    url: $.cookie("tempUrl") + "app/selectList?token=" + $.cookie("token") + "&pageNum=1&pageSize=99",
                    type: "GET",
                    success: function (result) {
                        $.each(result.content,
                            function (index, item) {
                                if (tempList.indexOf((item.id).toString()) !== -1) {
                                    $(".appList").append($('<input type="checkbox" lay-filter="appList" title="' + item.name + '" value="' + item.id + '" checked>'));
                                } else {
                                    $(".appList").append($('<input type="checkbox" lay-filter="appList" title="' + item.name + '" value="' + item.id + '">'));
                                }
                            });
                        form.render();
                    }
                });
            }
        });
    }, 500);

    form.on('checkbox(appList)', function (data) {
        data.elem.checked ? tempList.push(data.value) : (tempList = $.grep(tempList, function (item) {
            return item !== data.value;
        }));
        console.log(tempList);
        console.log(tempListStatic);
    });

    //普通图片上传
    const uploadInst = upload.render({
        elem: '#test1'
        , url: $.cookie("tempUrl") + 'file/uploadImage?token=' + $.cookie("token")
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
        //经纬度
        const province = $("#province").parent().find("div").find("div").find("input").val();
        const city = $("#city").parent().find("div").find("div").find("input").val();
        const area = $("#area").parent().find("div").find("div").find("input").val();
        const address = province + city + area;
        //坐标
        $.ajax({
            url: $.cookie("tempUrl") + "common/geocoderByAddress?address=" + address + $(".address").val(),
            type: "GET",
            async: false,
            success: function (result) {
                longitude = result.result.location.lng;
                latitude = result.result.location.lat;
            }
        });

        //应用更新
        tempList2 = tempList;
        tempList3 = tempList;

        tempList2.forEach((a) => {
            let c = tempListStatic.findIndex(b => a === b);
            if (c > -1) delete tempListStatic[c];
            else tempListFinal2.push(a);
        });
        console.log(tempListFinal2);

        tempListStatic.forEach((a) => {
            let c = tempList3.findIndex(b => a === b);
            if (c > -1) delete tempList2[c];
            else tempListFinal3.push(a);
        });
        console.log(tempListFinal3);

        //弹出loading
        const index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        $.ajax({
            url: $.cookie("tempUrl") + "park/updateByPrimaryKeySelective?token=" + $.cookie("token"),
            type: "PUT",
            datatype: "application/json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                id: $(".id").val(),
                name: $(".name").val(),
                logo: coverUrl,
                location: data.field.area,
                address: $(".address").val(),
                longitude: longitude,
                latitude: latitude,
                introduction: $(".introduction").val(),
                sort: null,
                appIds2: tempListFinal2,
                appIds3: tempListFinal3
            }),
            success: function (result) {
                if (result.code === 0) {
                    layer.msg("更新成功");
                    setTimeout(function () {
                        top.layer.close(index);
                        layer.closeAll("iframe");
                        //刷新父页面
                        parent.location.reload();
                    }, 500);
                } else {
                    layer.msg(result.exception, {icon: 7, anim: 6});
                }
            }
        });
        return false;
    });
});