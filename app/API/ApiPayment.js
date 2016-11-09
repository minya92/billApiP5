/**
 * @public
 * @author Work
 * @stateless
 */
define('ApiPayment', ['orm', 'http-context', 'ApiLibs', 'rpc'],
        function (Orm, HttpContext, ApiLibs, Rpc, ModuleName) {
            return function () {
                var self = this, model = Orm.loadModel(ModuleName);
                var libs = new ApiLibs();
                var payModule = new Rpc.Proxy('PaymentModule');
                
                /*
                 * @POST /payment/demo
                 * @GET /payment/demo
                 */
                self.paymentDemo = function (aPath, onSuccess) {
                    libs.checkRequiredParams((new HttpContext()), ['sum', 'card_id'], function(p, aHttpContext){
                        payModule.PrePayment(p.card_id, p.sum, function (res) {
                            payModule.PostPayment(res.bill_operation, function(r){
                                 onSuccess(res);
                            }, function(err){
                                onSuccess(err);
                            });
                        }, function(err){
                            onSuccess(err);
                        });
                    }, onSuccess);
                };

            };
        });
