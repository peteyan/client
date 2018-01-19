var App = {};

App.FLAG_ED_ADVANCED = 'ED_ADVANCED';
App.FLAG_ED_BIZ = 'ED_BIZ';
App.FLAG_SCANNER = 'SCANNER';

App.asJson = function (json) {
    if (json) {
        return $.parseJSON(json);
    }
    return null;
};

App.showMessage = function (msg) {
    alert(msg);
};

App.saveTcpIpPrinter = function (frm) {
    var r = PrinterManager.save_tcpip_printer(frm.net_device_no.value, frm.net_name.value, frm.ip.value);
    if (!r) {
        alert("添加成功但无法连接打印机，请检查连接是否正确");
        return false;
    }
};

App.saveComPrinter = function (frm) {
    var r = PrinterManager.save_com_printer(frm.com_device_no.value, frm.com_name.value, frm.com_name.value);
    if (!r) {
        alert("添加成功但无法连接打印机，请检查连接是否正确");
        return false;
    }
};

App.addPrinter = function (frm) {
    if (frm.net_printer_type.checked) {
        App.saveTcpIpPrinter(frm);
    }
    if (frm.com_printer_type.checked) {
        App.saveComPrinter(frm);
    }
    jQuery('.global_pop,.mask').hide();
    return false;
};

App.buildPrinterTr = function (printer) {
    var op = '<a href="javascript:App.resetPrinter(\'' + printer.name + '\')">设为照片打印机</a>'
    if (printer.used) {
        op = "默认照片打印机";
    }

    var isWindowsDefault = "-";
    if (printer.default) {
        isWindowsDefault = "系统默认"
    }

    var tr = "<tr>";
    tr += "<td>" + printer.name + "</td><td>" + printer.port
        + "</td><td>" + isWindowsDefault + "</td><td>" + op + "</td>";
    tr += "</tr>";
    return tr;
};

App.buildOrderTr = function (orderSku, orderCode) {
    var scanStatus = "未扫描";
    var tr = "<tr>";
    tr +=
        "<td>" + orderSku.storeSkuCode + "</td>" +
        "<td>" + orderSku.storeProductSkuName + "</td>" +
        "<td>" + orderCode + "</td>" +
        "<td>" + orderSku.quantity + "</td>" +
        "<td>" + scanStatus + "</td>";
    tr += "</tr>";
    return tr;
};

App.buildSkuBarcodeInfoTr = function (skuInfo) {
    var tr = "<tr>";
    tr +=
        '<td><img src="' + skuInfo.mainImageUrl + '" width="30px" height="30px"/></td>' +
        '<td>' + skuInfo.skuCode + '</td>' +
        '<td>' + skuInfo.productSkuName + '</td>' +
        '<td><input type="text" class="sku_p_num" onkeyup="this.value=this.value.replace(/\\D/g, \'\')"/></td>' +
        '<td><input type="button" class="pt_barcode" value="打印"/></td>';
    tr += "</tr>";
    return tr;
};

App.buildSkuBarcodeInfoTr2 = function (skuInfo) {
    var tr = "<tr>";
    tr +=
        '<td><img src="' + skuInfo.productImage + '" width="30px" height="30px"/></td>' +
        '<td>' + skuInfo.skuCode + '</td>' +
        '<td>' + skuInfo.productSkuName + '</td>' +
        '<td><input type="text" class="sku_p_num" value="' + skuInfo.purchaseNum +
        '" onkeyup="this.value=this.value.replace(/\\D/g, \'\')"/></td>' +
        '<td><input type="button" class="pt_barcode" value="打印"/></td>';
    tr += "</tr>";
    return tr;
};

App.buildBoothSkus = function (skuInfo) {
    var tr = "<tr>";
    tr +=
        '<td><img src="' + skuInfo.mainImageUrl + '" width="30px" height="30px"/></td>' +
        '<td>' + skuInfo.skuCode + '</td>' +
        '<td>' + skuInfo.productSkuName + '</td>' +
        '<td>' + skuInfo.price.toFixed(2) + '</td>' +
        '<td><input type="text" class="tv_sale_num" value="' + skuInfo.saleNums +
        '" onkeyup="this.value=this.value.replace(/\\D/g, \'\');App.countBoothPrice(this);"/></td>' +
        '<td>' + (skuInfo.price * skuInfo.saleNums).toFixed(2) + '</td>' +
        '<td><input type="button" class="btn_booth_sku_remove" value="移除"/></td>';
    tr += "</tr>";
    return tr;
};

App.buildBoothOrderHistory = function (order) {
    var tr = "<tr>";
    tr +=
        '<td>' + order.orderCode + '</td>' +
        '<td>' + order.orderDateStr + '</td>' +
        '<td>' + order.orderAmount + '</td>' +
        '<td><input type="button" class="btn_booth_order_sku_view" value="查看明细"/>' +
        '<input type="button" class="btn_booth_order_del" value="作废"/></td>';
    tr += "</tr>";
    return tr;
};

App.cpNum = function (pnum) {
    jQuery('.sku_p_num').each(function (i, v) {
        jQuery(v).val(pnum);
    });
};

App.countBoothPrice = function (el) {
    var price = $(el).parent().prev().text();
    var skuPrices = el.value * price;
    $(el).parent().next().text(skuPrices.toFixed(2));
};

App.buildOrderInput = function (orderCode, waybillUrl) {
    var str = "";
    str += '<input type="hidden" name="orderCode" value="' + orderCode + '"></input>';
    str += '<input type="hidden" name="waybillUrl" value="' + waybillUrl + '"></input>';
    return str;
};

App.resetPrinter = function (device_name) {
    ibox.setDefaultPrinter(device_name);
    smoke.alert("设置成功！", function (e) {
        App.showPrinterDrivers();
    }, {
        ok: "确认"
    });
};


App.deletePrinter = function (device_no) {
    PrinterManager.delete_printer(device_no);
    App.showMessage("删除成功");
};

App.doLogin = function (name, pwd) {
    ibox.doLogin(function (data) {
        var resp = JSON.parse(data + '')
        if (resp.success) {
            if (resp.single) {
                jQuery('.form_panel.log_main,.back_drop').hide();
                jQuery('.u_name').html(resp.user);
                $("#scanKey")[0].focus();
            } else {
                jQuery('.form_panel.log_main').hide();
                jQuery('.form_panel.log_org').show();
                jQuery.each(resp.body, function (index, orgJson) {
                    jQuery("#org_sel").append('<option value="' + orgJson.organizationId + '">' + orgJson.name + '</option>');
                });
            }
        } else {
            $('.form_error.lg_err_main').html(resp.msg);
        }
    }, name, pwd);
};

App.doLoginOrg = function (name, pwd, org) {
    ibox.doLoginOrg(function (data) {
        var resp = JSON.parse(data + '')
        if (resp.success) {
            jQuery('.form_panel.log_org,.back_drop').hide();
            jQuery('.u_name').html(resp.user);
            $("#scanKey")[0].focus();
        } else {
            $('.form_error.lg_err_org').html(resp.msg);
        }
    }, name, pwd, org);
};

App.loadPlugin = function () {
    jQuery(".close_btn").click(function () {
        jQuery('.form_panel,.back_drop').hide();
    });
    jQuery(".action_login").click(function () {
        var user_name = $("#user_name").val();
        var user_pwd = $('#user_pwd').val();
        if (user_name == '' || user_pwd == '') {
            $('.form_error.lg_err_main').html('*用户名或者密码不能为空！');
        } else {
            $('.form_error.lg_err_main').html('');
            ibox.showMessageSignalTimeDialog("正在登陆……", 1000);
            App.doLogin(user_name, user_pwd);
        }
    });
    jQuery(".action_login_org").click(function () {
        var user_name = $("#user_name").val();
        var user_pwd = $('#user_pwd').val();
        var user_org = $('#org_sel').val();
        if (user_name == '' || user_pwd == '' || user_org == '') {
            $('.form_error.lg_err_org').html('*用户名、密码或组织不能为空！');
        } else {
            $('.form_error.lg_err_org').html('');
            ibox.showMessageSignalTimeDialog("正在登陆……", 1000);
            App.doLoginOrg(user_name, user_pwd, user_org);
        }
    });
    /*模拟下拉框*/
    jQuery('.mo_text').click(function (e) {
        $(this).next("ul").toggle();
        e.stopPropagation();

    });
    jQuery('.mo_select ul a').click(function () {
        var val = $(this).text();
        $('.mo_select ul').prev(".mo_text").text(val);
        $('.mo_select ul').hide();
        return false;
    });
    jQuery('.ipt').focus(function () {
        var val = $.trim(this.value);
        if (val == this.defaultValue) {
            this.value = '';
            this.style.color = '#666';
        }
    }).blur(function () {
        var val = $.trim(this.value);
        if (val == "") {
            this.value = this.defaultValue;
            this.style.color = "#9d9d9d"
        }
    });
    jQuery('#user_name')[0].focus();
};

App.loadOncePlugin = function () {
    jQuery(".circle_bg").click(function () {
        jQuery(".circle_bg").each(function (index, item) {
            jQuery(this).removeClass("curr");
        });
        jQuery(this).addClass("curr");
        var content_id = jQuery(this).attr("id");
        jQuery(".my_content").each(function (index, item) {
            jQuery(item).hide();
        });
        jQuery("#_" + content_id).show();
        if (content_id == 'my') {
            jQuery('.tab_myqrcode').trigger('click');
        }
        if (content_id == 'scanner') {
            jQuery('.tab_scanner').trigger('click');
        }
        if (content_id == 'shipping') {
            jQuery('.tab_shipping').trigger('click');
        }
    });
    jQuery("#scanner").trigger("click");
    jQuery(document).click(function () {
        jQuery('.mo_select ul').hide();
    });
    jQuery(".sys_logout").click(function () {
        Rpc.logout();
        window.location.reload();
    })
};

App.showContentById = function (menuId, tabClass) {
    if (menuId != '') {
        $('#' + menuId).trigger('click');
    }
    if (tabClass != '') {
        $('.' + tabClass).trigger('click');
    }
};

App.showTcp = function () {
    jQuery("#printer_option_net").show();
    jQuery("#printer_option_com").hide();
};

App.showCom = function () {
    jQuery("#printer_option_com").show();
    jQuery("#printer_option_net").hide();
};

App.showPrinterDrivers = function () {
    ibox.getPrinterDrivers(function (data) {
        var pt_list = App.asJson(data);

        if (pt_list != null) {
            jQuery("#printer_list_table_body").empty();
            jQuery.each(pt_list, function (index, printer) {
                var tr = App.buildPrinterTr(printer);
                jQuery("#printer_list_table_body").append(tr);
            });
        }
    });
};

App.showMac = function () {
    jQuery("#sysinfo_security_code").html(ibox.boxmac);
};

App.isLogin = function () {
    ibox.getLoginTemplate(function (data) {
        $("#ajax").html(data);
        App.loadPlugin();
    });
};

App.showPrintResult = function (isSuc, msg) {
    if (isSuc) {
        var statusElement = $('#id_' + msg.tid).next();
        statusElement.attr('alt', msg.info);
        statusElement.attr('title', msg.info);
        var imgElement = statusElement.children();
        imgElement.attr('src', 'images/bage_ok.png');
        imgElement.attr('alt', msg.info);
        imgElement.attr('title', msg.info);
    } else {
        var statusElement = $('#id_' + msg.tid).next();
        statusElement.attr('alt', msg.info);
        statusElement.attr('title', msg.info);
        var imgElement = statusElement.children();
        imgElement.attr('src', 'images/bage_warning.png');
        imgElement.attr('alt', msg.info);
        imgElement.attr('title', msg.info);
    }
};

App.register = function () {
    var nick_name = $("#nick_name").val();
    var phone_no = $("#phone").val();
    var company_name = $("#company").val();
    var client_address = $("#addr").val();
    var email = $("#email").val();
    ibox.register(function (data) {
        var result = App.asJson(data);
        var result_msg = result.result_msg;
        ibox.showMessageAlertDialog(result_msg);
    }, nick_name, phone_no, company_name, client_address, email);
};

App.pageSize = 9;
App.pageIndex = 1;
App.pageCount = 0;

App.deliveryStatus = 1;
App.deliveryPageSize = 8;
App.deliveryPpageIndex = 2;
App.deliveryPageCount = 0;

App.distributionStatus = 0;
App.distributionPageSize = 8;
App.distributionPageIndex = 2;
App.distributionPageCount = 0;

App.tabClickEvent = function () {
    $('.myInfo').live('click', function () {
        /*if (!App.isShowLogin()) {
         ibox.getUserInfo(function (data) {
         var userInfo = App.asJson(data);
         $('#nick_name').val(userInfo.nike_name);
         $('#phone').val(userInfo.phone_no);
         $('#company').val(userInfo.company_name);
         $('#addr').val(userInfo.client_address);
         $('#email').val(userInfo.email);
         });
         }*/
    });

    $('.tab_scanner').live('click', function () {
        $("#scanKey")[0].focus();
    });

    $('.tab_print_tracking').live('click', function () {
        $("#trackingNo")[0].focus();
    });

    $('.tab_shipping').live('click', function () {
        $("#scanKeyTracking")[0].focus();
    });
};

App.buttonClickEvent = function () {
    $('.do_upgrade').live('click', function () {
        App.showContentById('sysinfo', 'tab_chg');
    });

    $('#printTrackingNo').live('click', function () {
        var trackingNo = $('#trackingNo').val();
        App.getTrackingInfo(trackingNo);
        $('#trackingNo')[0].focus();
    });

    $('#cleanTrackingNo').live('click', function () {
        $('#trackingNo').val('');
        $('#trackingNo')[0].focus();
    });

    $('#trackingNo').bind('keypress', function (event) {
        if (event.keyCode == "13") {
            var trackingNo = $('#trackingNo').val();
            App.getTrackingInfo(trackingNo);
            $('#trackingNo')[0].focus();
        }
    });

    $('#searchSkuInfo').live('click', function () {
        $('#skuInfo')[0].focus();
        jQuery("#sku_list_table_body").empty();
        var skuInfo = $('#skuInfo').val();
        var searchType = $('input:radio[name=barcodeSearchType]:checked').val();
        if (searchType == 'sku') {
            App.showSkuInfo(skuInfo);
        } else if (searchType == 'purchase') {
            App.showSkuInfoByPu(skuInfo);
        }
        $('#skuInfo')[0].focus();
    });

    $('#clearSkuInfo').live('click', function () {
        $('#skuInfo').val('');
        $('#skuInfo')[0].focus();
    });

    $('.pt_barcode').live('click', function () {
        var skuCode = $(this).parent().prev().prev().prev().text();
        var skuName = $(this).parent().prev().prev().text();
        var printNum = $(this).parent().prev().children().val();
        var barWidth = $('#barcodeWidth').val();
        var barHeight = $('#barcodeHeight').val();
        ibox.doPrintSkuBarcode(skuCode, skuName, printNum, barWidth, barHeight);
    });

    $('#pt_all_barcode').live('click', function () {
        var barWidth = $('#barcodeWidth').val();
        var barHeight = $('#barcodeHeight').val();
        jQuery('.sku_p_num').each(function (i, v) {
            var printNum = jQuery(v).val();
            if (printNum != '') {
                var skuCode = jQuery(v).parent().prev().prev().text();
                var skuName = jQuery(v).parent().prev().text();
                ibox.showMessageSignalTimeDialog("正在生成：" + skuCode + "，" + printNum + "张……", 2000);
                ibox.doPrintSkuBarcode(skuCode, skuName, printNum, barWidth, barHeight);
            }
        });
    });

    $("input[name='barcodeSearchType']").live('click', function () {
        var searchType = $('input:radio[name=barcodeSearchType]:checked').val();
        if (searchType == 'sku') {
            $('.bcsearchText').html("(提示：请输入SKU编码或者SKU名。)");
        } else if (searchType == 'purchase') {
            $('.bcsearchText').html("(提示：请输入采购单编码或者快递单编码。)");
        }
        $('#skuInfo').val('');
        $('#skuInfo')[0].focus();
    });

    $("input[name='deliveryType']").live('click', function () {
        $('#scanKey').val('');
        $('#scanKey')[0].focus();
    });

    $('#boothClear').live('click', function () {
        jQuery("#booth_sku_list_table_body").empty();
    });

    $('.btn_booth_sku_remove').live('click', function () {
        $(this).parent().parent().remove();
    });

    $('#boothOrderSearch').live('click', function () {
        var boothOrderCode = $('#boothOrderCode').val();
        App.showBoothOrders(boothOrderCode);
    });

    $('.btn_booth_order_sku_view').live('click', function () {
        var orderCode = $(this).parent().prev().prev().prev().text();
        ibox.showMessageSignalTimeDialog("正在查询……", 2000);
        App.showBoothOrderSku(orderCode);
    });

    $('.btn_booth_order_del').live('click', function () {
        var orderCode = $(this).parent().prev().prev().prev().text();
        smoke.confirm("确认删除订单：" + orderCode + "？", function (e) {
            if (e) {
                // todo: ok
                ibox.showMessageSignalTimeDialog("正在删除……", 2000);
                App.delBoothOrder(orderCode);
            } else {
                // todo: cancel
            }
        }, {
            ok: "确认",
            cancel: "取消",
            reverseButtons: true
        });
    });

    /*$('#pt_all_barcode').live('click', function () {
     var barWidth = $('#barcodeWidth').val();
     var barHeight = $('#barcodeHeight').val();
     jQuery('.sku_p_num').each(function (i, v) {
     var printNum = jQuery(v).val();
     if (printNum != '') {
     var skuCode = jQuery(v).parent().prev().prev().text();
     var skuName = jQuery(v).parent().prev().text();
     ibox.showMessageSignalTimeDialog("正在生成：" + skuCode + "，" + printNum + "张……", 2000);
     ibox.doPrintSkuBarcode(skuCode, skuName, printNum, barWidth, barHeight);
     }
     });
     });*/

    $('#boothPrint').live('click', function () {
        if ($('#booth_sku_list_table_body').find('tr').length > 0) {
            $('.val_order_amount').text('');
            $('#skus_info').val('');
            $('#b_pay_cash').val('');
            $('#b_pay_alipay').val('');
            $('#b_pay_wechat').val('');

            var skus = [];
            var totalPrice = Number(0.00);
            var totalNums = Number(0);
            $('.tv_sale_num').each(function (i, v) {
                // 商品图片
                var skuImg = $(v).parent().prev().prev().prev().prev().children()[0].src;
                // 商品编码
                var skuCode = $(v).parent().prev().prev().prev().text();
                // 商品名称
                var skuName = $(v).parent().prev().prev().text();
                // 单价
                var price = $(v).parent().prev().text();
                // 售卖数量
                var saleNum = $(v).val();
                // 总价
                var sumPrice = Number($(v).parent().next().text());
                totalPrice += sumPrice;
                totalNums += Number(saleNum);
                var sku = {
                    'skuImg': skuImg,
                    'skuCode': skuCode,
                    'productSkuName': skuName,
                    'price': price,
                    'saleNum': saleNum,
                    'sumPrice': sumPrice
                };
                skus.push(sku);
            });
            jQuery('.form_panel.booth_pay,.back_drop').show();
            $('.val_order_amount').text(totalPrice.toFixed(2));
            $('.val_order_nums').text(totalNums);
            $('#skus_info').val(JSON.stringify(skus));
            $('#b_pay_cash').val(totalPrice.toFixed(2));
        } else {
            ibox.showMessageSignalDialog("订单商品列表不能为空！");
        }
    });

    $('.action_booth_print').live('click', function () {
        var skus_info = $('#skus_info').val();
        var totalAmount = Number($('.val_order_amount').text());
        var cashAmount = Number($('#b_pay_cash').val());
        var alipayAmount = Number($('#b_pay_alipay').val());
        var wechatAmount = Number($('#b_pay_wechat').val());
        var tempAmount = cashAmount + alipayAmount + wechatAmount;
        if (totalAmount != tempAmount.toFixed(2)) {
            $('.form_error.booth_pay_err_main').html("支付价格需要与订单总价一致！");
        } else {
            var boothPayInfo = {
                'cash': cashAmount,
                'alipay': alipayAmount,
                'wechat': wechatAmount
            };
            jQuery('.form_panel.booth_pay,.back_drop').hide();
            ibox.showMessageSignalTimeDialog("正在打印……", 3000);
            ibox.printBooth(skus_info, JSON.stringify(boothPayInfo));
        }
    });
};


App.styleInit = function () {
    $(".tab").Tab();
    $(".tab2").Tab({menu: ".menu", tabContent: ".tabCt"});
    // 扫描框获取焦点
    $("#scanKey")[0].focus();
};

App.isShowLogin = function () {
    var showFlag = false;
    if (!ibox.loginFlag) {
        App.isLogin();
        showFlag = true;
    }
    return showFlag;
};

/**
 * 扫描枪事件
 */
App.scannerEvent = function () {
    $('#scanKey').bind('keypress', function (event) {
        var result = $('#scanKey').val();
        if (event.keyCode == "13") {
            $('#scanText').html(result);
            // 清空扫描框
            $('#scanKey').val('');
            // todo 如果扫描内容是订单编码打头则是多品
            if (/^O/.test(result)) {
                $("#orderCode").val(result);
                // 查询结果
                App.showMultipleOrderInfo(result);
            } else {
                var orderCode = $("#orderCode").val();
                if (orderCode != "") {
                    // 正在扫多品订单里的商品，找到sku标记OK
                    App.findSkuCode(result);
                } else {
                    // 扫的是单品订单，显示出来并且直接打印面单
                    App.showSingleOrderInfo(result);
                }
            }
        }
    });
};

/**
 * 扫描枪出库发货事件
 */
App.scannerShippingEvent = function () {
    $('#scanKeyTracking').bind('keypress', function (event) {
        var result = $('#scanKeyTracking').val();
        if (event.keyCode == "13") {
            $('#trackingText').html(result);
            // 清空扫描框
            $('#scanKeyTracking').val('');
            App.doTrackingShipping(result);
        }
    })
};

/**
 * 获取单品订单产品信息
 */
App.showSingleOrderInfo = function (skuCode) {
    var deliveryType = $('input:radio[name=deliveryType]:checked').val();
    if (deliveryType == 'normal') {
        jQuery('.form_panel.searching_dlg,.back_drop').show();
        ibox.getSingleOrderInfo(function (data) {
            jQuery('.form_panel.searching_dlg,.back_drop').hide();
            var orders = App.asJson(data);
            if (orders != null && orders.coOrderSkus != null && orders.coOrderSkus.length > 0) {
                jQuery("#product_list_table_body").empty();
                jQuery.each(orders.coOrderSkus, function (index, orderSku) {
                    var tr = App.buildOrderTr(orderSku, orders.orderCode);
                    jQuery("#product_list_table_body").append(tr);
                });
                var ip = App.buildOrderInput(orders.orderCode, orders.waybillUrl);
                jQuery("#product_list_table_body").append(ip);
                var waybillUrl = orders.waybillUrl;
                ibox.printWaybill(waybillUrl, orders.orderCode);
                ibox.showMessageSignalTimeDialog("正在打印……", 2000);
                // jQuery("#product_list_table_body").empty();
            } else {
                ibox.showMessageSignalTimeDialog("未获取到面单信息！", 2000);
            }
        }, skuCode);
    } else if (deliveryType == 'quick') {
        ibox.getSingleOrderInfoQuick(function (data) {
            var orders = App.asJson(data);
            if (orders != null && orders.coOrderSkus != null && orders.coOrderSkus.length > 0) {
                jQuery("#product_list_table_body").empty();
                jQuery.each(orders.coOrderSkus, function (index, orderSku) {
                    var tr = App.buildOrderTr(orderSku, orders.orderCode);
                    jQuery("#product_list_table_body").append(tr);
                });
                var ip = App.buildOrderInput(orders.orderCode, orders.waybillUrl);
                jQuery("#product_list_table_body").append(ip);
                var waybillUrl = orders.waybillUrl;
                ibox.printWaybill(waybillUrl, orders.orderCode);
                ibox.showMessageSignalTimeDialog("正在打印……", 2000);
                // jQuery("#product_list_table_body").empty();
            } else {
                ibox.showMessageSignalTimeDialog("未获取到面单信息！", 2000);
            }
        }, skuCode);
    }
};

/**
 * 通过面单号获取面单信息
 */
App.getTrackingInfo = function (trackingNo) {
    if (!/^[A-Za-z0-9]+$/.test(trackingNo)) {
        ibox.showMessageSignalTimeDialog("请填写合法面单！", 2000);
    } else {
        var trackingNoType = $('input:radio[name=trackingNoType]:checked').val();
        if (trackingNoType == 'wish') {
            ibox.getTrackingInfo(function (data) {
                var resp = App.asJson(data);
                if (resp != null) {
                    if (resp.success) {
                        var waybillUrl = resp.body.waybillUrl;
                        console.info(waybillUrl);
                        ibox.printWaybill(waybillUrl, '');
                        ibox.showMessageSignalTimeDialog("正在打印……", 2000);
                    } else {
                        ibox.showMessageSignalTimeDialog(resp.msg, 2000);
                    }
                }
            }, trackingNo);
        } else if (trackingNoType == 'taobao') {
            ibox.printWaybillByPurchase(trackingNo);
        }
    }
};

/**
 * 调用wish发货接口
 * @param trackingCode
 */
App.doTrackingShipping = function (trackingCode) {
    ibox.doTrackingShipping(function (data) {
        var result = data + '';
        if (result != null) {
            ibox.showMessageSignalTimeDialog(result, 2000);
        }
    }, trackingCode);
};

/**
 * 获取多品订单产品信息
 */
App.showMultipleOrderInfo = function (orderCode) {
    ibox.getMultipleOrderInfo(function (data) {
        var orders = App.asJson(data);
        if (orders != null && orders.coOrderSkus != null && orders.coOrderSkus.length > 0) {
            jQuery("#product_list_table_body").empty();
            jQuery.each(orders.coOrderSkus, function (index, orderSku) {
                var tr = App.buildOrderTr(orderSku, orders.orderCode);
                jQuery("#product_list_table_body").append(tr);
            });
            var ip = App.buildOrderInput(orders.orderCode, orders.waybillUrl);
            jQuery("#product_list_table_body").append(ip);
        } else {
            ibox.showMessageSignalTimeDialog("未获取到面单信息！", 2000);
        }
    }, orderCode);
};

/**
 * 通过输入的sku名或者编码模糊查询sku信息
 * @param skuInfo
 */
App.showSkuInfo = function (skuInfo) {
    if (skuInfo.replace(/(^\s*)|(\s*$)/g, "").length == 0) {
        ibox.showMessageSignalTimeDialog("输入不能为空！", 2000);
    } else {
        ibox.getSkuInfo(function (data) {
            var resp = App.asJson(data);
            if (resp != null && resp.success && resp.body.length > 0) {
                jQuery("#sku_list_table_body").empty();
                jQuery.each(resp.body, function (index, sku) {
                    var tr = App.buildSkuBarcodeInfoTr(sku);
                    jQuery("#sku_list_table_body").append(tr);
                });
            } else {
                ibox.showMessageSignalTimeDialog("未获取到SKU信息！", 2000);
            }
        }, skuInfo);
    }
};

App.showBoothOrders = function (orderCode) {
    ibox.getBoothOrderHistory(function (data) {
        var resp = App.asJson(data);
        if (resp != null && resp.success && resp.body.length > 0) {
            jQuery("#booth_order_list_table_body").empty();
            jQuery.each(resp.body, function (index, order) {
                var tr = App.buildBoothOrderHistory(order);
                jQuery("#booth_order_list_table_body").append(tr);
            });
        } else {
            ibox.showMessageSignalTimeDialog("未获取到订单信息！", 2000);
        }
    }, orderCode);
};

App.showBoothOrderSku = function (orderCode) {
    ibox.getBoothOrderSku(function (data) {
        var resp = App.asJson(data);
        var msg = "";
        if (resp != null && resp.success && resp.body.length > 0) {
            jQuery.each(resp.body, function (index, sku) {
                console.info(sku.storeProductSkuName);
                msg += sku.storeProductSkuName + '，' + sku.quantity + '个，单价：' + sku.price + '元\n';
            });
            ibox.showMessageAlertDialog(msg);
        }
    }, orderCode);
};

App.delBoothOrder = function (orderCode) {
    ibox.delBoothOrder(function (data) {
        var resp = App.asJson(data);
        if (resp != null && resp.success) {
            ibox.showMessageSignalTimeDialog("删除成功！", 2000);
            $('#booth_order_list_table_body').find('tr').each(function () {
                var tdArr = $(this).children();
                var tdOrderCode = tdArr.eq(0).text();
                if (tdOrderCode == orderCode) {
                    tdArr.remove();
                }
            });
        }
    }, orderCode);
};

/**
 * 通过输入的采购单编码或者快递单编码获取sku信息
 * @param skuInfo
 */
App.showSkuInfoByPu = function (skuInfo) {
    if (skuInfo.replace(/(^\s*)|(\s*$)/g, "").length == 0) {
        ibox.showMessageSignalTimeDialog("输入不能为空！", 2000);
    } else {
        ibox.getSkuInfoByPucode(function (data) {
            var resp = App.asJson(data);
            if (resp != null && resp.success && resp.body.length > 0) {
                jQuery("#sku_list_table_body").empty();
                jQuery.each(resp.body, function (index, sku) {
                    var tr = App.buildSkuBarcodeInfoTr2(sku);
                    jQuery("#sku_list_table_body").append(tr);
                });
            } else {
                ibox.showMessageSignalTimeDialog("未获取到SKU信息！", 2000);
            }
        }, skuInfo);
    }
};

App.findSkuCode = function (scanCode) {
    var isAllReady = true;
    $("#product_list_table_body").find("tr").each(function () {
        var tdVal = $(this).children();
        var skuCode = tdVal.eq(0).text();
        var scanStatus = tdVal.eq(4).text();
        if (scanCode == skuCode) {
            scanStatus = "OK";
            tdVal.eq(4).text(scanStatus);
        }
        if (scanStatus != "OK") {
            isAllReady = false;
        }
    });
    if (isAllReady) {
        var orderCode = "";
        var waybillUrl = "";
        $("#product_list_table_body").find("input").each(function () {
            var ipName = $(this).attr("name");
            if (ipName == "orderCode") {
                orderCode = $(this).val();
            } else if (ipName == "waybillUrl") {
                waybillUrl = $(this).val();
            }
        });
        if (orderCode != '' && waybillUrl != '') {
            ibox.printWaybill(waybillUrl, orderCode);
            ibox.showMessageSignalTimeDialog("正在打印……", 2000);
            jQuery("#product_list_table_body").empty();
            $("#orderCode").val('');
        } else {
            ibox.showMessageSignalTimeDialog("获取打印信息失败！", 2000);
        }
    }
};

/**
 * 显示档口商品
 * @param data
 */
ibox.showBoothSku = function (data) {
    var skuInfo = App.asJson(data);
    if (skuInfo != null) {
        var flag = true;
        $('.tv_sale_num').each(function (i, v) {
            // 商品图片
            var skuImg = $(v).parent().prev().prev().prev().prev().children()[0].src;
            // 商品编码
            var skuCode = $(v).parent().prev().prev().prev().text();
            // 商品名称
            var skuName = $(v).parent().prev().prev().text();
            // 单价
            var price = $(v).parent().prev().text();
            // 售卖数量
            var saleNum = Number($(v).val());
            // 总价
            var sumPrice = Number($(v).parent().next().text());
            if (skuCode == skuInfo.skuCode && price == skuInfo.price) {
                saleNum += skuInfo.saleNums;
                sumPrice = (skuInfo.price * saleNum).toFixed(2);
                $(v).val(saleNum);
                $(v).parent().next().text(sumPrice);
                flag = false;
            }
        });
        if (flag) {
            var tr = App.buildBoothSkus(skuInfo);
            jQuery("#booth_sku_list_table_body").append(tr);
        }
    } else {
        ibox.showMessageSignalTimeDialog("未获取到商品信息！", 2000);
    }
};

ibox.showMessageAlertDialog = function (msg) {
    smoke.alert(msg, function (e) {
    }, {
        ok: "确认"
    });
};

ibox.showMessageSignalDialog = function (msg) {
    smoke.signal(msg, function (e) {
    }, {
        duration: 3000
    });
};

ibox.clearBoothInfo = function () {
    jQuery("#booth_sku_list_table_body").empty();
};

ibox.showMessageSignalTimeDialog = function (msg, millisecond) {
    smoke.signal(msg, function (e) {
    }, {
        duration: millisecond
    });
};

ibox.showMessagePromptDialog = function (msg) {
    smoke.prompt(msg, function (e) {
        if (e) {
            // todo: ok
        } else {
            // todo: cancel
        }
    }, {
        ok: "确认",
        cancel: "取消",
        reverseButtons: true,
        value: "Empty"
    });
};

ibox.showMessageConfirmDialog = function (msg) {
    smoke.confirm(msg, function (e) {
        if (e) {
            // todo: ok
        } else {
            // todo: cancel
        }
    }, {
        ok: "确认",
        cancel: "取消",
        reverseButtons: true
    });
};

ibox.getPrintResult = function (data) {
    var pcode = data.pcode;
    var wtime = data.wtime;
    var tid = data.tid;
    if (pcode == 1000) {
        smoke.signal("正在打印，请稍后……", function (e) {
            App.showPrintResult(true, {'tid': tid, 'info': '打印成功'});
        }, {
            duration: wtime * 1000
        });
    } else {
        var info = "打印失败！打印机异常错误码：" + pcode;
        smoke.signal(info, function (e) {
            App.showPrintResult(false, {'tid': tid, 'info': info});
        }, {
            duration: 2000
        });
    }
}

$(function () {

    App.styleInit();

    App.loadOncePlugin();

    App.showMac();

    App.showPrinterDrivers();

    $("#os_ver").html("版本：" + ibox.osVersion);

    App.buttonClickEvent();


    App.tabClickEvent();

    App.scannerEvent();
    App.scannerShippingEvent();

    App.isShowLogin();
});
