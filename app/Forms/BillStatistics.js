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

        self.setParams = function () {
        };

        BillFunc.request("operations/get_types_statuses", null, function (success_get) {
            console.log(success_get);
            form.mсStatus.displayList = success_get.statuses;
            form.mсStatus.displayField = 'status_name';
            form.mcType.displayList = success_get.types;
            form.mcType.displayField = 'type_name';
        }, function (get_error) {
            console.log(get_error);
            md.alert("Ошибка получения списка типов и статусов!");
        });
    }
    return module_constructor;
});
