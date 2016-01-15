/**
 * 
 * @author Work
 * @module AccountsModule
 */
define(['orm', 'Messages', 'Events'], function (Orm, Messages, Events, ModuleName) {
    return function () {
        var self = this, model = Orm.loadModel(ModuleName);
        var msg = new Messages();
        var events = new Events();
        
        /*
         * Создает новый биллинговый аккаунт и возвращает его ID
         */
        self.createBillAccount = function (aCallBack) {
            model.qBillAccounts.push({
                currnt_sum: 0, //TODO А нужно ли?
                active: true
            });
            model.save(function () {
                events.addEvent("accountCreated", {account_id: model.qBillAccounts.cursor.bill_accounts_id});
                aCallBack(model.qBillAccounts.cursor.bill_accounts_id);
            });
        };

        /*
         * Получить остаток суммы на счету
         */
        self.getSumFromAccount = function (anAccountId, aCallBack) {
            model.qGetAccountBalance.params.account_id = +anAccountId;
            var sum = 0, error = null;
            model.requery(function(){
                if (model.qGetAccountBalance.length)
                    sum = model.qGetAccountBalance[0].account_balance;
                else {
                    sum = null;
                    error = msg.get('errFindAccount');
                }
                aCallBack({
                    account_id: anAccountId,
                    sum: sum, 
                    error: error
                });
            });
        };
        
        /*
         * Удалить счет (сделать неактивным)
         */
        self.delAccount = function(anAccountId, aCallBack){
            model.qBillAccounts.params.account_id = +anAccountId;
            model.requery(function(){
                if(model.qBillAccounts.length){
                    model.qBillAccounts[0].active = false;
                    model.save();
                    events.addEvent("accountDeleted", {account_id: anAccountId});
                    aCallBack({
                        result : msg.get("successDelAccount"),
                        error   : null
                    });
                } else {
                    aCallBack({
                        error : msg.get("errFindAccount")
                    });
                }
            });
        }

        self.execute = function () {
            // TODO : place application code here
        };
    };
});
