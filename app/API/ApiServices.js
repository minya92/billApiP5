/**
 * @public
 * @author Work
 * @module ApiServices
 */
define(['orm', 'http-context', 'ApiLibs', 'BillServicesModule', 'Messages'], function (Orm, HttpContext, ApiLibs, BillServicesModule, Messages, ModuleName) {
    return function () {
        var self = this, model = Orm.loadModel(ModuleName);
        var billServicesModule  = new BillServicesModule();
        var libs = new ApiLibs();
        
        /*
         * @POST /services/create
         */
        self.serviceCreatePOST = function(aPath, onSucces){
            var http = libs.checkRequiredParams((new HttpContext()), ["name", "sum"]);
            if(http.error){
                return http;
            } else {
                billServicesModule.CreateService(http.name, http.sum, http.days, http.lock, http.afterMonth, function(res){
                    onSucces({service_id: res});
                });
            }
        };
        
        /*
         * @POST /services/addOnAccount
         */
        self.serviceAddOnAccount = function(aPath, onSucces){
            var http = libs.checkRequiredParams((new HttpContext()), ["service_id", "account_id"]);
            if(http.error){
                return http;
            } else {
                billServicesModule.AddServiceOnAccount(http.account_id, http.service_id, function(res){
                    onSucces(res);
                });
            }
        };
        
        self.execute = function () {
            return {msg: "I'am running!!!"};
        };
    };
});
