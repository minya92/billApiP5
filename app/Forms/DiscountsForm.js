/**
 * @author minya92
 */
define('DiscountsForm', ['orm', 'FormLoader', 'dialog', 'invoke', 'DiscountsEdit', 'DiscountsAdd'], function (Orm, FormLoader, dialog, Invoke, DiscountsEdit, DiscountsAdd, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = FormLoader(ModuleName, model, self);

        var discountsEdit = new DiscountsEdit();

        model.requery();

        form.btnAdd.onActionPerformed = function (evt) {
            var discountsAdd = new DiscountsAdd();
            discountsAdd.setDiscount(null);
            discountsAdd.showModal(function () {
                model.requery(function () {
                });
            });
        };

        form.btnDel.onActionPerformed = function (evt) {
            if (form.modelGrid.selected[0] || model.qDiscounts.cursor)
            {
                dialog.confirm("Удалить выбранную скидку?", function (res) {
                    if (res) {
                        model.qDiscounts.remove(form.modelGrid.selected[0] ? form.modelGrid.selected : [model.qDiscounts.cursor]);
                        model.save(function () {
                            form.modelGrid.clearSelection();
                        });
                    }
                });
            } else
                dialog.alert("Ничего не выбрано!");
        };

        form.btnCancel.onActionPerformed = function (evt) {//p3p5
            model.revert();
            form.close();
        };

        form.btnRools.onActionPerformed = function (evt) {//p3p5
            discountsEdit.setDiscount(form.modelGrid.selected[0] ? form.modelGrid.selected[0].disc_discounts_id : model.qDiscounts.cursor.disc_discounts_id);
            discountsEdit.show();
        };

        form.btnEdit.onActionPerformed = function (evt) {
            var discountsAdd = new DiscountsAdd();
            discountsAdd.setDiscount(form.modelGrid.selected[0] ? form.modelGrid.selected[0].disc_discounts_id : model.qDiscounts.cursor.disc_discounts_id);
            discountsAdd.showModal(function () {
                model.requery(function () {
                });
            });
        };

        form.modelGrid.onMouseClicked = function (evt) {
            if (evt.clickCount == 2)
                form.btnEdit.onActionPerformed();
        };

        form.btnSelect.onActionPerformed = function () {
            if (form.modelGrid.selected[0] || model.qDiscounts.cursor)
            {
                form.close(form.modelGrid.selected[0] ? form.modelGrid.selected[0].disc_discounts_id : model.qDiscounts.cursor.disc_discounts_id);
            } else
                dialog.alert("Ничего не выбрано!");
        };
    }
    return module_constructor;
});
