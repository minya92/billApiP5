/**
 * 
 * @author Work
 * @module OperationsModule
 */
define(['orm', 'Messages', 'Events', 'AccountsModule'], function (Orm, Messages, Events, AccountsModule,  ModuleName) {
    return function () {
        var self = this, model = Orm.loadModel(ModuleName);
        var msg = new Messages();
        var events = new Events();
        var accountsModule = new AccountsModule();
        
        model.requery();
        
        /*
         * Добавить новую оперцию по счету
         * @param {type} anAccountId
         * @param {type} aSum
         * @param {type} anOperationType
         * @param {type} aCallback
         * @returns {undefined}
         */
        self.createOperation = function(anAccountId, aSum, anOperationType, aCallback){
            var error = null;
            if (typeof(anOperationType) == 'function') {
                aCallback = anOperationType;
                anOperationType = null;
            }
            if(!anAccountId || !aSum)
                error = msg.get("reqFields");
            anOperationType = anOperationType ? anOperationType = 'withdraw' : anOperationType = 'replenish';
            model.qBillAccounts.params.account_id = +anAccountId;
            model.qBillAccounts.requery(function(){
                if(model.qBillAccounts.length){
                    var operation = {
                        account_id : anAccountId,
                        operation_sum: aSum,
                        operation_date: new Date(),
                        operation_type: anOperationType,
                        operation_status: getStatusId('processing')
                    };
                    model.qBillOperations.push(operation);
                    model.save(function(){
                        operation.id = model.qBillOperations[model.qBillOperations.length - 1].bill_operations_id;
                        aCallback(operation);
                    });
                }
            });
        };
        
        //TODO продумать логику с операциями
        
        /*
         * Пометить операцию успешной
         * TODO добавить сюда логгер
         */
        self.setOperationDone = function(anOperationId, aCallback){
            model.qBillOperations.params.operation_id = +anOperationId;
            model.qBillOperations.requery(function(){
                if(model.qBillOperations.length){
                    model.qBillAccounts.params.account_id = model.qBillOperations[0].account_id;
                    model.qBillAccounts.requery(function(){
                        if(model.qBillAccounts.length){
                            if(getMultiplier(model.qBillOperations[0].operation_type) === -1){ // операция списания
                                accountsModule.getSumFromAccount(model.qBillOperations[0].account_id, function(res){
                                    if(res.sum && res.sum >= model.qBillOperations[0].operation_sum){
                                        model.qBillOperations[0].operation_status = getStatusId('done');
                                        model.save();
                                        aCallback({result: "ok", error: null});
                                    } else {
                                        model.qBillOperations[0].operation_status = getStatusId('canceled');
                                        model.save();
                                        aCallback({error: msg.get('errNoMoney')});
                                    }
                                });
                            } else {
                                model.qBillOperations[0].operation_status = getStatusId('done');
                                model.save();
                                aCallback({result: "ok", error: null});
                            }
                        } else {
                            aCallback({error: msg.get('errFindAccount')});
                        }
                    });
                } else {
                    aCallback({error: msg.get('errFindOperation')});
                }
            });
        };
        
        /*
         * Запланировать оперцию на срок aDate
         * @param {type} anOperationId
         * @param {type} aDate
         * @param {type} aCallback
         * @returns {undefined}
         */
        self.setOperationPlanned = function(anOperationId, aDate, aCallback){
            model.qBillOperations.params.operation_id = +anOperationId;
            if(aDate){
                aDate = new Date(aDate);
                if((new Date()) < aDate.valueOf()){
                    model.qBillOperations.requery(function(){
                        if(model.qBillOperations.length){
                            model.qBillOperations[0].date = aDate;
                            model.qBillOperations[0].status = getStatusId('planned');
                            model.save();
                            aCallback({result: "ok", error: null});
                        } else {
                            aCallback({error: msg.get('errFindOperation')});
                        }
                    });
                } else {
                    aCallback({error: msg.get('errWrongDate')});
                }
            } else {
                aCallback({error: msg.get('errUnknownDate')});
            }
        };
        
        /*
         * Поулчить все операции по аккаунту
         * TODO добавить limit
         */
        self.getOperations = function(anAccountId, anOperationType, anOperationStatus, aCallback){
            model.qBillOperationsOnAccount.params.account_id = +anAccountId;
            model.qBillOperationsOnAccount.params.type = (anOperationType?anOperationType:null);
            model.qBillOperationsOnAccount.params.status = (anOperationStatus?getStatusId(anOperationStatus):null);
            model.qBillOperationsOnAccount.requery(function(){
                if(model.qBillOperationsOnAccount.length){
                    aCallback({result: model.qBillOperationsOnAccount, error: null});
                } else {
                    aCallback({error: msg.get('errFindOperation'), result: null});
                }
            });
        };
        
        function getMultiplier (aOperationType) {
            var multiplier = null;
            model.qBillOperationsTypes.forEach(function(cursor){
                if (cursor.bill_operations_type_id == aOperationType)
                    multiplier = cursor.multiplier;
            });
            return multiplier;
        }
        
        function getStatusId (aShortName){
            var operationStatus = null;
            model.qBillOperationStatus.forEach(function(cursor){
                if (cursor.short_name == aShortName)
                    operationStatus = cursor.bill_operations_status_id;
            });
            return operationStatus;
        }
        
        self.execute = function () {
            // TODO : place application code here
        };
    };
});
