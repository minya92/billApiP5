/**
 * 
 * @author User
 */
define('ServisesOnBill', ['orm', 'FormLoader', 'rpc', 'ServiceInfo', 'AllServices'], function (Orm, FormLoader, Rpc, ServiceInfo, AllServices, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = FormLoader(ModuleName, model, self);

        var BillFunc = new Rpc.Proxy('BillApiFunctions');
        var AccountId, ServisesList;

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

        self.setParams = function (accountId) {
            AccountId = accountId;
            Request();
        };

        self.request = Request;
        //Запрос данных грида
        function Request() {
            if (form.lbWating.visible) {
                form.mgServisesOnBill.visible = true;
                form.lbWating.visible = false;
            }
            BillFunc.request("services/on_account", {account_id: AccountId}, function (successOnAccount) {
                console.log(successOnAccount);
                FillGrid(successOnAccount.result);
            }, function (errorOnAccount) {
                console.log(errorOnAccount);
                md.alert("Ошибка получения списка услуг");
            });
        }

        //заполнение данных грида
        function FillGrid(Data) {
            ServisesList = Data;
            form.mgServisesOnBill.data = Data;
            form.mgServisesOnBill.colService_name.field = 'service_name';
            form.mgServisesOnBill.colStartDate.field = 'service_start_date';
            form.mgServisesOnBill.colCount.field = 'service_counts';
            form.mgServisesOnBill.colDate.field = 'operation_date';
            form.mgServisesOnBill.colPause.field = 'paused';
        }

        //Добавить услугу
        form.btnAddService.onActionPerformed = function () {
            var formAddService = new AllServices(self.request);
            formAddService.setParams(AccountId);
            formAddService.showModal(function (res) {
                if (res) {
                    form.mgServisesOnBill.visible = false;
                    form.lbWating.visible = true;
                }
            });
        };

        //Удалить услугу
        form.btnDel.onActionPerformed = function () {
            var item = form.mgServisesOnBill.selected[0];
            if (!item)
                md.alert("Выберите услугу!");
            else
                md.confirm("Вы уверены что хотите отключить услугу " + item.service_name + " со счёта?", function (res) {
                    if (res) {
                        BillFunc.request("services/disable", {service_account_id: item.bill_services_accounts_id}, function (res_disable) {
                            console.log(res_disable);
                            md.alert("Удаление успешно!");
                            Request();
                        }, function (disable_error) {
                            console.log(disable_error);
                            md.alert("Ошибка отключения услуги " + item.account_id + " со счёта!");
                        });
                    }
                });
        };

        //Окно информации об услуге
        form.btnInfo.onActionPerformed = function () {
            if (form.mgServisesOnBill.selected.length == 0)
                md.alert("Выберите услугу!");
            else {
                var formInfoService = new ServiceInfo();
                formInfoService.setParams(form.mgServisesOnBill.selected[0].service_id);
                formInfoService.showModal();
            }
        };

        //Поиск
        form.mffSearch.onValueChange = form.mffSearch.onKeyReleased = function () {
            var filterKey = form.mffSearch.text;
            var filtered = ServisesList.filter(function (aItems) {
                return aItems.service_name.toLowerCase().indexOf(filterKey.toLowerCase()) !== -1;
            });
            form.mgServisesOnBill.data = filtered;
        };

        //Обновить грид
        form.btnRefresh.onActionPerformed = function () {
            Request();
        };

        form.mgServisesOnBill.onMouseClicked = function (e) {
            if (e.clickCount == 2) {
                form.btnInfo.onActionPerformed();
            }
        };
    }
    return module_constructor;
});
