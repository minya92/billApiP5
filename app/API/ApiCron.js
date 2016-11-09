/**
 * @public
 * @author Work
 * @stateless
 */
define('ApiCron', ['orm', 'http-context', 'ApiLibs', 'CronModule', 'Messages'],
        function (Orm, HttpContext, ApiLibs, CronModule, Messages, ModuleName) {
            return function () {
                var self = this, model = Orm.loadModel(ModuleName);
                var cronModule = new CronModule();
                var libs = new ApiLibs();

                /*
                 * @GET /cron/planned
                 * @POST /cron/planned
                 */
                self.plannedOperation = function (aPath, onSucces) {
                    cronModule.CheckPlannedPayments(aPath, function (res) {
                        onSucces(res);
                    });
                };
                
                /*
                 * @GET /cron/rev
                 * @POST /cron/rev
                 */
                self.checkRevaluation = function (aPath, onSucces) {
                    cronModule.CheckRevaluation(function (res) {
                        onSucces(res);
                    });
                };
            };
        });
