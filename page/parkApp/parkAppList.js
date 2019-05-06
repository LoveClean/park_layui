layui.use(['form', 'layer', 'table'], function () {
    const form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        table = layui.table;

    //列表
    const tableIns = table.render({
        elem: '#list',
        url: $.cookie("tempUrl") + 'app/selectListByParkId',
        where: {token: $.cookie("token"), parkId: sessionStorage.getItem("parkId")},
        method: "GET",
        request: {
            pageName: 'pageNum' //页码的参数名称，默认：page
            , limitName: 'pageSize' //每页数据量的参数名，默认：limit
        },
        response: {
            statusName: 'code' //数据状态的字段名称，默认：code
            , statusCode: 0 //成功的状态码，默认：0
            , msgName: 'httpStatus' //状态信息的字段名称，默认：msg
            , countName: 'totalElements' //数据总数的字段名称，默认：count
            , dataName: 'content' //数据列表的字段名称，默认：data
        },
        cellMinWidth: 95,
        page: true,
        height: "full-25",
        limits: [5, 10, 15, 20, 25],
        limit: 15,
        id: "dataTable",
        cols: [[
            {field: 'id', title: 'ID', width: 70, align: 'center'},
            {
                field: 'icon', title: '图标', width: 60, align: "left", templet: function (d) {
                    return '<img src="' + d.icon + '?x-image-process=image/resize,w_30,h_30/quality,q_80" alt=""/>';
                }
            },
            {
                field: 'name', title: '应用名称', minWidth: 200, align: "left", templet: function (d) {
                    return '<a lay-event="edit" style="cursor:pointer;color: #01AAED">' + d.name + '</a>';
                }
            }
        ]]
    });

    //列表操作
    table.on('tool(test)', function (obj) {
        const layEvent = obj.event,
            data = obj.data;
        if (layEvent === 'edit') {
            const index = layui.layer.open({
                title: "查看/更新应用",
                type: 2,
                content: "parkAppUpd.html",
                success: function (layero, index) {
                    const body = layui.layer.getChildFrame('body', index);
                    body.find(".appId").val(data.id);
                    // body.find(".parkId").val(sessionStorage.getItem("parkId"));
                    body.find(".name").val(data.name);
                    // body.find(".createDate").val(data.createDate);
                    // body.find("#demo1").attr("src", data.icon);  //封面图
                    form.render();
                    // layer.msg("建议全屏查看")
                }
            });
            layui.layer.full(index);
            window.sessionStorage.setItem("index", index);
            $(window).on("resize", function () {
                layui.layer.full(window.sessionStorage.getItem("index"));
            });
        }
    });
});
