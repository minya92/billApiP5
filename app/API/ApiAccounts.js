/**
 * @public
 * @author Work
 * @module ApiAccounts
 */
define(['orm', 'ApiLibs','AccountsModule', 'http-context', 'Messages'], function (Orm, ApiLibs, AccountsModule, HttpContext, Messages, ModuleName) {
    return function () {
        var self = this, model = Orm.loadModel(ModuleName);
        var libs = new ApiLibs();
        var accountsModule = new AccountsModule(); 
        var msg = new Messages();
        
        /*
         * @POST /accounts/create
         */
        self.createAccountPOST = function(aPath, aSuccessCallback){
            accountsModule.createBillAccount(function(res){
                aSuccessCallback({account_id: res});
            });
        };
        
        /*
         * @POST /accounts/get_sum
         */
        self.getSumFromAccount = function(aPath, aSuccessCallback){
            var http =  new HttpContext();
            http = libs.checkRequiredParams(http.request.params, ['id']);
            if(http.error)
                aSuccessCallback(http.error);
            else {
                accountsModule.getSumFromAccount(http.id, function(res){
                    aSuccessCallback(res);
                });
            }
        }
        
        /*
         * @POST /accounts/delete
         */
        self.delBillAccount = function(aPath, aSuccessCallback){
            var http =  new HttpContext();
            http = libs.checkRequiredParams(http.request.params, ['id']);
            if(http.error)
                aSuccessCallback(http.error);
            else {
                accountsModule.delAccount(http.id, function(res){
                    aSuccessCallback(res);
                });
            }
        };
        
        self.execute = function () {
            // TODO : place application code here
        };
    };
});
