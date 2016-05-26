/**
 * 
 * @author User
 */
define('Services', ['orm', 'forms', 'ui', 'NewService'], function (Orm, Forms, Ui, NewService, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

        var FormNewService = new NewService;

        self.show = function () {
            form.show();
        };

        form.btnNewService.onActionPerformed = function () {
//            FormNewService.setParams(res.account_id);
            FormNewService.showModal();
        };

    }
    return module_constructor;
});
