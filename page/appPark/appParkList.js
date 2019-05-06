layui.use(['form', 'layer', 'table'], function () {
        const form = layui.form,
            layer = parent.layer === undefined ? layui.layer : top.layer,
            $ = layui.jquery,
            table = layui.table;

        //列表
        const tableIns = table.render({
            elem: '#list',
            url: $.cookie("tempUrl") + 'park/selectListByAppId',
            where: {token: $.cookie("token"), appId: sessionStorage.getItem("appId")},
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
                {field: 'parkId', title: 'ID', width: 70, align: 'center'},
                {
                    field: 'name', title: '园区名称', minWidth: 100, align: "left", templet: function (d) {
                        return '<a lay-event="edit" style="cursor:pointer;color: #01AAED">' + d.name + '</a>';
                    }
                },
                {
                    field: 'areaName', title: '归属地', minWidth: 200, align: "left", templet: function (d) {
                        return d.areaName;
                    }
                },
                {field: 'address', title: '详细地址', minWidth: 200, align: 'left'}
            ]]
        });

        //列表操作
        table.on('tool(test)', function (obj) {
            const layEvent = obj.event,
                data = obj.data;
            let index;
            if (layEvent === 'edit') {
                index = layui.layer.open({
                    title: "查看/更新园区",
                    type: 2,
                    content: "appParkUpd.html",
                    success: function (layero, index) {
                        const body = layui.layer.getChildFrame('body', index);
                        body.find(".parkId").val(data.parkId);
                        body.find(".name").val(data.name);
                        form.render();
                    }
                });
                layui.layer.full(index);
                window.sessionStorage.setItem("index", index);
                $(window).on("resize", function () {
                    layui.layer.full(window.sessionStorage.getItem("index"));
                });
            }
        });
    }
);
