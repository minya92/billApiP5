/**
 * @public
 * @author Work
 */
define('ApiServices', ['orm', 'http-context', 'ApiLibs', 'BillServicesModule', 'Messages'],
        function (Orm, HttpContext, ApiLibs, BillServicesModule, Messages, ModuleName) {
            return function () {
                var self = this, model = Orm.loadModel(ModuleName);
                var billServicesModule = new BillServicesModule();
                var libs = new ApiLibs();

                /*
                 * @POST /services/create
                 */
                self.serviceCreate = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["name", "cost"], function(p){
                        billServicesModule.CreateService(p.name, p.cost, p.days, p.lock, p.afterMonth, p.prepayment, p.once, p.counts, function (res) {
                            onSucces({service_id: res});
                        });
                    });
                };

                /*
                 * @POST /services/change
                 */
                self.serviceChange = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["service_id"], function(p){
                        billServicesModule.ChangeService(p.service_id, p.cost, p.days, p.afterMonth, p.prepayment, p.once, p.counts, function (res) {
                            onSucces({service_id: res});
                        });
                    });
                };

                /*
                 * @POST /services/add
                 */
                self.serviceAddOnAccount = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["service_id", "account_id"], function(p){
                        billServicesModule.AddServiceOnAccount(p.account_id, p.service_id, function (res) {
                            onSucces(res);
                        });
                    });
                };

                /*
                 * @POST /services/disable
                 */
                self.disableOnAccount = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["service_id", "account_id"], function(p){
                         billServicesModule.DisableService(p.account_id, p.service_id, p.service_account_id, function (res) {
                            onSucces(res);
                        });
                    });
                };

                /*
                 * @POST /services/delete
                 */
                self.deleteService = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["service_id"], function(p){
                        billServicesModule.DeleteService(p.service_id, p.unsubscribe, function (res) {
                            onSucces(res);
                        });
                    });
                };

                /*
                 * @POST /services/pause
                 */
                self.pauseService = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["service_id", "account_id"], function(p){
                        billServicesModule.PauseService(p.account_id, p.service_id, p.service_account_id, function (res) {
                            onSucces(res);
                        });
                    });
                };

                /*
                 * @POST /services/get
                 */
                self.servicesGet = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), [], function(p){
                        billServicesModule.GetService(p.service_id, function (res) {
                            onSucces(res);
                        });
                    });
                };

                /*
                 * @POST /services/on_account
                 */
                self.servicesGetOnAccount = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), [], function(p){
                        billServicesModule.GetServiceOnAccount(p.account_id, p.service_id, p.service_account_id, function (res) {
                            onSucces(res);
                        });
                    });
                };

                /*
                 * @POST /services/set_count
                 */
                self.setCount = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), [], function(p){
                        billServicesModule.SetCounterService(p.account_id, p.service_id, p.service_account_id, p.count, function (res) {
                            onSucces(res);
                        });
                    });
                };

                self.execute = function () {
                    return {msg: "I'am running!!!"};
                };
            };
        });
