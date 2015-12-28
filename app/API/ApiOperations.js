/**
 * @public
 * @author Work
 * @module ApiOperations
 */
define(['orm', 'http-context', 'ApiLibs', 'OperationsModule', 'Messages'], function (Orm, HttpContext, ApiLibs, OperationsModule, Messages, ModuleName) {
    return function () {
        var self = this, model = Orm.loadModel(ModuleName);
        var operationsModule  = new OperationsModule();
        var libs = new ApiLibs();
        var msg = new Messages();
        
        /*
         * @POST /operations/create
         */
        self.operationCreate = function(aPath, onSucces){
            var http = libs.checkRequiredParams((new HttpContext()), ["id", "sum"]);
            if(http.error){
                return http;
            } else {
                operationsModule.createOperation(http.id, http.sum, http.withdraw, function(res){
                    onSucces(res);
                });
            }
        };
        
        /*
         * @POST /operations/done
         */
        self.operationDone = function(aPath, onSucces){
            var http = libs.checkRequiredParams((new HttpContext()), ["id"]);
            if(http.error){
                return http;
            } else {
                operationsModule.setOperationDone(http.id, function(result){
                    onSucces(result);
                });
            }
        };
        
        /*
         * @POST /operations/get
         */
        self.operationGet = function(aPath, onSucces){
            var http = libs.checkRequiredParams((new HttpContext()), ["id"]);
            if(http.error){
                return http;
            } else {
                operationsModule.getOperations(http.id, http.type, http.status, function(res){
                    onSucces(res);
                });
            }
        };

        
        /*
         * @POST /operations/planned
         */
        self.operationPlanned = function(aPath, onSucces){
            var http = libs.checkRequiredParams((new HttpContext()), ["id", "date"]);
            if(http.error){
                return http;
            } else {
                operationsModule.setOperationPlanned(http.id, http.date, function(res){
                    onSucces(res);
                });
            }
        };
        
        self.execute = function () {
            return {msg: "I'am running!!!"};
        };
    };
});
