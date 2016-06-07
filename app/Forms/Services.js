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
                var Delete = null;
                var ListOfTypes;
                var ServisesList;

                self.show = function () {
                    form.show();
                };

                self.setParams = function () {
                    form.lbWating.visible = true;
                    form.mgServises.visible = false;
                    BillFunc.request("services/get_types", {}, function (success_getTypes) {
                        console.log(success_getTypes);
                        ListOfTypes = success_getTypes;
                        Request();
                    }, function (error_getTypes) {
                        console.log(error_getTypes);
                        if (form.lbWating.visible == true) {
                            form.mgServises.visible = true;
                            form.lbWating.visible = false;
                        }
                        md.alert("Ошибка получения типов!");
                    });
                };

                //Запрос данных грида
                function Request() {
                    BillFunc.request("services/get", {deleted: Delete ? Delete : null}, function (success_get) {
                        console.log(success_get);
                        ServisesList = success_get.services;

                        if (form.lbWating.visible == true) {
                            form.mgServises.visible = true;
                            form.lbWating.visible = false;
                        }

                        form.mgServises.data = success_get.services;
                        form.mgServises.colName.field = 'service_name';
                        form.mgServises.colChekPrepay.field = 'prepayment';
                        form.mgServises.colCost.field = 'service_cost';

                        for (var i = 0; i < success_get.services.length; i++) {
                            success_get.services[i].active = !success_get.services[i].deleted;

                            for (var k = 0; k < ListOfTypes.length; k++) {
                                if (ListOfTypes[k].bill_services_types_id == success_get.services[i].service_type_id) {
                                    success_get.services[i].service_type = ListOfTypes[k].type_name;
                                    break;
                                }
                            }
                        }
                        form.mgServises.colType.field = 'service_type';
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

                self.Request = Request;

                //Обновить грид
                form.btnRefresh.onActionPerformed = function () {
                    Request();
                };

                //Поиск
                form.mffSearch.onValueChange = form.mffSearch.onKeyReleased = function () {
                    var filterKey = form.mffSearch.text;
                    var filtered = ServisesList.filter(function (aItems) {
                        return aItems.service_name.toLowerCase().indexOf(filterKey.toLowerCase()) !== -1;
                    });
                    form.mgServises.data = filtered;
                };

                //Активировать/Деактивировать услугу
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

                //Дезактивация услуги и удаление со счетов
                form.btnDel.onActionPerformed = function () {
                    if (!form.mgServises.selected[0])
                        md.alert("Выберите услугу!");
                    else {
                        if (form.mgServises.selected[0].active == true) {
                            md.confirm("Вы уверены что хотите сделать услугу неактивной и отписать её от всех счетов? Действие необратимо!"
                                    , function (res) {
                                        if (res) {
                                            form.mgServises.selected[0].active = false;
                                            DeleteRequest(true);
                                        }
                                    });
                        } else {
                            md.confirm("Услуга не активна! Отписать её от всех счетов? Действие необратимо!"
                                    , function (res) {
                                        if (res) {
                                            BillFunc.request("services/enable", {service_id: form.mgServises.selected[0].service_id}, function (success_enabled) {
                                                console.log(success_enabled);
                                                DeleteRequest(true);
                                            }, function (error_enabled) {
                                                console.log(error_enabled);
                                                md.alert("Ошибка изменения активности услуги!");
                                                form.mgServises.selected[0].active = !form.mgServises.selected[0].active;
                                            });
                                        }
                                    });
                        }

                    }
                };

                //Фильтр активных услуг
                form.cbActive.onValueChange = function () {
                    if (form.cbActive.selected == true) {
                        Delete = null;
                    } else {
                        Delete = true;
                    }
                    Request();
                };

//                //Нажатие галки в столбце активна - не работает
//                form.mgServises.onItemSelected = function (e) {
//                    window.e = e;
//                    console.log(e);
//                    if (e.item.deleted == e.item.active)
//                        if (e.item.active)
//                            EnableRequest;
//                        else
//                            DeleteRequest;
//                };

//                //Запрос списка типов
//                GetListOfTypes = function () {
//                    BillFunc.request("services/get_types", {}, function (success_getTypes) {
//                        console.log(success_getTypes);
////                    Request();
//                    }, function (error_getTypes) {
//                        console.log(error_getTypes);
//                        md.alert("Ошибка получения типов!");
//                    });
//                };

                //Запрос на удаление (Деактивацию)
                function DeleteRequest(aUnsubscribe) {
                    BillFunc.request("services/delete", {service_id: form.mgServises.selected[0].service_id,
                        unsubscribe: aUnsubscribe ? !!aUnsubscribe : null}, function (success_del) {
                        console.log(success_del);
                        Request();
                    }, function (error_del) {
                        console.log(error_del);
                        md.alert("Ошибка удаления услуги!");
                        form.mgServises.selected[0].active = !form.mgServises.selected[0].active;
                    });
                }

                //Запрос на Активацию
                function EnableRequest() {
                    BillFunc.request("services/enable", {service_id: form.mgServises.selected[0].service_id}, function (success_enabled) {
                        console.log(success_enabled);
                        Request();
                    }, function (error_enabled) {
                        console.log(error_enabled);
                        md.alert("Ошибка изменения активности услуги!");
                        form.mgServises.selected[0].active = !form.mgServises.selected[0].active;
                    });
                }

                //Создание услуги
                form.btnNewService.onActionPerformed = function () {
                    var FormNewService = new NewService();
                    FormNewService.setParamsNew(ListOfTypes);
                    FormNewService.showModal(function (res) {
                        if (res)
                            Request();
                    });
                };

                //Настройка услуги
                form.btnSettings.onActionPerformed = function () {
                    var FormCardServiceWithBills = new CardServiceWithBills(self);
                    if (form.mgServises.selected.length == 0)
                        md.alert("Выберите услугу!");
                    else
                    if (form.mgServises.selected[0].deleted)
                        md.alert("Услуга неактивна!");
                    else {
                        FormCardServiceWithBills.setParams(ListOfTypes, form.mgServises.selected[0].service_id);
                        FormCardServiceWithBills.showModal(function (res) {
                            if (res)
                                Request();
                        });
                    }
                };

                form.mgServises.onMouseClicked = function (e) {
                    if (e.clickCount == 2) {
                        form.btnSettings.onActionPerformed();
                    }
                };
            }
            return module_constructor;
        });
