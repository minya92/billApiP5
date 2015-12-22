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
        var msg = new Messages();
        
        /*
         * @POST /service/create
         */
        self.serviceCreatePOST = function(aPath, onSucces){
            var http = new HttpContext();
            http = libs.checkRequiredParams(http.request.params, ["name", "sum"]);
            if(http.error){
                return http;
            } else {
                billServicesModule.CreateService(http.name, http.sum, http.days, http.lock, http.afterMonth, function(res){
                    onSucces({service_id: res});
                });
            }
        };
        
        /*
         * @GET /service/create
         */
        self.serviceCreateGET = function(path, onSucces){
            return {msg: msg.get('usePost')};
        };
        
        self.execute = function () {
            return {msg: "I'am running!!!"};
        };
    };
});
