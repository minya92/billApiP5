/**
 * @public
 * @author Work
 */
define('ApiAccounts', ['orm', 'ApiLibs', 'AccountsModule', 'http-context', 'Messages'],
        function (Orm, ApiLibs, AccountsModule, HttpContext, Messages, ModuleName) {
            return function () {
                var self = this, model = Orm.loadModel(ModuleName);
                var libs = new ApiLibs();
                var accountsModule = new AccountsModule();
                var msg = new Messages();

                /*
                 * @POST /accounts/create
                 * @GET /accounts/create
                 */
                self.createAccountPOST = function (aPath, aSuccessCallback) {
                    accountsModule.createBillAccount(function (res) {
                        aSuccessCallback({account_id: res});
                    }, function(err){
                        libs.setResponseCode((new HttpContext()), err);
                    });
                };

                /*
                 * @POST /accounts/get_sum
                 * @GET /accounts/get_sum
                 */
                self.getSumFromAccount = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ['id'], function(params, aHttpContext){
                        accountsModule.getSumFromAccount(params.id, function (res) {
                            onSucces(res);
                        }, function(err){
                            onSucces(err);
                        });
                    }, onSucces);
                };

                /*
                 * @POST /accounts/delete
                 * @GET /accounts/delete
                 */
                self.delBillAccount = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ['id'], function(p, aHttpContext){
                        accountsModule.delAccount(p.id, function (res) {
                            onSucces(res);
                        }, function(err){
                            onSucces(err);
                        });
                    }, onSucces);
                };
                
                /*
                 * @POST /accounts/hard_delete
                 * @GET /accounts/hard_delete
                 */
                self.delAccountHardcore = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ['id'], function(p, aHttpContext){
                        accountsModule.delAccountHardcore(p.id, function (res) {
                            onSucces(res);
                        }, function(err){
                            onSucces(err);
                        });
                    }, onSucces);
                };
                
                /*
                 * @POST /accounts/check_exist_account
                 * @GET /accounts/check_exist_account
                 */
                self.checkExistAccount = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ['id'], function(p, aHttpContext){
                        accountsModule.checkExistAccount(p.id, function (res) {
                            onSucces(res);
                        }, function(err){
                            onSucces(err);
                        });
                    }, onSucces);
                };
                
                /*
                * @POST /accounts/get_accounts
                * @GET /accounts/get_accounts
                */
                self.getAllAccounts = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), [], function(params, aHttpContext){
                        accountsModule.GetAllAccounts(function (res) {
                            onSucces(res);
                        }, function(err){
                            onSucces(err);
                        });
                    }, onSucces);
                };
            };
        });
