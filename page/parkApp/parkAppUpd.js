layui.use(['form', 'layer', 'layedit', 'upload'], function () {
    const form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        upload = layui.upload,
        layedit = layui.layedit,
        $ = layui.jquery;

    //创建一个编辑器
    const editIndex = layedit.build('content', {
        height: 500,
        uploadImage: {
            url: $.cookie("tempUrl") + 'file/uploadImageEdit?token=' + $.cookie("token")
        }
    });

    setTimeout(function () {
        $.ajax({
            url: $.cookie("tempUrl") + "app/selectParkAppInfo?token=" + $.cookie("token") + "&appId=" +  $(".appId").val() + "&parkId=" + sessionStorage.getItem("parkId"),
            type: "GET",
            success: function (result) {
                if (result.code === 0) {
                    const data = result.data;
                    $(".id").val(data.id);
                    $("#demo1").attr("src", data.cover);  //封面图
                    $(".color").val(data.color);
                    // 渲染联系人
                    loadContact(data.contact);
                    $(".description").val(data.description);
                    $(".address").val(data.address);
                    $(".price").val(data.price);
                    $(".introduction").val(data.introduction);
                    layedit.setContent(editIndex, data.content);
                } else {
                    layer.msg(result.exception, {icon: 7, anim: 6});
                }
            }
        });
    },500);

    function loadContact(contactList) {
        if (contactList !== null) {
            $(".contact-name").val(contactList[0].name);
            $(".contact-value").val(contactList[0].value);
            for (let i = 1; i < contactList.length; i++) {
                $(".contact-wrap").append(" <div class=\"layui-form-item contact\">\n" +
                    "                    <label class=\"layui-form-label\">联系人" + (i + 1) + "</label>\n" +
                    "                    <div class=\"layui-input-inline\">\n" +
                    "                        <input type=\"text\" class=\"layui-input contact-name\" placeholder=\"名称\" value='" + contactList[i].name + "' >\n" +
                    "                    </div>\n" +
                    // "                    <label class=\"layui-form-label\">电话</label>\n" +
                    "                    <div class=\"layui-input-inline\">\n" +
                    "                        <input type=\"number\" class=\"layui-input contact-value\" placeholder=\"手机号\" value='" + contactList[i].value + "'>\n" +
                    "                    </div>\n" +
                    "                </div>")
            }
        }
    }

    $("#contact-add-btn").on("click", function (e) {
        e.preventDefault();
        if ($(".contact").length < 5) {
            $(".contact-wrap").append(" <div class=\"layui-form-item contact\">\n" +
                "                    <label class=\"layui-form-label\">联系人</label>\n" +
                "                    <div class=\"layui-input-inline\">\n" +
                "                        <input type=\"text\" class=\"layui-input contact-name\" placeholder=\"名称\" >\n" +
                "                    </div>\n" +
                // "                    <label class=\"layui-form-label\">电话</label>\n" +
                "                    <div class=\"layui-input-inline\">\n" +
                "                        <input type=\"number\" class=\"layui-input contact-value\" placeholder=\"手机号\" >\n" +
                "                    </div>\n" +
                "                </div>")
        }
    });

    //普通图片上传
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

    form.on("submit(addNews)", function (data) {
        //弹出loading
        const index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        $.ajax({
            url: $.cookie("tempUrl") + "app/updateParkAppInfo?token=" + $.cookie("token"),
            type: "PUT",
            datatype: "application/json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                id: $(".id").val(),
                cover: coverUrl,
                address: $(".address").val(),
                price: $(".price").val(),
                contact: packContact(),
                description: $(".description").val(),
                introduction: $(".introduction").val(),
                status: 1,
                content: layedit.getContent(editIndex)
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

    function packContact() {
        let contactList = [];
        $(".contact").each(function () {
            let name = $(this).find(".contact-name").val();
            let value = $(this).find(".contact-value").val();
            if (name !== "" && value !== "") {
                contactList.push({
                    name: name,
                    value: value
                })
            }
        })
        return contactList;

    }
});