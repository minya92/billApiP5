/**
 * @author minya92
 */
define('DiscountsEdit', ['orm', 'FormLoader', 'dialog', 'invoke'], function (Orm, FormLoader, dialog, Invoke, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = FormLoader(ModuleName, model, self);

        self.setDiscount = function(id){
            model.qDiscRules.params.discount_id = id;
            model.qDiscRules.requery();
        };
        
        form.btnAdd.onActionPerformed = function (evt) {//p3p5            
            model.qDiscRules.push({
               discount_id: model.qDiscRules.params.discount_id
            });
            //model.qDiscRules.cursor.discount_id = model.qDiscRules.params.discount_id;
        };
        
        form.btnDel.onActionPerformed = function (evt) {
            if (form.modelGrid.selected[0] || model.qDiscRules.cursor)
            {
                dialog.confirm("Удалить выбранное правило?", function (res) {
                    if (res) {
                        model.qDiscRules.remove(form.modelGrid.selected[0] ? form.modelGrid.selected : [model.qDiscRules.cursor]);
                        //model.save(function () {
                            form.modelGrid.clearSelection();
                        //});
                    }
                });
            } else
                dialog.alert("Ничего не выбрано!");
        };

        form.btnCancel.onActionPerformed = function (evt) {//p3p5
            model.revert();
            form.close();
        };
        
        form.btnAccept.onActionPerformed = function(){
             model.save(function() {
                form.close(null);
            });
        };
    }
    return module_constructor;
});
