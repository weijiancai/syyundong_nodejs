Tools.DB = function() {
    var self = this;

    var crud = new MU.ui.DataCrud($('#tab_dbTables'));

    // 查询表单
    var queryForm;

    var dataSourceForm = new MU.ui.DataForm();
    dataSourceForm.colCount = 1;
    dataSourceForm.fieldList = [
        {name: 'name', displayName: '名称：', required: true},
        {name: 'dbType', displayName: '数据库类型：', required: true, displayStyle: MU.C_DS_COMBO_BOX, list: [{data: 'mysql', label: 'MySql'}, {data: 'sqlServer', label: 'SqlServer'}]},
        {name: 'host', displayName: '主机：', required: true},
        {name: 'port', displayName: '端口：', required: true},
        {name: 'user', displayName: '用户名：', required: true},
        {name: 'password', displayName: '密码：', required: true, displayStyle: MU.C_DS_PASSWORD},
        {name: 'database', displayName: '数据库：', required: true}
    ];

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
                },
                onRightClick: function(event, treeId, treeNode) { // 右键菜单
                    if(treeNode && !treeNode.noR) {
                        if(treeNode.type == 'datasource') {
                            $('#treeMenuDataSource').show().css({"top": event.clientY + "px", "left": event.clientX + "px", "visibility":"visible"});
                        }
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

        // 添加数据源
        $('#btnDbAddDataSource').click(function() {
            var dialog = new MU.ui.Dialog();
            dialog.open('新增数据源', dataSourceForm.gen(), function() {
                dataSourceForm.post('/tools/dbSaveDataSource', {}, function() {
                    dialog.close();
                    self.refreshDbTree();
                });
            });
        });

        // 数据源右键菜单
        var $treeMenuDataSource = $('#treeMenuDataSource');
        $treeMenuDataSource.find('li').on('click', function(e) {
            e.preventDefault();

            $treeMenuDataSource.hide();
            var $this = $(this);

            var treeObj = $.fn.zTree.getZTreeObj("dbBrowser");
            var nodes = treeObj.getSelectedNodes();
            if(!nodes || nodes.length == 0) {
                dialog({
                    title: '警告',
                    content: '请选择数据源！'
                }).show();
                return;
            }

            if($this.hasClass('edit')) {
                self.editDataSource(nodes[0]);
            }if($this.hasClass('delete')) {
                self.deleteDataSource(nodes[0]);
            }
        });

        // 注册事件，隐藏右键菜单
        $treeMenuDataSource.on('mouseleave', function() {
            $treeMenuDataSource.hide();
        });

        // 搜索数据库
        $('#btnDbSearch').on('click', function() {
            dialog({
                //title: '搜索',
                content: '<input type="text" class="form-control" onkeyup="searchDb(event, this)"><ul id="dbSearchResult" class="list-group" style="display: none;"></ul>',
                quickClose: true,
                padding: 5,
                onshow: function () {
                    var $content = this._$('content');
                    $content.find('input').focus();
                }
            }).width(480).focus().show();
        });
    };

    this.initTable = function(id, children) {
        var columns = [], pk;
        for(var i = 0; i < children.length; i++) {
            var column = children[i];
            var name = column.id.split('.')[3];
            var obj = {data: name, title: name, dataType: column.dataType, className: column.dataType, isPk: column.isPk, isFk: column.isFk, editable: true};
            if(obj.isFk) {
                obj.render = (function(name) {
                    return function(data, type, full, meta) {
                        return '<a href="#" onclick="showFkDetail(\''+ id +'\', \'' + name + '\', \'' + data + '\')">' +data + '</a>';
                    }
                })(name);
                obj.editable = false; // 外键不可编辑
            }
            if(obj.isPk) {
                pk = obj.data;
            }
            columns.push(obj);
        }

        var dt = crud.dataTable();
        dt.setHeight(600);
        dt.setColumns(columns);
        dt.setUrl('/tools/dbRetrieve?id=' + id + '&pk=' + (pk ? pk : ''));
        dt.setEditable(true, '/tools/dbEditTable', {table: id});
        dt.applyOption();
        //crud.query({id: id});

        // 初始化表单
        queryForm = crud.queryForm();
        queryForm.genByDataTable(dt);
    };

    this.editDataSource = function(node) {
        var dialog = new MU.ui.Dialog();
        var $form = dataSourceForm.gen();
        for(var key in node.obj) {
            if(node.obj.hasOwnProperty(key)) {
                dataSourceForm.setValue(key, node.obj[key]);
            }
        }
        dialog.open('编辑数据源', $form , function() {
            dataSourceForm.post('/tools/dbSaveDataSource', {}, function() {
                dialog.close();
                self.refreshDbTree();
            });
        });
    };

    this.deleteDataSource = function(node) {
        $.post('/tools/dbDeleteDataSource', {name: node.id}, function() {
            self.refreshDbTree();
        });
    };

    // ztree重新加载跟节点
    this.refreshDbTree = function() {
        var treeObj = $.fn.zTree.getZTreeObj("dbBrowser");
        treeObj.reAsyncChildNodes(null, 'refresh');
    };
};

// 显示外键详细信息
function showFkDetail(table, column, value) {
    $.post('/tools/dbShowFkDetail', {table: table, column: column, value: value}, function(data) {
        var children = data.columns;
        var form = new MU.ui.DataForm();
        form.colCount = 3;

        var columns = [];
        for(var i = 0; i < children.length; i++) {
            var column = children[i];
            var name = column.id.split('.')[3];
            var obj = {name: name, displayName: name, dataType: column.dataType, isPk: column.isPk, isFk: column.isFk};
            columns.push(obj);
        }
        form.fieldList = columns;
        var content = form.gen();
        form.setValues(data.data);

        dialog({
            title: data.fkTable,
            content: content
        }).width(1000).showModal();
    });
}

// 搜索数据库
function searchDb(event, input) {
    if(event.keyCode != 13) {
        return;
    }
    var value = $(input).val();
    if(MU.UString.isEmpty(value)) {
        return;
    }
    var params = {value: value};

    var treeObj = $.fn.zTree.getZTreeObj("dbBrowser");
    var nodes = treeObj.getSelectedNodes();
    if(!nodes || nodes.length > 0) {
        var node = nodes[0];
        params.type = node.type;
        params.id = node.id;
    }

    $.post('/tools/dbSearch', params, function(data) {
        if(data) {
            var $result = $('#dbSearchResult').empty().show();
            for(var i = 0; i < data.length; i++) {
                $result.append(data[i]);
            }
        }
    });
}