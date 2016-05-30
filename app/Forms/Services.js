/**
 * 
 * @author User
 */
define('Services', ['orm', 'forms', 'ui', 'NewService', 'CardServiceWithBills', 'rpc'],
        function (Orm, Forms, Ui, NewService, CardServiceWithBills, Rpc, ModuleName) {
            function module_constructor() {
                var self = this
                        , model = Orm.loadModel(ModuleName)
                        , form = Forms.loadForm(ModuleName, model);

                var BillFunc = new Rpc.Proxy('BillApiFunctions');
                var FormNewService = new NewService;
                var FormCardServiceWithBills = new CardServiceWithBills;
                var Delete = null;

                self.show = function () {
                    form.show();
                };

                self.setParams = function () {
                    Request();
                };

                function Request() {
                    BillFunc.request("services/get", {deleted: Delete ? Delete : null}, function (success_get) {
                        console.log(success_get);

                        if (form.lbWating.visible == true) {
                            form.mgServises.visible = true;
                            form.lbWating.visible = false;
                        }

                        form.mgServises.data = success_get.services;
                        form.mgServises.colName.field = 'service_name';
                        form.mgServises.colType.field = 'service_type_id';
                        form.mgServises.colChekPrepay.field = 'prepayment';
                        form.mgServises.colCost.field = 'service_cost';

                        for (var i = 0; i < success_get.services.length; i++) {
                            success_get.services[i].active = !success_get.services[i].deleted;

////                            for (var k = 0; k < succ_getType.types.length; k++) {
////                                if (succ_getType.types[k].bill_operations_type_id == success_get.services[i].service_type_id) {
////                                    success_get.services[i].service_type = succ_getType.types[k].type_name;
////                                    break;
////                                }
////                            }
                        }
                        form.mgServises.colActive.field = 'active';

                    }, function (get_error) {
                        console.log(get_error);
                        if (form.lbWating.visible == true) {
                            form.mgServises.visible = true;
                            form.lbWating.visible = false;
                        }
                        md.alert("Ошибка получения списка услуг");
                    });
                }

                form.btnActive.onActionPerformed = function () {
                    if (!form.mgServises.selected[0])
                        md.alert("Выберите услугу!");
                    else {
                        if (form.mgServises.selected[0].active == true) {
                            form.mgServises.selected[0].active = false;
                            DeleteRequest();

                        } else {
                            form.mgServises.selected[0].active = true;
                            EnableRequest();
                        }

                    }
                };

                form.cbActive.onValueChange = function () {
                    if (form.cbActive.selected == true) {
                        Delete = null;
                        Request();
                    } else {
                        Delete = true;
                        Request();
                    }
                };

                form.mgServises.onItemSelected = function (e) {
                    window.e = e;
                    console.log(e);
                    if (e.item.deleted == e.item.active)
                        if (e.item.active)
                            EnableRequest;
                        else
                            DeleteRequest;
                };

                DeleteRequest = function () {
                    BillFunc.request("services/delete", {service_id: form.mgServises.selected[0].service_id}, function (success_del) {
                        console.log(success_del);
                        Request();
                    }, function (error_del) {
                        console.log(error_del);
                        md.alert("Ошибка удаления услуги!");
                        form.mgServises.selected[0].active = !form.mgServises.selected[0].active;
                    });
                };

                EnableRequest = function () {
                    BillFunc.request("services/enable", {service_id: form.mgServises.selected[0].service_id}, function (success_enabled) {
                        console.log(success_enabled);
                        Request();
                    }, function (error_enabled) {
                        console.log(error_enabled);
                        md.alert("Ошибка изменения активности услуги!");
                        form.mgServises.selected[0].active = !form.mgServises.selected[0].active;
                    });
                };

                form.btnNewService.onActionPerformed = function () {
//            FormNewService.setParams(res.account_id);
                    FormNewService.showModal();
                };

                form.btnSettings.onActionPerformed = function () {
//            FormCardServiceWithBills.setParams(res.account_id);
                    FormCardServiceWithBills.showModal();
                };
            }
            return module_constructor;
        });
