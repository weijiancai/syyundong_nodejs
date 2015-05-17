/*
 * Datepicker for Jeditable (currently buggy, not for production)
 *
 * Copyright (c) 2007-2008 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Depends on Datepicker jQuery plugin by Kelvin Luck:
 *   http://kelvinluck.com/assets/jquery/datePicker/v2/demo/
 *
 * Project home:
 *   http://www.appelsiini.net/projects/jeditable
 *
 * Revision: $Id$
 *
 */
 
$.editable.addInputType('datetimepicker', {
    /* create input element */
    element : function(settings, original) {
        var input = $('<input>');
        $(this).append(input);
        //$(input).css('opacity', 0.01);
        return(input);
    },
    /* attach 3rd party plugin to input element */
    plugin : function(settings, original) {
        /* Workaround for missing parentNode in IE */
        var form = this;
        settings.onblur = 'ignore';
        var $input = $("input", this);

        $input.daterangepicker({
            startDate: original.revert,
            format: 'YYYY-MM-DD HH:mm:ss',
            timePicker: true,
            singleDatePicker: true,
            timePickerSeconds: true,
            timePickerIncrement: 1,
            timePicker12Hour: false,
            /*ranges: {
                '今天': [moment(), moment()],
                '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '最近7天': [moment().subtract(6, 'days'), moment()],
                '最近30天': [moment().subtract(29, 'days'), moment()],
                '本月': [moment().startOf('month'), moment().endOf('month')],
                '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            opens: 'center',*/
            buttonClasses: ['btn', 'btn-sm'],
            applyClass: 'btn-primary',
            cancelClass: 'btn-default',
            drops: 'down',
            locale: {
                applyLabel: '确定',
                cancelLabel: '取消',
                fromLabel: '从',
                toLabel: '到',
                weekLabel: '周',
                customRangeLabel: '自定义',
                daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
                monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                firstDay: 1
            }
        }, function(start, end, label) {
            $input.val(start.format('YYYY-MM-DD HH:mm:ss'));
            $(form).submit();
        }).on('apply.daterangepicker', function(e) {
            $(form).submit();
        }).on('cancel.daterangepicker', function() {
            reset();
        }).on('hide.daterangepicker', function() {
            reset();
        })
        .click();

        function reset() {
            original.editing = false;
            $(original).html(original.revert);
        }
    }
});