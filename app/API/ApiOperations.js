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
                 */
                self.operationCreate = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["id", "sum"], function(p){
                        operationsModule.createOperation(p.id, p.sum, p.withdraw, function (res) {
                            onSucces(res);
                        });
                    });
                };

                /*
                 * @POST /operations/done
                 */
                self.operationDone = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["id"], function(p){
                        operationsModule.setOperationDone(p.id, function (result) {
                            onSucces(result);
                        });
                    });
                };

                /*
                 * @POST /operations/get
                 */
                self.operationGet = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["id"], function(p){
                        operationsModule.getOperations(p.id, p.type, p.status, function (res) {
                            onSucces(res);
                        });
                    });
                };


                /*
                 * @POST /operations/planned
                 */
                self.operationPlanned = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), ["id", "date"], function(p){
                        operationsModule.setOperationPlanned(p.id, p.date, function (res) {
                            onSucces(res);
                        });
                    });
                };

                self.execute = function () {
                    return {msg: "I'am running!!!"};
                };
            };
        });
