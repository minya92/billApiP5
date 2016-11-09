/**
 * @stateless
 * @author lapsh
 */
define('PaymentModule', ['orm', 'rpc'], function (Orm, Rpc, ModuleName) {
    function module_constructor() {
        var self = this, model = Orm.loadModel(ModuleName);
        var opModule = new Rpc.Proxy('OperationsModule');
        
        /*
         * Первая стадия оплаты, платеж поступил, но не помечен исполненным 
         */
        self.PrePayment = function(cardKey, sum, onSuccess, onError){
            model.qPaymentsCards.query({id: +cardKey}, function(card){
                if(card.length && card[0].account_id){
                    var accountId = card[0].account_id;
                    opModule.createOperation(accountId, sum, null, null, null, function(operation){
                        model.qGetStartPeriodFromService.query({account_id: accountId}, function(data){
                            model.qFillOperations.push({
                                card_id: card[0].tk_card_id,
                                amount: sum,
                                fill_date: new Date(),
                                bill_operation: operation.id
                            });
                            if(data.length && data[0].operation_date){
                                model.qFillOperations.cursor.start_period = data[0].operation_date
                            }
                            model.save(function(){
                                onSuccess(model.qFillOperations.cursor);
                            }, function(){
                                onError({error: 'Err save operation'});
                            });
                        }, function(){
                            onError({error: 'Err Query. 500'});
                        });
                    }, function(){
                        onError({error: 'Err create operation'});
                    });
                } else {
                    onError({error: 'No find card ID or AccountID is not linked to this card'});
                }
            }, function(){
                onError({error: 'Err Query. 500'});
            });
        };
        
        /*
         * Второй шаг, подтвеждение платежа
         */
        self.PostPayment = function(opId, onSuccess, onError) {
            model.qFillOperations.params.id = +opId;
            model.qFillOperations.requery(function(){
                if(model.qFillOperations.length) {
                    opModule.setOperationDone(opId, function(res){
                        onSuccess({operation_id : opId});
                    }, function(){
                        onError({error: 'Err set operation done'});
                    });
                } else {
                    onError({error: 'Can\'t find operation with this ID'});
                }
            }, function(){
                onError({error: 'Err Query. 500'});
            });
        };
    }
    return module_constructor;
});