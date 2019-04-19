layui.use(['form', 'layer', 'upload'], function () {
    const form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        upload = layui.upload,
        $ = layui.jquery;

    //标签
    $.ajax({
        url: $.cookie("tempUrl") + "park/selectList?token=" + $.cookie("token") + "&pageNum=1&pageSize=99",
        type: "GET",
        success: function (result) {
            $.each(result.content,
                function (index, item) {
                    $(".parkList").append($('<input type="checkbox" lay-filter="appList" title="' + item.name + '" value="' + item.parkId + '">'));
                });
            form.render();
        }
    });

    let tempList = [];
    form.on('checkbox(appList)', function (data) {
        data.elem.checked ? tempList.push(data.value) : (tempList = $.grep(tempList, function (item) {
            return item !== data.value;
        }));
        console.log(tempList);
    });

    //图标上传
    let coverUrl = null;
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
        //弹出loading
        const index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        $.ajax({
            url: $.cookie("tempUrl") + "app/insertSelective?token=" + $.cookie("token"),
            type: "POST",
            datatype: "application/json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                name: $(".name").val(),
                icon: coverUrl,
                sort: null,
                parkIds: tempList
            }),
            success: function (result) {
                if (result.code === 0) {
                    layer.msg("新增成功");
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