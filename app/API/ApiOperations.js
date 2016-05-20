/**
 * @public
 * @author Work
 */
define('ApiOperations', ['orm', 'http-context', 'ApiLibs', 'OperationsModule', 'Messages'],
        function (Orm, HttpContext, ApiLibs, OperationsModule, Messages, ModuleName) {
            return function () {
                var self = this, model = Orm.loadModel(ModuleName);
                var operationsModule = new OperationsModule();
                var libs = new ApiLibs();
                var msg = new Messages();

                /*
                 * @POST /operations/create
                 * @GET /operations/create
                 */
                self.operationCreate = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["id", "sum"], function(p, aHttpContext){
                        operationsModule.createOperation(p.id, p.sum, p.withdraw, null, function (res) {
                            onSucces(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };

                /*
                 * @POST /operations/done
                 * @GET /operations/done
                 */
                self.operationDone = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["id"], function(p, aHttpContext){
                        operationsModule.setOperationDone(p.id, function (result) {
                            onSucces(result);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };

                /*
                 * @POST /operations/get
                 * @GET /operations/get
                 */
                self.operationGet = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["id"], function(p, aHttpContext){
                        operationsModule.getOperations(p.id, p.type, p.status, function (res) {
                            onSucces(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };


                /*
                 * @POST /operations/planned
                 * @GET /operations/planned
                 */
                self.operationPlanned = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["id", "date"], function(p, aHttpContext){
                        operationsModule.setOperationPlanned(p.id, p.date, function (res) {
                            onSucces(res);
                        }, function(err){
                            libs.setResponseCode(aHttpContext, err);
                        });
                    });
                };
            };
        });
