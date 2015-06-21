+function($) {
    'use strict';

    function DataTable($container, option) {
        var dt = $container.DataTable($.extend({}, $.fn.muDataTable.defaults, option));

    }

    DataTable.prototype = {

    };

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data('mu.dataTable');
            if(!data) {
                var dt = new MU.ui.DataTable($this);
                var metaId = $this.data('meta') || option.meta;
                dt.setMetaId(metaId);
                dt.applyOption(option);

                $this.data('mu.dataTable', dt);
            }
        });
    }

    var defaults = {
        searching: false,
        lengthChange: false,
        processing: true,
        serverSide: true,
        paginate: true,
        info: false,
        data: [],

        meta: null
    };

    $.fn.muDataTable = Plugin;
    $.fn.muDataTable.defaults = defaults;

    $(function() {
        // 初始化dataTable对象
        $('.mu-dataTable').muDataTable();
    });
}(jQuery);