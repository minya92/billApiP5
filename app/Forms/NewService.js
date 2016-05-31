/**
 * 
 * @author User
 */
define('NewService', ['orm', 'forms', 'ui'], function (Orm, Forms, Ui, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

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

        self.showModal = function (callback) {
            form.showModal(callback);
        };

        self.SetParamsOpen = function () {
            form.btnCreate.visible = false;
            form.btnDel.visible = true;
            form.cbUnsubscribe.visible = true;
            form.btnSave.visible = true;
        };

    }
    return module_constructor;
});
