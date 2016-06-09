/**
 * 
 * @author User
 */
define('CardServiceWithBills', ['orm', 'forms', 'ui', 'NewService', 'AllBills', 'rpc'],
        function (Orm, Forms, Ui, NewService, AllBills, Rpc, ModuleName) {
            function module_constructor(ServicesSelf) {
                var self = this
                        , model = Orm.loadModel(ModuleName)
                        , form = Forms.loadForm(ModuleName, model);

                var BillFunc = new Rpc.Proxy('BillApiFunctions');
                var ServiceId;
                var AccountsList;

                self.show = function () {
                    form.show();
                };

                self.showModal = function (callback) {
                    form.showModal(callback);
                };

                //Подстраиваем вид грида под тип услуги
                self.ChangeVisibleColums = function (period, counter) {
                    if (period)
                        form.mgBillsOnService.colDate.visible = true;
                    if (counter)
                        form.mgBillsOnService.colCount.visible = true;
                };

                self.setParams = function (aListOfTypes, serviceId) {
                    form.title = "Управление услугой: ";
                    var newService = new NewService(self, form, ServicesSelf);
                    newService.setParamsOpen(aListOfTypes, serviceId);
                    newService.show(form.pnlServiseCard);
                    Request(serviceId);
                    ServiceId = serviceId;
                };
                
                self.request = Request;

                //Запрос списка аккаунтов
                function Request(serviceId) {
                    BillFunc.request("accounts/on_service", {service_id: serviceId}, function (success_on_service) {
                        console.log(success_on_service);
                        if (success_on_service.result.length != 0)
                            FillGrid(success_on_service.result);
                    }, function (error_on_service) {
                        console.log(error_on_service);
                        md.alert("Ошибка получения списка аккаунтов!");
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
                    var FormAllBills = new AllBills();
                    FormAllBills.SetParams(ServiceId);
                    FormAllBills.showModal(function (res) {
                        if (res)
                            Request(ServiceId);
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

                //Приостановить услугу на аккаунте
                form.btnPause.onActionPerformed = function () {
                    var item = form.mgBillsOnService.selected[0];
                    if (!item)
                        md.alert("Выберите аккаунт!");
                    else
                        BillFunc.request("services/pause", {service_account_id: item.bill_services_accounts_id}, function (res_pause) {
                            console.log(res_pause);
                            Request(ServiceId);
                        }, function (pause_error) {
                            console.log(pause_error);
                            md.alert("Ошибка! Услуга на аккаунте " + item.account_id + " не была приостановлена!");
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
                                md.alert("Действие пока не активно");
//                                BillFunc.request("services/disable", {service_account_id: item.bill_services_accounts_id}, function (res_disable) {
//                                    console.log(res_disable);
//                                    Request(ServiceId);
//                                }, function (disable_error) {
//                                    console.log(disable_error);
//                                    md.alert("Ошибка удаления услуги со счёта " +item.account_id+"!");
//                                });
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

                form.onWindowClosing = function (evt) {
                    //form.close(true);
                };
            }
            return module_constructor;
        });
