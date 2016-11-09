/**
 * @public
 * @author Work
 * @stateless
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
                    libs.checkRequiredParams((new HttpContext()), ["id"], function(p, aHttpContext){
                        operationsModule.createOperation(p.id, p.sum, p.withdraw, null, p.service_id, function (res) {
                            onSucces(res);
                        }, function(err){
                            onSucces(err);
                        });
                    }, onSucces);
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
                            onSucces(err);
                        });
                    }, onSucces);
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
                            onSucces(err);
                        });
                    }, onSucces);
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
                            onSucces(err);
                        });
                    }, onSucces);
                };
                
                /*
                 * @POST /operations/get_statuses
                 * @GET /operations/get_statuses
                 */
                self.getAllOperationsStatuses = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), [], function(p, aHttpContext){
                        operationsModule.getAllOperationsStatuses(function (res) {
                            onSucces(res);
                        }, function(err){
                            onSucces(err);
                        });
                    }, onSucces);
                };
                
                /*
                 * @POST /operations/get_types
                 * @GET /operations/get_types
                 */
                self.getAllOperationsTypes = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), [], function(p, aHttpContext){
                        operationsModule.getAllOperationsTypes(function (res) {
                            onSucces(res);
                        }, function(err){
                            onSucces(err);
                        });
                    }, onSucces);
                };
                
                /*
                 * @POST /operations/get_types_statuses
                 * @GET /operations/get_types_statuses
                 */
                self.getAllOperationsTypesAndStatuses = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), [], function(p, aHttpContext){
                        operationsModule.getAllOperationsTypes(function (types) {
                            operationsModule.getAllOperationsStatuses(function (statuses) {
                                onSucces({
                                    types: types,
                                    statuses: statuses
                                });
                            }, function(err){
                                onSucces(err);
                            });
                        }, function(err){
                            onSucces(err);
                        });
                    }, onSucces);
                };
            };
        });
