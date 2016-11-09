/**
 * 
 * @author User
 */
define('BillStatistics', ['orm', 'FormLoader', 'rpc'], function (Orm, FormLoader, Rpc, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = FormLoader(ModuleName, model, self);

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
            form.mgOperations.data = null;
        };

        var flagStatus = true, flagType = true;

        self.setParams = function (aBillId) {
            if (aBillId) {
                billId = aBillId;
                flagStatus = false;
                form.mсStatus.value = null;
                flagType = false;
                form.mcType.value = null;
                Request();
            }
        };

        var succ_getTS;

        function Request() {
            flagType = flagStatus = true;
            
            if (!form.mсStatus.displayList)
                BillFunc.request("operations/get_types_statuses", null, function (aSucc_getTS) {
                    console.log(aSucc_getTS);
                    succ_getTS = aSucc_getTS;

                    form.mсStatus.displayList = aSucc_getTS.statuses;
                    form.mсStatus.displayField = 'status_name';
                    form.mcType.displayList = aSucc_getTS.types;
                    form.mcType.displayField = 'type_name';

                    form.mcType.onValueChange();

                }, function (getTS_error) {
                    console.log(getTS_error);
                    md.alert("Ошибка получения списка типов и статусов!");
                });
            else
                form.mcType.onValueChange();
        }

        //после пополнения списания эта штука выполняется 3 раза
        form.mсStatus.onValueChange = function () {
            if (flagStatus)
                form.mcType.onValueChange();
            else
                flagStatus = true;
        };

        //после пополнения списания эта штука выполняется 2 раза
        form.mcType.onValueChange = function () {
            if (flagType)
                BillFunc.request("operations/get", {id: billId, type: (form.mcType.value ? form.mcType.value.bill_operations_type_id : null),
                    status: (form.mсStatus.value ? form.mсStatus.value.short_name : null)}, function (success_get) {

                    console.log(success_get);
                    if (success_get.result.length == 0) {
                        form.mgOperations.data = null;
                        return;
                    }

                    for (var i = 0; i < success_get.result.length; i++) {
                        for (var k = 0; k < succ_getTS.types.length; k++) {
                            if (succ_getTS.types[k].bill_operations_type_id == success_get.result[i].operation_type) {
                                success_get.result[i].operation_type2 = succ_getTS.types[k].type_name;
                                break;
                            }
                        }
                        for (var m = 0; m < succ_getTS.statuses.length; m++) {
                            if (succ_getTS.statuses[m].bill_operations_status_id == success_get.result[i].operation_status) {
                                success_get.result[i].operation_status2 = succ_getTS.statuses[m].status_name;
                                break;
                            }
                        }
                    }
                    form.mgOperations.data = success_get.result;
                    form.mgOperations.operation_sum.field = 'operation_sum';
                    form.mgOperations.operation_type.field = 'operation_type2';
                    form.mgOperations.operation_status.field = 'operation_status2';
                    form.mgOperations.operation_date.field = 'operation_date';

                }, function (get_error) {
                    console.log(get_error);
                    form.mgOperations.data = null;
                    md.alert("Ошибка получения списка операций по счёту!");
                });
            else
                flagType = true;
        };
    }
    return module_constructor;
});


//                    if (success_get.error != null || success_get.result == null) {
//                        md.alert("Список операций пуст!");
//                        return;
//                    }

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