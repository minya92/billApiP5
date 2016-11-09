/**
 * @public
 * @author Work
 * @stateless
 */
define('ApiYandex', ['orm', 'http-context', 'ApiLibs', 'rpc'],
        function (Orm, HttpContext, ApiLibs, Rpc, ModuleName) {
            return function () {
                var self = this, model = Orm.loadModel(ModuleName);
                var libs = new ApiLibs();
                var yandexModule = new Rpc.Proxy('YandexPaymentsModule');
                
                /*
                 * @POST /yandex/checkOrder
                 * @GET /yandex/checkOrder
                 */
                self.checkOrder = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), [], function(p, aHttpContext){
                        yandexModule.checkOrder(p, function (res) {
                            onSucces(res);
                        }, function(err){
                            onSucces(err);
                        });
                    }, onSucces);
                };

                /*
                 * @POST /yandex/paymentAviso
                 * @GET /yandex/paymentAviso
                 */
                self.paymentAviso = function (aPath, onSucces) {
                    libs.checkRequiredParams((new HttpContext()), [], function(p, aHttpContext){
                        yandexModule.paymentAviso(p, function (res) {
                            onSucces(res);
                        }, function(err){
                            onSucces(err);
                        });
                    }, onSucces);
                };
            };
        });
