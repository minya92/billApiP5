/**
 * 
 * @author User
 */
define('CardServiceWithBills', ['orm', 'FormLoader', 'NewService', 'AllBills', 'rpc', 'DiscountsOnService', 'ServiceContent'],
        function (Orm, FormLoader, NewService, AllBills, Rpc, DiscountsOnService, ServiceContent, ModuleName) {
            function module_constructor(ServicesSelf) {
                var self = this
                        , model = Orm.loadModel(ModuleName)
                        , form = FormLoader(ModuleName, model, self);

                var BillFunc = new Rpc.Proxy('BillApiFunctions');
                var ServiceId;
                var AccountsList;
                var discountsOnService = new DiscountsOnService();
                //var serviceContent = new ServiceContent();
                
                self.showModal = function (callback) {
                    form.showModal(callback);
                };

                //Подстраиваем вид грида под тип услуги
                self.ChangeVisibleColums = function (period, counter) {
                    form.mgBillsOnService.colDate.visible = period;
                    form.mgBillsOnService.colCount.visible = counter;
                };

                self.setParams = function (aListOfTypes, serviceId) {
                    form.title = "Управление услугой: ";
                    var newService = new NewService(self, form, ServicesSelf);
                    newService.setParamsOpen(aListOfTypes, serviceId);
                    newService.show(form.pnlServiseCard);
                    discountsOnService.setService(serviceId);
                    discountsOnService.show(form.pnlDiscounts);
                    //serviceContent.setService(serviceId);
                    //serviceContent.show(form.pnlContentServices);
                    ServiceId = serviceId;
                    Request();
                };

                form.btnRefresh.onActionPerformed = self.request = Request;

                //Запрос списка аккаунтов
                function Request() {
                    BillFunc.request("accounts/on_service", {service_id: ServiceId}, function (success_on_service) {
                        console.log(success_on_service);
                        if (success_on_service.result.length != 0)
                            FillGrid(success_on_service.result);
                        if (!form.mgBillsOnService.visible) {
                            form.mgBillsOnService.visible = true;
                            form.lbWating.visible = false;
                        }
                    }, function (error_on_service) {
                        console.log(error_on_service);
                        md.alert("Ошибка получения списка аккаунтов!");
                        if (!form.mgBillsOnService.visible) {
                            form.mgBillsOnService.visible = true;
                            form.lbWating.visible = false;
                        }
                    });
                }

                //заполнение данных грида
                function FillGrid(Data) {
                    AccountsList = Data;
                    form.mgBillsOnService.data = Data;
                    form.mgBillsOnService.colBillId.field = 'account_id';
                    form.mgBillsOnService.colPause.field = 'paused';
                    form.mgBillsOnService.colCount.field = 'service_counts';
                    form.mgBillsOnService.colDate.field = 'operation_date';
                }

                //Добавить услугу на аккаунт
                form.btnAddBill.onActionPerformed = function () {
                    var FormAllBills = new AllBills(self);
                    FormAllBills.SetParams(ServiceId);
                    FormAllBills.showModal(function (res) {
                        if (res) {
//                            Request();                    
                            form.mgBillsOnService.visible = false;
                            form.lbWating.visible = true;
                        }
                    });
                };

                //Кнопка получения остатка денег в рублях
                form.btnMoney.onActionPerformed = function () {
                    if (!form.mgBillsOnService.selected[0])
                        md.alert("Выберите аккаунт!");
                    else
                        BillFunc.request("accounts/get_sum", {id: form.mgBillsOnService.selected[0].account_id}, function (res_sum) {
                            console.log(res_sum);
                            md.alert("Остаток средств на счету: " + res_sum.sum + "руб.");
                        }, function (sum_error) {
                            console.log(sum_error);
                            md.alert("Ошибка получения суммы!");
                        });
                };

                //Приостановить/Возобновить услугу на аккаунте
                form.btnPause.onActionPerformed = function () {
                    var item = form.mgBillsOnService.selected[0];
                    if (!item)
                        md.alert("Выберите аккаунт!");
                    else
                    if (!form.mgBillsOnService.selected[0].paused)
                        BillFunc.request("services/pause", {service_account_id: item.bill_services_accounts_id}, function (res_pause) {
                            console.log(res_pause);
                            Request(ServiceId);
                        }, function (pause_error) {
                            console.log(pause_error);
                            md.alert("Ошибка! Услуга на аккаунте " + item.account_id + " не была приостановлена!");
                        });
                    else
                        BillFunc.request("services/resume", {service_account_id: item.bill_services_accounts_id}, function (res_resume) {
                            console.log(res_resume);
                            Request(ServiceId);
                        }, function (error_resume) {
                            console.log(error_resume);
                            md.alert("Ошибка! Услуга на аккаунте " + item.account_id + " не была возобновлена!");
                        });
                };

                //Отписать аккаунт от услуги
                form.btnDel.onActionPerformed = function () {
                    var item = form.mgBillsOnService.selected[0];
                    if (!item)
                        md.alert("Выберите аккаунт!");
                    else
                        md.confirm("Вы уверены что хотите удалить услугу со счёта " + item.account_id + "?", function (res) {
                            if (res) {
                                BillFunc.request("services/disable", {service_account_id: item.bill_services_accounts_id}, function (res_disable) {
                                    console.log(res_disable);
                                    md.alert("Удаление успешно!");
                                    Request();
                                }, function (disable_error) {
                                    console.log(disable_error);
                                    md.alert("Ошибка удаления услуги со счёта " + item.account_id + "!");
                                });
                            }
                        });
                };

                //Поиск
                form.mffSearch.onValueChange = form.mffSearch.onKeyReleased = function () {
                    var filterKey = form.mffSearch.text;
                    var filtered = AccountsList.filter(function (aItems) {
                        return (aItems.account_id + "").toLowerCase().indexOf(filterKey.toLowerCase()) !== -1;
                    });
                    form.mgBillsOnService.data = filtered;
                };

                form.mgBillsOnService.onMouseClicked = function (e) {
                    if (form.mgBillsOnService.selected[0])
                        if (!form.mgBillsOnService.selected[0].paused)
                            IconLoad("icons/Play.Pause/pause.png");
                        else
                            IconLoad("icons/Play.Pause/play.png");
                };

                function IconLoad(Path) {
                    Ui.Icon.load(Path, function (aIcon) {
                        form.btnPause.icon = aIcon;
                    }, function (onFailure) {
                        console.log("ERROR " + onFailure);
                    });
                }

                form.onWindowClosing = function (evt) {
                    //form.close(true);
                };
            }
            return module_constructor;
        });
