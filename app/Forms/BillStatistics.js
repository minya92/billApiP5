/**
 * 
 * @author User
 */
define('BillStatistics', ['orm', 'forms', 'ui', 'rpc'], function (Orm, Forms, Ui, Rpc, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

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
        };

        self.setParams = function (aBillId) {
            if (aBillId) {
                billId = aBillId;
                Request();
            }
        };        

        function Request() {
            BillFunc.request("operations/get_types_statuses", null, function (succ_getTS) {
                console.log(succ_getTS);
                form.mсStatus.displayList = succ_getTS.statuses;
                form.mсStatus.displayField = 'status_name';
                form.mcType.displayList = succ_getTS.types;
                form.mcType.displayField = 'type_name';                
            }, function (getTS_error) {
                console.log(getTS_error);
                md.alert("Ошибка получения списка типов и статусов!");
            });

            BillFunc.request("operations/get", {id: billId}, function (success_get) {
                console.log(success_get);
                form.mgOperations.data = success_get.result;
                form.mgOperations.operation_sum.field = 'operation_sum';
                form.mgOperations.operation_type.field = 'operation_type';                
                form.mgOperations.operation_status.field = 'operation_status';                
                form.mgOperations.operation_date.field = 'operation_date';                
            }, function (get_error) {
                console.log(get_error);
                md.alert("Ошибка получения списка всех операций по счёту!");
            });
        }
    }
    return module_constructor;
});
