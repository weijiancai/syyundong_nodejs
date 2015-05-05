Tools.DB = function() {
    var self = this;

    var dt = new MU.ui.DataTable($('#dbTable'));
    dt.setHeight(600);
    dt.setUrl('/tools/dbRetrieve');

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
                    if(treeNode.type == 'table') {
                        console.log(treeNode);
                        var children = treeNode.children;
                        if(!children) {
                            return;
                        }
                        for(var i = 0; i < children.length; i++) {
                            if(children[i].type == 'column') {
                                children = children[i].children;
                                break;
                            }
                        }
                        if(children) {
                            self.initTable(treeNode.id, children);
                        } else {
                            $.post('/tools/dbBrowser', {id: treeNode.id, type: 'column'}, function(children) {
                                self.initTable(treeNode.id, children);
                            });
                        }
                    }
                }
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
            columns.push({data: column.name, title: column.name});
        }

        dt.setColumns(columns);
        dt.query({id: id});
    }
};