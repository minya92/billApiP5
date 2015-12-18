/**
 * 
 * @author Work
 * @module AccountsModule
 */
define(['orm'], function (Orm, ModuleName) {
    return function () {
        var self = this, model = Orm.loadModel(ModuleName);
        
        /*
        * Создает новый биллинговый аккаунт и возвращает его ID
        */
        self.createBillAccount = function(aCallBack) {
            model.qBillAccounts.push({
                currnt_sum: 0, //TODO А нужно ли?
                active: true
            });
            model.save(function(){
                aCallBack(model.qBillAccounts.cursor.bill_accounts_id);
            });
        };
        
        self.execute = function () {
            // TODO : place application code here
        };
    };
});
