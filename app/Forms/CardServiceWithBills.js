/**
 * 
 * @author User
 */
define('CardServiceWithBills', ['orm', 'forms', 'ui', 'NewService'], function (Orm, Forms, Ui, NewService, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

        self.show = function () {
            form.show();
        };

        self.showModal = function (callback) {
            form.showModal(callback);
        };        
        
        self.setParams = function (aListOfTypes, serviceId) {
            form.title = "Управление услугой: ";
            var newService = new NewService(form);
            newService.show(form.pnlServiseCard);
            newService.setParamsOpen(aListOfTypes, serviceId);
        };
    }
    return module_constructor;
});
