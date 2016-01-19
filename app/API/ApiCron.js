/**
 * @public
 * @author Work
 * @module ApiCron
 */
define(['orm', 'http-context', 'ApiLibs', 'CronModule', 'Messages'], function (Orm, HttpContext, ApiLibs, CronModule, Messages, ModuleName) {
    return function () {
        var self = this, model = Orm.loadModel(ModuleName);
        var cronModule  = new CronModule();
        var libs = new ApiLibs();
        
        /*
         * @GET /cron/planned
         */
        self.plannedOperation = function(aPath, onSucces){
            cronModule.CheckPlannedPayments(function(res){
                onSucces(res);
            });
        };
    };
});
