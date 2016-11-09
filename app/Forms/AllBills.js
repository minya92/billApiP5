/**
 * 
 * @author User
 */
define('AllBills', ['orm',  'FormLoader', 'rpc'], function (Orm, FormLoader, Rpc, ModuleName) {
    function module_constructor(ParentSelf) {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = FormLoader(ModuleName, model, self);

        var BillFunc = new Rpc.Proxy('BillApiFunctions');
        var AccountsList;
        var ServiceId;

        self.showModal = function (callback) {
            form.showModal(callback);
        };

        self.SetParams = function (serviceId) {
            Request();
            ServiceId = serviceId;
        };

        //Запрос списка всех аккаунтов
        function Request() {
            BillFunc.request("accounts/get_accounts", {}, function (success_get) {
                console.log(success_get);
                if (success_get.accounts.length != 0)
                    FillGrid(success_get.accounts);
            }, function (error_get) {
                console.log(error_get);
                md.alert("Ошибка получения списка всех аккаунтов!");
            });
        }

        //заполнение данных грида
        function FillGrid(Data) {
            AccountsList = Data;
            form.mgBills.data = Data;
            form.mgBills.colID.field = 'bill_accounts_id';
        }

        //Поиск
        form.mffSearch.onValueChange = form.mffSearch.onKeyReleased = function () {
            var filterKey = form.mffSearch.text;
            var filtered = AccountsList.filter(function (aItems) {
                return (aItems.bill_accounts_id + "").toLowerCase().indexOf(filterKey.toLowerCase()) !== -1;
            });
            form.mgBills.data = filtered;
        };

        //Кнопка выбрать
        form.btnChoose.onActionPerformed = function () {
            if (form.mgBills.selected.length != 0) {
                form.close(true);
                BillFunc.request("services/add", {service_id: ServiceId, account_id: form.mgBills.selected[0].bill_accounts_id}, function (success_add) {
                    console.log(success_add);
                    ParentSelf.request();
                }, function (error_add) {
                    console.log(error_add);
                    if (error_add.error == "Not enough money") {
                        md.alert("Недостаточно средств!");
                        ParentSelf.request();
                    } else
                        md.alert("Ошибка подключения услуги к аккаунту!");
                });
            } else
                md.alert("Не выбран ни один счет!");
        };
        
        form.btnCancel.onActionPerformed = function () {
            form.close();
        };

        form.mgBills.onMouseClicked = function (e) {
            if (e.clickCount == 2) {
                form.btnChoose.onActionPerformed();
            }
        };
    }
    return module_constructor;
});