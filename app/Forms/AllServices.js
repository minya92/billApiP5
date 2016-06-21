/**
 * 
 * @author User
 */
define('AllServices', ['orm', 'forms', 'ui', 'rpc'], function (Orm, Forms, Ui, Rpc, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

        var BillFunc = new Rpc.Proxy('BillApiFunctions');
        var ServicesList;

        self.show = function () {
            form.show();
        };

        self.showModal = function (callback) {
            form.showModal(callback);
        };

        self.setParams = function () {
            Request();
        };

        //Запрос списка услуг
        function Request() {
            BillFunc.request("services/get", {}, function (success_get) {
                console.log(success_get);
                if (success_get.services.length != 0)
                    FillGrid(success_get.services);
            }, function (error_get) {
                console.log(error_get);
                md.alert("Ошибка получения списка услуг!");
            });
        }

        //заполнение данных грида
        function FillGrid(Data) {
            ServicesList = Data;
            form.mgServises.data = Data;
            form.mgServises.colName.field = 'service_name';
            form.mgServises.colCost.field = 'service_cost';
            form.mgServises.colType.field = 'service_type_id';
            //form.mgServises.colPeriod.field = 'bill_accounts_id';
            form.mgServises.colCount.field = 'cost_counts';
            form.mgServises.colPrepaymemt.field = 'prepayment';
            form.mgServises.colOnce.field = 'once';
        }

        //Поиск
        form.mffSearch.onValueChange = form.mffSearch.onKeyReleased = function () {
            var filterKey = form.mffSearch.text;
            var filtered = ServicesList.filter(function (aItems) {
                return (aItems.service_name + "").toLowerCase().indexOf(filterKey.toLowerCase()) !== -1;
            });
            form.mgServises.data = filtered;
        };
    }
    return module_constructor;
});
