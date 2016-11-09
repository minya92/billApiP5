/**
 * @author minya92
 */
define('DiscountsOnService', ['orm', 'FormLoader', 'dialog', 'invoke', 'DiscountsForm'], function (Orm, FormLoader, dialog, Invoke, DiscountsForm, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = FormLoader(ModuleName, model, self);
        
        var discountsForm = new DiscountsForm();
        
        self.setService = function(id){
            model.qServiceDiscount.params.service_id = id;
            model.requery();
        };

        form.btnAdd.onActionPerformed = function (evt) {//p3p5       
            discountsForm.showModal(function(id){
                if (id) {
                    model.qDiscounts.requery();
                    model.qServiceDiscount.push({
                        discount_id: id,
                        service_id: model.qServiceDiscount.params.service_id
                    });
                    //model.save();
                }
                else 
                    dialog.alert('Вы ничего не выбрали!');
            });
            
        };

        form.btnDel.onActionPerformed = function (evt) {
            if (form.modelGrid.selected[0] || model.qServiceDiscount.cursor)
            {
                dialog.confirm("Удалить выбранную скидку?", function (res) {
                    if (res) {
                        model.qServiceDiscount.remove(form.modelGrid.selected[0] ? form.modelGrid.selected : [model.qServiceDiscount.cursor]);
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
        
        form.btnAccept.onActionPerformed = function() {
            model.save(function() {
                form.close(null);
            });
        };
    }
    return module_constructor;
});
