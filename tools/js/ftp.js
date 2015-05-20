Tools.ftp = {
    init: function() {
        var baseDir = '/';
        var dirs = ['/'];

        var $container = $('#ftpTable');
        var ftpTable = new MU.ui.DataTable($container);
        ftpTable.setColumns([
            {data: 'name', title: '名称',
                render: function(data, type, row) {
                    if(row['type'] == 'd') { // 目录
                        return '<a class="dir" href="javascript:void(0)">' + data + '</a>';
                    }

                    return data;
                }
            },
            {data: 'date', title: '最后修改时间'},
            {data: 'size', title: '大小', render: function(data, type, row) {
                var kb = 1024;
                var mb = 1024 * 1024;
                var gb = 1024 * 1024 * 1024;
                var tb = 1024 * 1024 * 1024 * 1024;

                var number = parseInt(data);
                var result;
                if(number > tb) {
                    result = (number / tb).toFixed(2) + ' TB';
                } else if(number > gb) {
                    result = (number / gb).toFixed(2) + ' GB';
                } else if(number > mb) {
                    result = (number / mb).toFixed(2) + ' MB';
                } else {
                    result = (number / kb).toFixed(2) + ' KB';
                }

                return result.replace('.00', '');
            }},
            {data: 'type', title: '类型'},
            {data: 'download', title: '下载/删除', render: function(data, type, row) {
                return '<a href="/tools/ftpDownload?path=' + row['path'] + '" class="btn btn-default download"><span class="glyphicon glyphicon-download"></span></a>' +
                    '<a href="javascript:void(0)" class="btn btn-default delete" data-file="' + row['name'] + '"><span class="icon-trash"></span></a>'
            }}
        ]);
        ftpTable.onLoadDataEnd(function() {
            var $ftpTable = $('#ftpTable');
            $ftpTable.find('a.dir').click(function() {
                dirs.push($(this).text());
                gotoDir();
            });
            // 删除
            $ftpTable.find('a.delete').click(function() {
                $.get('/tools/ftpDelete', {path: dirs.join('/').substr(1) + '/' + $(this).data('file')}, function(data) {
                    if(data) {
                        gotoDir();
                    } else {
                        alert('删除失败！');
                    }
                })
            });
        });
        ftpTable.showPaginate(false);
        ftpTable.setUrl('/tools/ftpBrowser', {path: '/'});
        ftpTable.applyOption();
        //ftpTable.query();

        // 上一级
        $('#goToParent').click(function() {
            if(dirs.length > 1) {
                dirs.pop();
            }
            gotoDir();
        });

        // 刷新
        $('#refreshPath').click(function() {
            gotoDir();
        });

        function updateBreadcrumb() {
            console.log(dirs);
            var $breadcrumb = $('#desktop_ftp').find('.breadcrumb').empty();
            for(var i = 0; i < dirs.length; i++) {
                $breadcrumb.append('<li><a href="javascript:void(0)">' + dirs[i] + '</a></li>');
            }
        }

        function gotoDir() {
            ftpTable.query({path: getPath()});

            updateBreadcrumb();
        }

        function getPath() {
            return dirs.length == 1 ? '/' : dirs.join('/').substr(1);
        }

        // 文件上传
        $('#drag-and-drop-zone').dmUploader({
            dataType: 'json',
//        allowedTypes: 'image/*',
            /*extFilter: 'jpg;png;gif',*/
            onInit: function(){
                console.log('onInit');
                $.danidemo.addLog('#demo-debug', 'default', 'Plugin initialized correctly');
            },
            onBeforeUpload: function(id){
                $.danidemo.addLog('#demo-debug', 'default', 'Starting the upload of #' + id);

                $.danidemo.updateFileStatus(id, 'default', 'Uploading...');
                $('#drag-and-drop-zone').data('dmUploader').settings.url = '/tools/ftpUpload?path=' + getPath();
            },
            onNewFile: function(id, file){
                $.danidemo.addFile('#demo-files', id, file);
            },
            onComplete: function(){
                $.danidemo.addLog('#demo-debug', 'default', 'All pending tranfers completed');
            },
            onUploadProgress: function(id, percent){
                var percentStr = percent + '%';

                $.danidemo.updateFileProgress(id, percentStr);
            },
            onUploadSuccess: function(id, data){
                $.danidemo.addLog('#demo-debug', 'success', 'Upload of file #' + id + ' completed');

                $.danidemo.addLog('#demo-debug', 'info', 'Server Response for file #' + id + ': ' + JSON.stringify(data));

                $.danidemo.updateFileStatus(id, 'success', 'Upload Complete');

                $.danidemo.updateFileProgress(id, '100%');
            },
            onUploadError: function(id, message){
                $.danidemo.updateFileStatus(id, 'error', message);

                $.danidemo.addLog('#demo-debug', 'error', 'Failed to Upload file #' + id + ': ' + message);
            },
            onFileTypeError: function(file){
                $.danidemo.addLog('#demo-debug', 'error', 'File \'' + file.name + '\' cannot be added: must be an image');
            },
            onFileSizeError: function(file){
                $.danidemo.addLog('#demo-debug', 'error', 'File \'' + file.name + '\' cannot be added: size excess limit');
            },
            /*onFileExtError: function(file){
             $.danidemo.addLog('#demo-debug', 'error', 'File \'' + file.name + '\' has a Not Allowed Extension');
             },*/
            onFallbackMode: function(message){
                $.danidemo.addLog('#demo-debug', 'info', 'Browser not supported(do something else here!): ' + message);
            }
        });
    }
};