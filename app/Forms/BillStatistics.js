/**
 * 
 * @author User
 */
define('BillStatistics', ['orm', 'forms', 'ui', 'rpc'], function (Orm, Forms, Ui, Rpc, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

        var BillFunc = new Rpc.Proxy('BillApiFunctions');
        var billId;

        self.show = function (aPanel) {
            var cont = aPanel ? (typeof (aPanel) === 'object' ? aPanel
                    : document.getElementById(aPanel))
                    : self.container;
            if (cont) {
                if (cont.add)
                    cont.add(form.view, {left: 0, top: 0, right: 0, bottom: 0});
                else
                    form.view.showOn(cont);
                if (form.onWindowOpened)
                    form.onWindowOpened();
            } else
                form.show();
        };

        self.setParams = function (aBillId) {
            if (aBillId) {
                billId = aBillId;
                Request();
            }
        };

//        form.mcChoose.onValueChange = function () {
//            if (form.mcChoose.value == null)
//                form.btnExecute.enabled = false;
//            else if (form.tfSum.text != '')
//                form.btnExecute.enabled = true;
//        };

        function Request() {
            BillFunc.request("operations/get_types_statuses", null, function (succ_getTS) {
                console.log(succ_getTS);
                form.mсStatus.displayList = succ_getTS.statuses;
                form.mсStatus.displayField = 'status_name';
                form.mcType.displayList = succ_getTS.types;
                form.mcType.displayField = 'type_name';

                BillFunc.request("operations/get", {id: billId}, function (success_get) {
                    console.log(success_get);
                    
                    if (success_get.error != null && success_get.result == null){                        
                        md.alert("Список операций пуст!"); 
                        return;
                    }      
                    
//                    for (var i = 0; i < success_get.result.length; i++) {
//                        var typeName = succ_getTS.types.find(function (el) {
//                            if (el.bill_operations_type_id == this.type)
//                                return true;
//                        }, {type: success_get.result[i].operation_type}).type_name;
//                        success_get.result[i].operation_type = typeName;
//
//                        var statusName = succ_getTS.statuses.find(function (el) {
//                            if (el.bill_operations_status_id == this.status)
//                                return true;
//                        }, {status: success_get.result[i].operation_status}).status_name;
//                        success_get.result[i].operation_status = statusName;
//                    }

                    for (var i = 0; i < success_get.result.length; i++) {
                        for (var k = 0; k < succ_getTS.types.length; k++) {
                            if (succ_getTS.types[k].bill_operations_type_id == success_get.result[i].operation_type) {
                                success_get.result[i].operation_type = succ_getTS.types[k].type_name;
                                break;
                            }
                        }
                        for (var m = 0; m < succ_getTS.statuses.length; m++) {
                            if (succ_getTS.statuses[m].bill_operations_status_id == success_get.result[i].operation_status) {
                                success_get.result[i].operation_status = succ_getTS.statuses[m].status_name;
                                break;
                            }
                        }
                    }

                    form.mgOperations.data = success_get.result;
                    form.mgOperations.operation_sum.field = 'operation_sum';
                    form.mgOperations.operation_type.field = 'operation_type';
                    form.mgOperations.operation_status.field = 'operation_status';
                    form.mgOperations.operation_date.field = 'operation_date';

                }, function (get_error) {
                    console.log(get_error);
                    md.alert("Ошибка получения списка всех операций по счёту!");
                });
            }, function (getTS_error) {
                console.log(getTS_error);
                md.alert("Ошибка получения списка типов и статусов!");
            });
        }
    }
    return module_constructor;
});
