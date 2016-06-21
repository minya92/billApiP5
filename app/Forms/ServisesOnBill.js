/**
 * 
 * @author User
 */
define('ServisesOnBill', ['orm', 'forms', 'ui', 'rpc', 'ServiceInfo', 'AllServices'], function (Orm, Forms, Ui, Rpc, ServiceInfo, AllServices, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

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

        //Запрос данных грида
        function Request() {
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
            var formAddService = new AllServices();
                formAddService.setParams();
                formAddService.showModal();
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
