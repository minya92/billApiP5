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
        
        var newService = new NewService();
        newService.show(form.pnlServiseCard);
        
        self.setParams = function () {
            newService.SetParamsOpen();
        };
    }
    return module_constructor;
});
