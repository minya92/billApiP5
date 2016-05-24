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
                 * @GET /services/create
                 */
                self.serviceCreate = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["name", "cost"], function(p, aHttpContext){
                        billServicesModule.CreateService(p.name, p.cost, p.days, p.lock, p.afterMonth, p.prepayment, p.once, p.counts, function (res) {
                            onSucces({service_id: res});
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };

                /*
                 * @POST /services/change
                 * @GET /services/change
                 */
                self.serviceChange = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["service_id"], function(p, aHttpContext){
                        billServicesModule.ChangeService(p.service_id, p.cost, p.days, p.afterMonth, p.prepayment, p.once, p.counts, function (res) {
                            onSucces({service_id: res});
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };

                /*
                 * @POST /services/add
                 * @GET /services/add
                 */
                self.serviceAddOnAccount = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["service_id", "account_id"], function(p, aHttpContext){
                        billServicesModule.AddServiceOnAccount(p.account_id, p.service_id, function (res) {
                            onSucces(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };

                /*
                 * @POST /services/disable
                 * @GET /services/disable
                 */
                self.disableOnAccount = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["service_id", "account_id"], function(p, aHttpContext){
                         billServicesModule.DisableService(p.account_id, p.service_id, p.service_account_id, function (res) {
                            onSucces(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };

                /*
                 * @POST /services/delete
                 * @GET /services/delete
                 */
                self.deleteService = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["service_id"], function(p, aHttpContext){
                        billServicesModule.DeleteService(p.service_id, p.unsubscribe, function (res) {
                            onSucces(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };
                
                /*
                 * @POST /services/hard_delete
                 * @GET /services/hard_delete
                 */
                self.hardDeleteService = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["service_id"], function(p, aHttpContext){
                        billServicesModule.HardDeleteService(p.service_id, function (res) {
                            onSucces(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };

                /*
                 * @POST /services/pause
                 * @GET /services/pause
                 */
                self.pauseService = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["service_id", "account_id"], function(p, aHttpContext){
                        billServicesModule.PauseService(p.account_id, p.service_id, p.service_account_id, function (res) {
                            onSucces(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };

                /*
                 * @POST /services/get
                 * @GET /services/get
                 */
                self.servicesGet = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), [], function(p, aHttpContext){
                        billServicesModule.GetService(p.service_id, function (res) {
                            onSucces(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };

                /*
                 * @POST /services/on_account
                 * @GET /services/on_account
                 */
                self.servicesGetOnAccount = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), [], function(p, aHttpContext){
                        billServicesModule.GetServiceOnAccount(p.account_id, p.service_id, p.service_account_id, function (res) {
                            onSucces(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };

                /*
                 * @POST /services/set_count
                 * @GET /services/set_count
                 */
                self.setCount = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), [], function(p, aHttpContext){
                        billServicesModule.SetCounterService(p.account_id, p.service_id, p.service_account_id, p.count, function (res) {
                            onSucces(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };
            };
        });
