Tools.DB = function() {
    var self = this;

    var dt = new MU.ui.DataTable($('#dbTable'));
    dt.setHeight(600);
    dt.setUrl('/tools/dbRetrieve');

    // 查询表单
    var queryForm;

    this.init = function() {
        // 数据库浏览
        $.fn.zTree.init($("#dbBrowser"), {
            async: {
                enable: true,
                url: '/tools/dbBrowser',
                type: 'post',
                autoParam:["id", "type"]
            },
            callback: {
                onClick: function(event, treeId, treeNode) {
                    console.log(treeNode);
                    if(treeNode.type == 'table') {
                        var children = treeNode.children;
                        if(!children) {
                            return;
                        }
                        for(var i = 0; i < children.length; i++) {
                            if(children[i].type == 'columns') {
                                children = children[i].children;
                                break;
                            }
                        }
                        if(children) {
                            self.initTable(treeNode.id, children);
                        } else {
                            $.post('/tools/dbBrowser', {id: treeNode.id, type: 'columns'}, function(children) {
                                self.initTable(treeNode.id, children);
                            });
                        }
                    }
                },
                onAsyncSuccess: function (event, treeId, treeNode, msg) {
                    if(treeNode) {
                        var zTree = $.fn.zTree.getZTreeObj(treeId);
                        treeNode.name = treeNode.name + '<span class="num">(' + treeNode.children.length + ')</span>';
                        zTree.updateNode(treeNode);
                    }
                }
            },
            view: {
                nameIsHTML: true
            }
        });

        var cmSql = CodeMirror.fromTextArea($('#dbSqlConsole').get(0), {
            mode: 'text/x-sql',
            lineNumbers: true,
            indentUnit: 4
        });
    };

    this.initTable = function(id, children) {
        var columns = [];
        for(var i = 0; i < children.length; i++) {
            var column = children[i];
            var name = column.id.split('.')[3];
            columns.push({data: name, title: name, dataType: column.dataType});
        }

        dt.setColumns(columns);
        dt.query({id: id});

        // 初始化表单
        queryForm = new MU.ui.DataForm($('#dbQueryForm'));
        queryForm.colCount = 3;
        queryForm.formType = MU.C_FT_QUERY;
        queryForm.genByDataTable(dt);
    }
};