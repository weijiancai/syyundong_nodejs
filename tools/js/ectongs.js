Tools.ectongs = {
    init: function() {
        // 选择数据源
        var $dataSource = $('#ectSelectDataSource');
        var $database = $('#ectSelectDatabase');
        var dataSource =  new MU.ui.DictList($dataSource, 'sys.DBDataSource');
        $dataSource.on('change', function() {
            var value = $(this).val();
            $database.empty();
            $.post('/tools/dbBrowser', {id: value, type: 'schemas'}, function(data) {
                console.log(data);
                for(var i = 0; i < data.length; i++) {
                    $database.append('<option value="' + data[i]['id'] + '">' + data[i]['name'] + '</option>')
                }
                $database.select2();
            });
        });
    }
};