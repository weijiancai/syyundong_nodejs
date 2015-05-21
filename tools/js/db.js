Tools.DB = function() {
    var self = this;

    var dataSourceForm = new MU.ui.DataForm();
    dataSourceForm.colCount = 1;
    dataSourceForm.fieldList = [
        {name: 'name', displayName: '名称：', required: true},
        {name: 'dbType', displayName: '数据库类型：', required: true, displayStyle: MU.C_DS_COMBO_BOX, list: [{data: 'mysql', label: 'MySql'}, {data: 'sqlServer', label: 'SqlServer'}]},
        {name: 'isVpn', displayName: '是否VPN：', required: false, displayStyle: MU.C_DS_COMBO_BOX, list: [{data: 'F', label: '否'}, {data: 'T', label: '是'}]},
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
            var filterDiv = '<div class="dbSearchFilter" style="display: none;"><ul>' +
                '<li><label><input type="checkbox" name="types" value="TABLE">表</label></li>' +
                '<li><label><input type="checkbox" name="types" value="VIEW">视图</label></li>' +
                '<li><label><input type="checkbox" name="types" value="COLUMN">列</label></li>' +
                '<li><label><input type="checkbox" name="types" value="CONSTRAINT">约束</label></li>' +
                '<li><label><input type="checkbox" name="types" value="INDEX">索引</label></li>' +
                '<li><label><input type="checkbox" name="types" value="TRIGGER">触发器</label></li>' +
                '<li><label><input type="checkbox" name="types" value="PROCEDURE">存储过程</label></li>' +
                '<li><label><input type="checkbox" name="types" value="FUNCTION">函数</label></li>' +
                '</ul>' +
                '<div><button id="filterSelectAll" type="button" class="btn btn-primary btn-sm">全选</button> <button id="filterUnSelectAll" type="button" class="btn btn-primary btn-sm">全不选</button></div>' +
                '</div>';
            dialog({
                //title: '搜索',
                content: '<div class="flex search_input"><input type="text" class="form-control" placeholder="表/视图/列/约束/索引/触发器/函数"><span id="dbFilterTag" class="glyphicon glyphicon-filter"></span></div><ul id="dbSearchResult" class="list-group" style="display: none;"></ul>' + filterDiv,
                quickClose: true,
                padding: 5,
                onshow: function () {
                    var $content = this._$('content');
                    var $filterDiv = $content.find('.dbSearchFilter');
                    // 过滤
                    $content.find('#dbFilterTag').click(function() {
                        $filterDiv.toggle();
                    });
                    // 全选
                    $content.find('#filterSelectAll').click(function() {
                        $filterDiv.find('input').each(function() {
                            this['checked'] = true;
                        });
                    });
                    // 全不选
                    $content.find('#filterUnSelectAll').click(function() {
                        $filterDiv.find('input').removeAttr('checked');
                    });
                    // 搜索框
                    $content.find('input').focus().keyup(function(event) {
                        var types = [];
                        $filterDiv.find('input:checked').each(function() {
                            types.push($(this).val());
                        });
                        searchDb(event, this, types.join(','));
                    });

                }
            }).width(480).focus().show();
        });
    };

    this.initTable = function(id, children) {
        var columns = [], pk;
        for(var i = 0; i < children.length; i++) {
            var column = children[i];
            var name = column.id.split('.')[3];
            var obj = {data: name, title: name, dataType: column.dataType, className: column.dataType, isPk: column.isPk, isFk: column.isFk, editable: true, displayName: column.displayName, tip: column.name};
            if(obj.isFk) {
                obj.render = (function(name) {
                    return function(data, type, full, meta) {
                        return '<a href="#" onclick="showFkDetail(\''+ id +'\', \'' + name + '\', \'' + data + '\')">' +data + '</a>';
                    }
                })(name);
                obj.editable = false; // 外键不可编辑
            } else {
                obj.render = function(data) {
                    return '<div>' + data + '</div>';
                }
            }
            if(obj.isPk) {
                pk = obj.data;
            }
            columns.push(obj);
        }

        var tableName = id.split('.')[2];
        var $tabs = $('#db_tablesPanel');
        var $ul = $tabs.find('ul');
        $ul.find('li').removeClass('active');
        $ul.append('<li class="active"><a href="#table_' + tableName + '" data-toggle="tab">' + tableName + '</a></li>');

        var $panel = $tabs.find('div.tab-content');
        $panel.find('> div').removeClass('active');
        var $newPanel = $('<div class="tab-pane active" id="table_' + tableName + '"></div>');
        $newPanel.append();
        $panel.append($newPanel);

        var crud = new MU.ui.DataCrud($newPanel);
        var dt = crud.dataTable();
        dt.setHeight(600);
        dt.setColumns(columns);
        dt.setUrl('/tools/dbRetrieve?id=' + id + '&pk=' + (pk ? pk : ''));
        dt.setEditable(true, '/tools/dbEditTable', {table: id});
        dt.applyOption();

        // 初始化表单
        var queryForm = crud.queryForm();
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
function searchDb(event, input, types) {
    console.log(types);
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
    if(!nodes || nodes.length == 0) {
        MU.ui.Message.alert('请选择数据源');
        return;
    }

    var node = nodes[0];
    params.type = node.type;
    params.id = node.id;
    params.filter = types;

    $.post('/tools/dbSearch', params, function(data) {
        if(data) {
            var $result = $('#dbSearchResult').empty().show();
            for(var i = 0; i < data.length; i++) {
                $result.append(data[i]);
            }
        }
    });
}