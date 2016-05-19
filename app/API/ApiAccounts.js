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
                 */
                self.createAccountPOST = function (aPath, aSuccessCallback) {
                    accountsModule.createBillAccount(function (res) {
                        aSuccessCallback({account_id: res});
                    }, function(err){
                        libs.setResponseCode((new HttpContext()), 404, err);
                    });
                };

                /*
                 * @POST /accounts/get_sum
                 * 
                 */
                self.getSumFromAccount = function (aPath, aSuccessCallback) {
                    libs.checkRequiredParams((new HttpContext()), ['id'], function(params, aHttpContext){
                        accountsModule.getSumFromAccount(params.id, function (res) {
                            aSuccessCallback(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, 404, err);
                        });
                    });
                };

                /*
                 * @POST /accounts/delete
                 */
                self.delBillAccount = function (aPath, aSuccessCallback, aErrCallback) {
                    libs.checkRequiredParams((new HttpContext()), ['id'], function(p, aHttpContext){
                        accountsModule.delAccount(p.id, function (res) {
                            aSuccessCallback(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, 404, err);
                        });
                    });
                };
                
                /*
                 * @POST /accounts/check_exist_account
                 */
                self.checkExistAccount = function (aPath, aSuccessCallback, aErrCallback) {
                    libs.checkRequiredParams((new HttpContext()), ['id'], function(p, aHttpContext){
                        accountsModule.checkExistAccount(p.id, function (res) {
                            aSuccessCallback(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, 404, err);
                        });
                    });
                };
            };
        });
