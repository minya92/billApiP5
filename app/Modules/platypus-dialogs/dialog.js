/**
 * 
 * @author Алексей
 * @module dialog
 */
define('dialog', ['forms', 'ui', 'resource'], function (Forms, Ui, Resource, ModuleName) {
    return new function () {
        var self = this;
        var prompt, alert, confirm;
        
        function initForm(aForm, aFormName, aCallback) {
            if (!aForm) {
                Resource.loadText('./' + aFormName + '.layout', function(formContent) {
                        var form = Forms.readForm(formContent);
                        form.minimizable = form.resizable = form.maximizable = false;
                        form.onWindowOpened = function() {
                            if (form.tfData)
                                form.tfData.focus();
                        };
                        form.btnOk.onActionPerformed = function() {
                            form.close(form.tfData ? form.tfData.text : true);
                        };
                        
                        if (form.tfData)
                            form.tfData.onKeyPressed = function(evt) {
                                if (evt.key === 13)
                                     form.close(form.tfData.text);
                            };
                        if (form.btnCancel)
                        form.btnCancel.onActionPerformed = function() {
                            form.close(false);
                        };
                        aCallback(form);
                });
            } else {
                aCallback(aForm);
            }
        }
        
        self.prompt = function(aMessage, aParams, aCallback) {
            initForm(prompt, 'DialogPrompt', function(aPrompt) {
                prompt = aPrompt;
                
                var params = {
                    emptyText:  '',
                    windowCaption: 'Требуется ввод данных',
                    defValue: '',
                    isRequied: false
                }, callback;
                
                
                if (typeof(aParams) != 'function' && aParams != undefined) {
                    if (aParams.emptyText)
                        params.emptyText = aParams.emptyText;
                    if (aParams.windowCaption)
                        params.windowCaption = aParams.windowCaption;
                    if (aParams.defValue)
                        params.defValue = aParams.defValue;
                    if (aParams.isRequied)
                        params.isRequied = aParams.isRequied;
                    callback = aCallback;
                } else {
                    callback = aParams;
                }
                
                prompt.lblMessage.text = aMessage;
                prompt.tfData.text = params.defValue;
                prompt.tfData.emptyText = params.emptyText;
                prompt.title = params.windowCaption;
                
                prompt.showModal(callback ? callback : function() {});
            });
            
        };
        self.confirm = function(aMessage, aParams, aCallback) {
            initForm(confirm, 'DialogConfirm', function(aConfirm) {
                confirm = aConfirm;
                
                var params = {
                    windowCaption: 'Требуется подтверждение'
                }, callback;
                
                if (typeof(aParams) != 'function' && aParams != undefined) {
                    if (aParams.windowCaption)
                        params.windowCaption = aParams.windowCaption;
                    callback = aCallback;
                } else {
                    callback = aParams;
                }
                
                confirm.lblMessage.text = aMessage;
                confirm.title = params.windowCaption;
                
                confirm.showModal(callback ? callback : function() {});
            });
        };
        self.alert = function(aMessage, aParams, aCallback) {
            initForm(alert, 'DialogAlert', function(anAlert) {
                alert = anAlert;
                
                var params = {
                    windowCaption: 'Сообщение'
                }, callback;
                
                if (typeof(aParams) != 'function' && aParams != undefined) {
                    if (aParams.windowCaption)
                        params.windowCaption = aParams.windowCaption;
                    callback = aCallback;
                } else {
                    callback = aParams;
                }
                
                alert.lblMessage.text = aMessage;
                alert.title = params.windowCaption;
                
                alert.lblMessage.text = aMessage;

                alert.showModal(callback ? callback : function() {});
            });
        };
        
        self.override = function() {
            window.alert = self.alert;
            window.confirm = self.confirm;
            window.prompt = self.prompt;
        };
        
        self.export = function() {
            if (!window.md)
                window.md = {};
            window.md.alert = self.alert;
            window.md.confirm = self.confirm;
            window.md.prompt = self.prompt;
        };
    }();
});
