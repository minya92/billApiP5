/**
 * 
 * @author Work
 * @module OperationsModule
 */
define(['orm', 'Messages', 'Events'], function (Orm, Messages, Events, ModuleName) {
    return function () {
        var self = this, model = Orm.loadModel(ModuleName);
        var msg = new Messages();
        var events = new Events();
        
        model.requery();
        
        self.createOperation = function(anAccountId, aSum, aOperationType, aCallback){
            var error = null;
            if (typeof(aOperationType) == 'function') {
                aCallback = aOperationType;
                aOperationType = null;
            }
            if(!anAccountId || !aSum)
                error = msg.get("reqFields");
            if(!aOperationType) //TODO добавить проверку на сущ типа
                aOperationType = 'replenish';
            model.qBillAccounts.params.account_id = anAccountId;
            model.qBillAccounts.requery(function(){
                if(model.qBillAccounts.length){
                    var operation = {
                        account_id : anAccountId,
                        operation_sum: aSum,
                        operation_date: new Date(),
                        operation_type: aOperationType,
                        operation_status: getStatusId('processing')
                    }
                    model.qBillOperations.push(operation);
                    model.save();
                    aCallback(operation);
                }
            });
            
        };
        
        function getMultiplier (aOperationType) {
            var multiplier = false;
            model.qBillOperationTypes.forEach(function(cursor){
                if (cursor.bill_operations_type_id == aOperationType)
                    multiplier = cursor.multiplier;
            });
            return multiplier;
        }
        
        function getStatusId (aShortName){
            var operationStatus = false;
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
