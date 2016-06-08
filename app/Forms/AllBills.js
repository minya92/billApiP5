/**
 * 
 * @author User
 */
define('AllBills', ['orm', 'forms', 'ui'], function (Orm, Forms, Ui, ModuleName) {
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
    }
    return module_constructor;
});