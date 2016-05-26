/**
 * 
 * @author User
 */
define('Services', ['orm', 'forms', 'ui', 'NewService', 'CardServiceWithBills'], 
function (Orm, Forms, Ui, NewService, CardServiceWithBills, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

        var FormNewService = new NewService;
        var FormCardServiceWithBills = new CardServiceWithBills;

        self.show = function () {
            form.show();
        };

        form.btnNewService.onActionPerformed = function () {
//            FormNewService.setParams(res.account_id);
            FormNewService.showModal();
        };

        form.btnSettings.onActionPerformed = function () {
//            FormCardServiceWithBills.setParams(res.account_id);
            FormCardServiceWithBills.showModal();
        };

    }
    return module_constructor;
});
