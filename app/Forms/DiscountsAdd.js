/**
 * 
 * @author Admin
 */
define('DiscountsAdd', ['orm', 'FormLoader'], function (Orm, FormLoader, ModuleName) {
    function module_constructor(corpCompanyID) {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = FormLoader(ModuleName, model, self);

        self.setDiscount = function (id) {
            if (id) {
                model.qDiscounts.params.disc_discounts_id = id;
                model.requery(function () {
                    form.modelCombo.redraw();
                });
            } else {
                model.qDiscounts.push({});
                model.qDiscountTypes.requery(function () {
                    form.modelCombo.redraw();
                });
            }
        };

        form.btnAccept.onActionPerformed = function () {
            model.save(function () {
                form.close(null);
            });
        };

        form.btnCancel.onActionPerformed = function () {
            form.close();
        };

//        if (corpCompanyID) {
//           
//            model.qCorpCompanyByID.params.corp_id = corpCompanyID;
//            model.requery(function() {
//               form.modelCombo.redraw();
//           });
//        } else {
//            model.qCorpCompanyByID.push({});
//        }
//        
//        form.btnAccept.onActionPerformed = function(){
//             model.save(function() {
//                form.close(null);
//            });
//        };
//        form.btnCancel.onActionPerformed = function(){
//            form.close();
//        };
//        
//        form.modelCombo.onSelect = function () {
//            require('ContragentsJournal', function (ContragentsJournal) {
//                var picker = new ContragentsJournal();
//                picker.showModal(function (contragent) {
//                    form.modelCombo.value = contragent;
//                });
//            });
//        };
    }
    return module_constructor;
});
