/**
 * @author minya92
 */
define('ServiceContent', ['orm', 'FormLoader', 'dialog'], function (Orm, FormLoader, dialog, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = FormLoader(ModuleName, model, self);

        self.setService = function(id) {
            model.qServicesConnect.params.host_id = id;
            model.qServiceList.params.deleted = false;
            model.qServiceList.params.service_id = null;
            model.requery();
        };
        
        form.btnAdd.onActionPerformed = function (evt) {
            model.qServicesConnect.push({
                host_service: model.qServicesConnect.params.host_id
            });
        };
        
        form.btnSave.onActionPerformed = function (evt) {
            model.save();
        };

        form.btnDel.onActionPerformed = function (evt) {
            if (form.modelGrid.selected[0] || model.qServicesConnect.cursor)
            {
                dialog.confirm("Удалить?", function (res) {
                    if (res) {
                        model.qServicesConnect.remove(form.modelGrid.selected[0] ? form.modelGrid.selected : [model.qServicesConnect.cursor]);
                        model.save(function () {
                            form.modelGrid.clearSelection();
                        });
                    }
                });
            } else
                dialog.alert("Ничего не выбрано!");
        };
        
    }
    return module_constructor;
});
