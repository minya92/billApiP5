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

                self.show = function () {
                    form.show();
                };

                self.setParams = function () {
                    Request();
                };

//                function RequeryAnimate(aGrid, aQuery) {
//                    var parent = aGrid.parent;
//                    var lbLoad = new P.Label('null');
//                    P.Icon.load('icons/loading5.gif', function (data) {
//                        lbLoad.icon = data;
//                        lbLoad.text = null;
//
//                        var w = Math.round(parent.width / 2 - 100);
//                        var h = Math.round(parent.height / 2 - 100);
//                        parent.add(lbLoad, new P.Anchors(w, 200, w, h, 200, h));
//
//                        aGrid.visible = false;
//
//                        aQuery.requery(function () {
//                            aGrid.visible = true;
//                            parent.remove(lbLoad);
//                        });
//                    });
//                }

                function Request() {
//                    RequeryAnimate(form.mgServises, aQuery)



                    BillFunc.request("services/get", {}, function (success_get) {
                        console.log(success_get);

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
                        md.alert("Ошибка получения списка услуг");
                    });
                }

                form.btnNewService.onActionPerformed = function () {
//            FormNewService.setParams(res.account_id);
                    FormNewService.showModal();
                };

                form.btnSettings.onActionPerformed = function () {
//            FormCardServiceWithBills.setParams(res.account_id);
                    FormCardServiceWithBills.showModal();
                };

                form.btnActive.onActionPerformed = function () {
//                    console.log(form.mgServises.selected[0] ? form.mgServises.selected[0].active : "Выберите услугу!");

//                    if (form.mgServises.selected[0].active == true)
//                        form.mgServises.selected[0].active = false;

////                    del.qItemTypesList.remove(form.modelGrid.selected[0] ? form.modelGrid.selected : [model.qItemTypesList.cursor]);
////                    request("POST", "services/delete", {service_id: serviceId}, function(res){
                };

            }
            return module_constructor;
        });
