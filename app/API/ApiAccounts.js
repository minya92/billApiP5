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
                    });
                };

                /*
                 * @POST /accounts/get_sum
                 */
                self.getSumFromAccount = function (aPath, aSuccessCallback) {
                    libs.checkRequiredParams((new HttpContext()), ['id'], function(params){
                        accountsModule.getSumFromAccount(params.id, function (res) {
                            aSuccessCallback(res);
                        });
                    });
                }

                /*
                 * @POST /accounts/delete
                 */
                self.delBillAccount = function (aPath, aSuccessCallback) {
                    var http = libs.checkRequiredParams((new HttpContext()), ['id'], function(p){
                        accountsModule.delAccount(p.id, function (res) {
                            aSuccessCallback(res);
                        });
                    });
                };

                self.execute = function () {
                    // TODO : place application code here
                };
            };
        });
