/**
 * @public
 * @author Work
 * @module ApiAccounts
 */
define(['orm', 'ApiLibs','AccountsModule', 'http-context'], function (Orm, ApiLibs, AccountsModule, HttpContext, ModuleName) {
    return function () {
        var self = this, model = Orm.loadModel(ModuleName);
        var libs = new ApiLibs();
        var accountsModule = new AccountsModule(); 
        
        /*
         * @POST /accounts/create
         */
        self.createAccountPOST = function(aPath, aSuccessCallback){
            accountsModule.createBillAccount(function(res){
                aSuccessCallback({account_id: res});
            });
        };
        
        self.execute = function () {
            // TODO : place application code here
        };
    };
});
