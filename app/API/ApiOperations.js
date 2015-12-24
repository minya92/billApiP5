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
         * @POST /operation/create
         */
        self.operationCreate = function(aPath, onSucces){
            var http = new HttpContext();
            http = libs.checkRequiredParams(http.request.params, ["id", "sum"]);
            if(http.error){
                return http;
            } else {
                operationsModule.createOperation(http.id, http.sum, http.withdraw, function(res){
                    if(res.bill_operations_id){
                        operationsModule.setOperationDone(res.bill_operations_id, function(result){
                            onSucces(result);
                        });
                    } else {
                        onSucces({error: msg.get('errCreateOperation')});
                    }
                });
            }
        };
        
        self.execute = function () {
            return {msg: "I'am running!!!"};
        };
    };
});
