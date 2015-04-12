/**
 * Created by wei_jc on 2015/4/6.
 */
$(function() {
    // 注册body id
    $('body').attr('id', 'activity');

    var $form = $('#searchForm');
    // 报名中
    $('#statusReg').change(function () {
        submit('state_reg', $(this).get(0).checked ? 'T' : 'F');
    });
    // 比赛中
    $('#statusIn').change(function () {
        submit('state_in', $(this).get(0).checked ? 'T' : 'F');
    });
    // 已结束
    $('#statusOver').change(function () {
        submit('state_over', $(this).get(0).checked ? 'T' : 'F');
    });

    // 省
    $('#provinceId').change(function () {
        var province = $(this).val();
        if (province != '') {
            submit('province', province);
        }
    });


    // 排序
    $('#order-group').find('li a').click(function() {
        var value = $(this).data('value');
        console.log(value);
        if(value == 'createDate') {
            $('#orderByNew').val('C');
        } else if(value == 'followCount') {
            $('#orderByNew').val('F');
        }else if(value == 'startDate') {
            $('#orderByNew').val('S');
        }
        if($(this).find('i.icon-down')) {
            $('#order').val('down'); // 降序
        } else {
            $('#order').val('up'); // 升序
        }
        $form.submit();
    });

    // 运动项目
    var $sportTypePanel = $('#sportTypePanel');
    $sportTypePanel.find('dt a').click(function() {
        $($sportTypePanel).find('dt a.current').removeClass('current');
        $(this).addClass('current');
        submit('sportType', $(this).data('value'));
    });

    // 时间
    $('#dateList').find('a').click(function() {
        $(this).parent().find('a.current').removeClass('current');
        $(this).addClass('current');
        submit('date', $(this).data('value'));
    });

    // 关键字
    $('#btnSearchKeyword').click(function() {
        var value = $('#inputKeyword').val();

        if(value != '') {
            submit('keyword', value);
        }
    });

    // 提交
    function submit(id, value) {
        $('#' + id).val(value);
        $form.submit();
    }
});