var uploader = null //uploader上传对象
var fileNum = 0; //已上传附件数 修改内容 测试qeder修改
var fileName = null
//测试1234
var reportClassInfo = {
    report_class: '',
    report_class_name: ''
}
var reportClassArr = [] //业务类型数据
var changeTableRowList = [] //暂存修改的数据用于接口传参
window.accSub = (function () {
    return {
        queryList: [], //账套类型选中数据
        elementDataAll: {}, //要素参数,参数值data值
        leftCode: "", //左表格编辑code
        importUrl: ctjUtil.getbaseUrlGfr() + '/importAccount/gfmisImportFile', // 文件导入excel表格
        accSelCode: 0,
        accSelName: '',
        param: '',
        keep_dr: null,
        accountSelData: []
    }
})();
window.jumpList = {}
// 表格数据
var accData = []
// 表格列头数据
var initColumns = []
var initColumnsList = [{
    field: "as_code",
    title: "统一编码",
    width: "10%",
    align: "left",
    halign: "center",
    editor: 'textbox',
    class: 'special',
},
{
    field: "as_name",
    title: "统一码名称",
    width: "15%",
    align: "left",
    halign: "center",
    editor: 'textbox',
},
{
    field: "control_a",
    title: "操作",
    align: "center",
    halign: "center",
    width: "10%",
    formatter: function (value, row, index) {
        var text = "";
        text =
            "<a href='javascript:void(0)' onclick=changeRow(" + index + ") style='text-decoration: none;color:#0079fe;margin-right:8px'>修改</a>" +
            "<a href='javascript:void(0)' onclick=deleteRow(" + index + ") style='text-decoration: none;color:#0079fe'>删除</a></div>";
        return text;
    }
}
]
var editIndex = null;
var editRow = {}; //点击表格当前行数据
var currentRowIndex = null; //当前点击的是哪一行
var changeFlag = null //增加:1,修改:2
$(function () {
    //表头初始化
    initColumns[0] = [].concat(initColumnsList)
    //获取会计制度
    getAccountSel()
    //获取业务类型
    getReportType()
    //加载表格
    initTableHead()
    // 导入
    upFile()
    //搜索
    $('#search').click(function () {
        initTable();
        endEditing()
        editIndex = null
        editRow = {}
        currentRowIndex = null
        changeFlag = null
        changeTableRowList = []
    });
    //增加
    $('#addRow').click(function () {
        if (changeTableRowList.length >= 1) {
            ctjUtil.infoAlert("请先保存修改数据", null, '增加失败');
            return
        }
        changeFlag = 1
        changeTableRowList = [] //清空修改数据
        if (accData.length == 0) {
            currentRowIndex = 0
        } else if (accData.length > 0 && currentRowIndex === null) {
            currentRowIndex = accData.length
        }
        insertRow()
    });

    //保存
    $('#saveRow').click(function () {
        if (changeFlag == 1) {
            save()
        } else if (changeFlag == 2) {
            changeSave()
        }
    });
    // 点击选择文件
    $('#upload-btn').click(function () {
        $("#uploadBox").find('input').click()
    })
    //取消
    $('.cancel').click(function () {
        $("#importData").window('close');
    })
    //导入
    $('#fr_daoru').on('click', function () {
        if (!reportClassInfo.report_class) {
            ctjUtil.infoAlert('请选择业务类型!', null, '导入失败');
            return false
        }
        $($("#ifrImport")[0].contentWindow.document.body).remove();
        if (parseInt(ctjUtil.IEVersion()) <= 9 && parseInt(ctjUtil.IEVersion()) != -1) { //IE9以下的IE浏览器弹框要高些
            $("#importData").window({
                title: "会计科目对应关系导入",
                height: 205,
                width: 440,
                closable: true,
                top: ($(window).height() - 210) * 0.5,
                left: ($(window).width() - 440) * 0.5
            })
        } else {
            $("#importData").window({
                title: "会计科目对应关系导入",
                height: 180,
                width: 440,
                closable: true,
                top: ($(window).height() - 185) * 0.5,
                left: ($(window).width() - 440) * 0.5
            })
        }
        $("#importData").window('open');
        var menuid = ctjUtil.getUrlArgVal("menuid");
        var toUrl = ctjUtil.getImportUrl(0, menuid, '0', reportClassInfo.report_class, '', '');
        $("#ifrImport").attr("src", toUrl);
    });

    //导出
    $('#tableExport').click(function () {
        var rows = $("#dg").datagrid('getData').rows;
        var rowsArr = [];
        for (var i = 0; i < rows.length; i++) {
            let row = rows[i];
            var index = $("#dg").datagrid("getRowIndex", row);
            rowsArr.push(index);
        }
        // 设置表格名称
        var excelName = accSub.accSelName + "对应关系";
        excel.expExcel(rowsArr, excelName);
    })

    $.extend($.fn.validatebox.defaults.rules, {
        chineseComma: {
            validator: function (value) {
                return !(/，/.test(value));
            },
            message: '请使用英文逗号。'
        }
    });

    // // 上传按钮确定点击
    // $('#sureImport').click(function() {
    //     // var val = $('#accountSel2').combobox('getValue')//报送主体类型：
    //     // if(val){
    //     // 	console.log(fileName)
    //     uploader.upload()
    //         // if(fileName){
    //         // } else {
    //         // 	ctjUtil.infoAlert('请选择导入文件！')
    //         // }
    //         // } else {
    //         // 	ctjUtil.infoAlert('请选择会计制度！')
    //         // }
    // })
})


// 修改
function changeRow(index) {
    if (changeTableRowList.length >= 1) {
        ctjUtil.infoAlert("请先保存修改数据", null, '修改失败');
        return
    }
    if (accData.findIndex(item => { return item.flag == true }) !== -1) {
        ctjUtil.infoAlert("请先保存新增数据", null, '修改失败');
        return
    }
    changeFlag = 2
    accData[index].flag = true;
    let value = Object.assign({}, accData[index])
    changeTableRowList.push({
        index: index,
        value: value
    })
}
// 删除
function deleteRow(index) {
    ctjUtil.delConfirm('确认要删除吗?', function () {
        if (accData[index].flag == true) {
            $('#dg').datagrid('cancelEdit', index)
                .datagrid('deleteRow', index);
            changeTableRowList = []
        } else {
            let list = []
            list.push(splicingParams(accData[index]))
            ctjUtil.sendRequestString(JSON.stringify(list), function (res) {
                if (res.status_code == '0000') {
                    if (res.reason && res.reason.includes('成功')) {
                        ctjUtil.success(res.reason);
                    } else {
                        ctjUtil.infoAlert(res.reason, null, '删除失败');
                    }
                    initTable()
                    changeTableRowList = []
                }
            }, ctjUtil.getbaseUrlGfr() + '/ReportItemRelation/deleteAsCompare')
        }
    });
}
//表格相关
function endEditing() {
    if (editIndex == undefined) {
        return true
    }
    if ($('#dg').datagrid('validateRow', editIndex)) {
        $('#dg').datagrid('endEdit', editIndex);
        editIndex = undefined;
        editRow = {}
        return true;
    } else {
        return false;
    }
}

// 修改
function onClickCell(index, field) {
    currentRowIndex = index;
    if (editIndex !== index) {
        if (endEditing()) {
            var rowData = $('#dg').datagrid('getRows')[index]
            editRow = JSON.parse(JSON.stringify(rowData))
            if (editRow.flag === false) return
            $('#dg').datagrid('selectRow', index)
                .datagrid('beginEdit', index);
            var ed = $('#dg').datagrid('getEditor', { index: index, field: field })
            if (!ed) {
                return
            }
            editIndex = index;
        }
    }
}
//增加
function insertRow() {
    currentRowIndex = Number(currentRowIndex) + 1
    if (endEditing()) {
        let rows = {
            flag: true
        }
        initColumns[0].forEach(item => {
            if (item.field !== "control_a") {
                rows[item.field] = ""
            }
        })
        $('#dg').datagrid('insertRow', {
            index: currentRowIndex, // index start with 0
            row: rows
        });
        editIndex = currentRowIndex;
        $('#dg').datagrid('selectRow', editIndex)
            .datagrid('beginEdit', editIndex)
        $('#dg').datagrid('scrollTo', editIndex - 1)
    }
}

// 表格数据
function initTable() {
    accSub.queryList = $('#accountSel').combotree('tree').tree('getChecked');
    accSub.param = $('#fuzzyQuery').textbox('getValue');
    accSub.currentPage = 1;
    let list = []
    accSub.queryList.forEach(item => {
        if (item.id !== "_main") {
            list.push({
                id: item.id,
                text: item.text
            })
        }
    })
    ctjUtil.sendRequestString(JSON.stringify(list), function (data) {
        if (data.status_code == '0000') {
            if (data.data) {
                accData = []
                let headerValue = []
                headerValue = [].concat(data.data)
                accData = filterData(data.data)
                accData.forEach((item, index) => {
                    //如果返回来的数据都是空,就不展示那一行,不是空,非修改状态下不能改
                    if (Object.values(item).some(k => { return k !== "" })) {
                        item.flag = false
                    } else {
                        accData.splice(index, 1)
                    }
                })
                splicingHeader(headerValue)
            } else {
                initTableHead()
            }
        }
    }, ctjUtil.getbaseUrlGfr() + '/ReportItemRelation/getAsCompare?report_class=' + reportClassInfo.report_class)
}
// 拼接表头
function splicingHeader(data) {
    let cloneInitColumns = []
    cloneInitColumns = [].concat(initColumnsList) //克隆数据
    let arr = []
    data.forEach(item => {
        Object.keys(item).forEach(val => {
            if (val !== "as_code" && val !== "as_name" && val !== "flag" && val !== "control_a") {
                arr.push(val)
            }
        })
    })
    let removalRepeatArr = [...new Set(arr)] //去重数据
    let paramList = []
    removalRepeatArr.forEach(item => {
        (accountSelList.data[0].children).forEach(val => {
            if (item === val.id) {
                paramList.push(val)
            }
        })
    })
    let headerList = []
    paramList.forEach(item => {
        let param = {}
        param = {
            align: "left",
            field: item.id,
            halign: "center",
            title: item.text,
            width: '15%',
            editor: {
                type: 'textbox',
                options: {
                    editable: true,
                    validType: 'chineseComma'
                }
            }
        }
        headerList.push(param)
    })
    cloneInitColumns.splice(2, 0, ...headerList)
    initColumns[0] = [].concat(cloneInitColumns)
    initTableHead()
}
// 加载表格
function initTableHead() {
    $("#dg").datagrid({
        width: "100%",
        height: "100%",
        data: accData,
        minHeight: ctjUtil.renderDatagridMinHeight(accData.length),
        remoteSort: false, //是否从服务器排序数据。
        pagination: false, //分页组件
        rownumbers: false, //行号
        singleSelect: true, //是否单选
        scrollbarSize: 0,
        striped: true,
        emptyMsg: ctjUtil.renderDatagridEmptyMsg('暂无数据'), //当表格没有数据时提示
        columns: initColumns,
        onClickCell: onClickCell, //点击单元格触发
    });
    // var table = document.getElementById("dg")
    let list = $($("#dg").prev()[0]).find('.datagrid-header td')
    let res = ''
    for (let i = 0; i < list.length; i++) {
        let item = list[i]
        $(item).attr("title", item.innerText);
    }
    document.querySelector('#my-custom-table').innerHTML = res
    goToRow()
}
//保存
function save() {
    endEditing()
    let paramsList = []
    try {
        accData.forEach(item => {
            if (item.flag == true) {
                if (requiredVerification(item)) {
                    throw new Error('请填写至少一项账套类型对应内容')
                }
                let template = splicingParams(item)
                paramsList.push(template)
                item.flag = false; //不能改
            }
        })
    } catch (e) {
        ctjUtil.infoAlert(e.message, null, '操作失败');
        return
    }
    if (paramsList.length > 0) {
        window.jumpList = JSON.parse(JSON.stringify(paramsList[paramsList.length - 1]))
    }
    ctjUtil.sendRequestString(JSON.stringify(paramsList), function (res) {
        if (res.status_code == '0000') {
            if (res.reason && res.reason.includes('成功')) {
                ctjUtil.success(res.reason);
            } else {
                ctjUtil.infoAlert(res.reason, null, '保存失败');
            }
            initTable()
            $('#dg').datagrid('acceptChanges');
            changeFlag = null
            editRow = {}
            editIndex = null
            currentRowIndex = null
            changeTableRowList = []
        }
    }, ctjUtil.getbaseUrlGfr() + '/ReportItemRelation/addAsCompare')
}
//修改保存
function changeSave() {
    $('#dg').datagrid('endEdit', changeTableRowList[0].index);
    let params = {}
    params.deleteList = []
    params.insertList = []
    try {
        if (requiredVerification(accData[changeTableRowList[0].index])) {
            throw new Error('请填写至少一项账套类型对应内容')
        }
    } catch (e) {
        ctjUtil.infoAlert(e.message, null, '操作失败');
        return
    }
    //这个是修改要删掉的数据
    params.deleteList.push(splicingParams(changeTableRowList[0].value))
    //这个是修改新增的数据
    params.insertList.push(splicingParams(accData[changeTableRowList[0].index]))
    if (changeTableRowList.length > 0) {
        window.jumpList = JSON.parse(JSON.stringify(accData[changeTableRowList[0].index]))
    }
    ctjUtil.sendRequestString(JSON.stringify(params), function (res) {
        if (res.status_code == '0000') {
            if (res.reason && res.reason.includes('成功')) {
                ctjUtil.success(res.reason);
            } else {
                ctjUtil.infoAlert(res.reason, null, '修改失败');
            }
            initTable()
            $('#dg').datagrid('acceptChanges');
            editRow = {}
            editIndex = null
            changeFlag = null
            currentRowIndex = null
            changeTableRowList = []
        }
    }, ctjUtil.getbaseUrlGfr() + '/ReportItemRelation/updateAsCompare')
}

//提醒
function requiredVerification(item) {
    let value = Object.assign({}, item)
    delete value["flag"]
    let judgeTextList = ["as_code", "as_name", "control_a"]
    if (Object.values(value).every(k => { return k == "" })) {
        return false
    }
    if (value["as_code"] == "" && value["as_name"] == "") {
        throw new Error('请填写统一编码,统一码名称')
    }
    if (value["as_code"].length > 30) {
        throw new Error('统一编码字符长度不超过30')
    }
    if (!(/^[0-9]+$/.test(value["as_code"]))) {
        throw new Error('统一编码需为数字')
    }
    if (value.as_code || value.as_name) {
        judgeTextList.forEach(val => {
            delete value[val]
        })
    }
    return Object.values(value).every(k => { return k == "" })
}
// 获取reportType 业务类型
function getReportType() {
    var url = ctjUtil.getbaseUrlGfr() + '/GfrMofDivAgency/getBusinessCodeAndName' // 获取业务类型接口
    ctjUtil.getRequest({
        year: ctjUtil.getSession().busiYear
    }, function (res) {
        var result = res.data
        result.forEach(function (item) {
            var obj = {
                value: item.report_class,
                text: item.report_class_name
            }
            reportClassArr.push(obj)
        })
        getParaValue()
    }, url);
}

// 业务类型
function Combobox(value) {
    //状态
    $("#reportClass").combobox({
        textField: 'text',
        valueField: 'value',
        prompt: '请选择',
        panelHeight: 300,
        data: reportClassArr,
        onLoadSuccess: function () {
            $('#reportClass').combobox('setValue', value);
        },
        onSelect: function (n) {
            reportClassInfo.report_class = n.value
            reportClassInfo.report_class_name = n.text
            // initHead()
        },
        onShowPanel: function () {
            var boxPanel = $(this).combobox('panel');
            boxPanel.parent().css({
                "min-width": "200px",
                "white-space": "nowrap",
                "width": "auto",
            });
            boxPanel.css({
                "width": "auto",
            });
        },
    })
}
// 账套类型
function getAccountSel() {
    $('#accountSel').combotree({
        editable: true, // 不能直接输入到列表框
        multiple: true, // 设置下拉框的值可以多选
        prompt: '请选择',
        data: accountSelList.data,
        panelWidth: 'auto',
        lines: true,
        onShowPanel: function () {
            var boxPanel = $(this).combotree("panel");
            boxPanel.parent().css({
                width: "auto",
                "max-width": "600px",
                "min-width": "200px",
                "white-space": "nowrap",
            });
            boxPanel.css({
                width: "auto",
            });
        },
    });
}
//修改后跳到最后选的那一行
function goToRow() {
    if (Object.keys(window.jumpList).length !== 0) {
        accData.forEach((item, index) => {
            if (item.as_code == window.jumpList.as_code) {
                $('#dg').datagrid('scrollTo', index)
                $('#dg').datagrid('selectRow', index)
                window.jumpList = {}
            }
        })
    }
}
//过滤查询条件
function filterData(data) {
    return data
        // .filter(item => item.as_code != null && item.as_name != null)
        .map((item, index) => Object.values(item).join() + `|||${index}`)
        .filter((item, index) => item.indexOf(accSub.param) !== -1)
        .map((item) => data[item.split("|||")[1]]);
}

//传参格式化
function splicingParams(item) {
    let template = {
        "report_class": reportClassInfo.report_class,
        "as_code": "",
        "as_name": "",
        "addList": []
    }
    for (let row = 0; row < Object.entries(item).length; row++) {
        let key = Object.entries(item)[row][0];
        let value = Object.entries(item)[row][1];
        let contentTemplate = {}
        let itemObject = {}
        switch (key) {
            case "as_code":
                template.as_code = value;
                contentTemplate = {}
                itemObject = {}
                break;
            case 'as_name':
                template.as_name = value;
                contentTemplate = {}
                itemObject = {}
                break;
            case 'flag':
                contentTemplate = {}
                itemObject = {}

                break
            case 'control_a':
                contentTemplate = {}
                itemObject = {}

                break
            default:
                contentTemplate = {
                    id: "",
                    text: "",
                    gov_acct_cls_code: ''
                }
                if (value == '') {
                    break;
                }
                itemObject = accountSelList.data[0].children.find(vals => {
                    return vals.id.toString() === key.toString()
                })
                if (!itemObject) break
                contentTemplate.gov_acct_cls_code = value
                contentTemplate.id = itemObject.id
                contentTemplate.text = itemObject.text
                template.addList.push(contentTemplate)
        }
    }
    return template
}
//获取菜单参数(业务类型能不能改)
function getParaValue() {
    var url = ctjUtil.getbaseUrlGfr() + '/gfrPublic/getParaValueMap';
    ctjUtil.sendRequest({}, function (res) {
        let data = ""
        res.data = ctjUtil.addUrlParams(res.data);
        if (res.data.report_class) {
            data = res.data.report_class
        } else {
            data = ""
        }
        if (data) {
            Combobox(data)
            $('#reportClass').combobox('disable');
        } else {
            $('.reportClassBox').css({ 'display': 'inline-block', 'margin-right': '20px' })
            Combobox(data)
            $('#reportClass').combobox('enable');
        }
    }, url);
}
// 判断
function initHead(accountSel) {
    var url = ctjUtil.getbaseUrlGfr() + '/gfrPublic/getBaseInfoEnabledTree';
    ctjUtil.sendRequest({
        eleShort: 'ExecutiveAcc'
    }, function (data) {
        accSub.accountSelData = data.data ? data.data : []

        var treeData2 = ctjUtil.converJson2(data.data)

        ctjUtil.combotreeInit(accountSel, treeData2, false, function (res) {
            accSub.accSelCode = res['CODE'];
            accSub.accSelName = res['NAME'];
            $('#fuzzyQuery').textbox('setValue', '');
            accSub.param = '';
        })
        $('#' + accountSel).combotree({
            prompt: '请选择'
        })
    }, url);

    //导入
    $("#fr_daoru").on("click", function () {
        accSub.keep_dr = 39;
        if (parseInt(ctjUtil.IEVersion()) <= 9 && parseInt(ctjUtil.IEVersion()) != -1) { //IE9以下的IE浏览器弹框要高些
            $("#importData").window({
                title: "会计科目对应关系模板导入",
                height: 180,
                width: 580,
                closable: true,
                top: ($(window).height() - 225) * 0.5,
                left: ($(window).width() - 440) * 0.5
            })
        } else {
            $("#importData").window({
                title: "会计科目对应关系模板导入",
                height: 180,
                width: 580,
                closable: true,
                top: ($(window).height() - 175) * 0.5,
                left: ($(window).width() - 440) * 0.5
            })
        }
        $("#importData").window("open");
        // 模板类型默认值
        $('#fbUpload').filebox({
            buttonText: '选择文件',
            buttonAlign: 'right',
            value: ''
        })
        $('#fbUpload').filebox('disable'); //禁用
        // initHead('accountSel2')
    });

}
// 导入
function upFile() {
    // 实例化
    uploader = WebUploader.create({
        pick: {
            id: '#uploadBox',
            // label: '选择文件'
        },
        auto: false,
        formData: {
            //设置传入服务器的参数变量
            //注意不要在此赋值
            // paramMap: ""
        },
        accept: {
            extensions: "xls,xlsx",
            mimeTypes: ".xls,.xlsx" //设置上传附件类型为常用类型
        },
        paste: 'document.body',
        swf: '../../../gfr/common/Uploader.swf',
        chunked: false,
        chunkSize: 512 * 1024,
        server: accSub.importUrl,
        // 禁掉全局的拖拽功能。这样不会出现图片拖进页面的时候，把图片打开。
        disableGlobalDnd: false,
        duplicate: true,
        fileNumLimit: 6,
        fileSizeLimit: 200 * 1024 * 1024, // 200 M
        // fileSingleSizeL: 50 * 1024 * 1024, // 50 M
        fileSingleSizeLimit: 50 * 1024 * 1024, // 50 M
        compress: false, //关闭压缩，默认自动压缩
    });
    var n = 0;
    uploader.on('uploadBeforeSend', function (obj, data, header) {
        ctjUtil.ajaxLoading();

        uploader.stop();

        var dataForm = {
            modelType: "1",
            currentModelId: "",
            reportClass: reportClassInfo.report_class

        }
        data.param = JSON.stringify(dataForm);

        var fileTotal = uploader.getFiles().length;
        let flag = true;

        n++;
    })
    uploader.on('filesQueued', function (file, response) {
        if (file.length > 1) {
            ctjUtil.infoAlert('一次最多只能上传1个文件!', null, '操作失败');
            uploader.reset();
        }
    });
    uploader.onFileQueued = function (file) {
        fileName = file.name
        $('#fbUpload').filebox({
            buttonText: '选择文件',
            buttonAlign: 'right',
            value: fileName
        });

    };
    uploader.onUploadSuccess = function (file, response) {
        fileNum++;
        if (response.status_code == "0000") {
            ctjUtil.success('导入成功！')
            $("#importData").window('close');
            initTable();
        } else {
            ctjUtil.infoAlert('导入失败！')
        }
    };
    uploader.onUploaderror = function (file) {
        ctjUtil.infoAlert('导入失败！')
        fileNum++;
    };
    uploader.on('uploadFinished', function (file, response) {
        ctjUtil.ajaxLoadEnd();
    });
}
//导入页面回调
function getImplData(importId) {

    ctjUtil.getTempSet(0, 0, importId); //这里传dwid  和modelType
}
//导入页面回调
function getVali(type, data) {
    if (type == 1) {
        ctjUtil.infoAlert('请选择要上传的文件!', null, '操作失败');
    } else if (type == 2) {
        ctjUtil.success(data.reason, function () {
            //刷新
            // getSuccess(accSub._flag);//换成查询接口
            initTable()

        });
    } else if (type == 3) {
        if (!ctjUtil.validateIsNull(data.reason)) {
            ctjUtil.infoAlert('导入失败!');
        } else {
            ctjUtil.infoAlert('导入失败,原因:' + data.reason);
        }
    }

}
//导入遮罩
function ajLoad() {
    ctjUtil.ajaxLoadingInput();
}
//导入去掉遮罩
function ajLoadEnd() {
    ctjUtil.ajaxLoadEndInput();
}
//导预览页面回调
function getPreviewData() {
    ctjUtil.getPreviewUrl(0); //这是传进预览页面的modelType
}
//设置panel宽高的操作
function setSize(target, maxH) {
    var panelH = target.combotree('panel')[0].children[0].clientHeight;
    if (maxH > panelH) {
        target.combotree('panel').height("auto");
    } else {
        target.combotree('panel').height(maxH);
    }
    //面板宽度自适应
    target.combotree('panel').width("auto");
}

// 账套类型数据
var accountSelList = {
    "status_code": "0000",
    "reason": null,
    "data": [{
        "id": "_main",
        "value": "_main",
        "text": "全部",
        children: [{
            "id": "1",
            "value": "1",
            "text": "《政府会计制度—行政事业政府会计科目和报表》",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "2",
            "value": "2",
            "text": "《政府会计制度—行政事业政府会计科目和报表》+国有林场苗圃补充规定",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "3",
            "value": "3",
            "text": "《政府会计制度—行政事业政府会计科目和报表》+高等学校补充规定",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "4",
            "value": "4",
            "text": "《政府会计制度—行政事业政府会计科目和报表》+中小学补充规定",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "5",
            "value": "5",
            "text": "《政府会计制度—行政事业政府会计科目和报表》+科学事业补充规定",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "6",
            "value": "6",
            "text": "《政府会计制度—行政事业政府会计科目和报表》+医院补充规定",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "7",
            "value": "7",
            "text": "《政府会计制度—行政事业政府会计科目和报表》+基层医疗卫生机构补充规定",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "8",
            "value": "8",
            "text": "《政府会计制度—行政事业政府会计科目和报表》+彩票机构补充规定",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "9",
            "value": "9",
            "text": "民间非营利组织单位会计制度",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "10",
            "value": "10",
            "text": "企业会计制度",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "11",
            "value": "11",
            "text": "企业会计准则",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "12",
            "value": "12",
            "text": "小企业会计准则",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "13",
            "value": "13",
            "text": "财政总预算会计制度",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "14",
            "value": "14",
            "text": "土地储备资金会计核算办法",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "15",
            "value": "15",
            "text": "国家物资储备资金会计制度",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "16",
            "value": "16",
            "text": "社会保险基金会计制度",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "17",
            "value": "17",
            "text": "社会保障基金财政专户会计核算办法",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "18",
            "value": "18",
            "text": "工会会计制度-县级以上工会",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "19",
            "value": "19",
            "text": "工会会计制度-基层工会",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "20",
            "value": "20",
            "text": "财政总会计制度（模拟版）",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "21",
            "value": "21",
            "text": "军工科研事业单位会计制度",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "60",
            "value": "60",
            "text": "财政资金预算指标核算",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },
        {
            "id": "61",
            "value": "61",
            "text": "单位资金预算指标核算",
            "start_date": null,
            "end_date": null,
            "enum_id": 0
        },

        ]
    },]
}