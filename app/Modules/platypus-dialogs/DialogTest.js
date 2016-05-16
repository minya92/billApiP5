/**
 * 
 * @author Алексей
 * @module DialogTest
 */
define(['forms', 'ui', 'dialog'], function (Forms, Ui, dialog, ModuleName) {
    return function () {
        var self = this
                , form = Forms.loadForm(ModuleName);
        
        self.show = function () {
            form.show();
        };
        
        function callback(aRes) {
            form.tfRes.text = aRes;
        }
        
        form.btnPrompt.onActionPerformed = function(evt) {
            if (form.cbWindowCaption.selected)
                dialog.prompt(form.tfMessage.text, {emptyText: form.tfEmptyText.text, windowCaption: 'PropmtTest'}, callback);
            else
                dialog.prompt(form.tfMessage.text, {emptyText: form.tfEmptyText.text}, callback);
        };
        form.btnConfirm.onActionPerformed = function(evt) {
            if (form.cbWindowCaption.selected)
                dialog.confirm(form.tfMessage.text, {windowCaption: 'ConfirmTest'}, callback);
            else
                dialog.confirm(form.tfMessage.text, callback);
        };
        form.btnAlert.onActionPerformed = function(evt) {
            if (form.cbWindowCaption.selected)
                dialog.alert(form.tfMessage.text, {windowCaption: 'AlertTest'}, callback);
            else
                dialog.alert(form.tfMessage.text, callback);
                
        };
        
    };
});
