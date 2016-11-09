/**
 * @author lapsh
 * @stateless
 */
define('YandexPaymentsModule', ['orm', 'md5', 'logger', 'rpc'], function (Orm, MD5, Logger, Rpc, ModuleName) {
    function module_constructor() {
        var self = this, model = Orm.loadModel(ModuleName);

        var opModule = new Rpc.Proxy('OperationsModule');

        self.execute = function () {
            // TODO : place application code here
        };

        //Варианты ответа для яндекс денег
        self.RESPONSE_SUCCESS = 0;   //Все хорошо
        self.RESPONSE_FAIL_HASH = 1;   //Несовпали хэши
        self.RESPONSE_FAIL = 200; //Ошибка разбора

        var SHOP_PASSWORD = 'HJKGGYGTYFYVYjhgHHd78778678HGUJG';

        /*
         * Формирует ответный XML файл для яндекса
         */
        function xmlToYandex(code, shopId, invoiceId, aDate) {
            return '<?xml version="1.0" encoding="UTF-8"?> \n\
                <checkOrderResponse performedDatetime="' +
                    aDate + '" code="' + code + '" invoiceId="' + invoiceId + '" shopId="' + shopId + '"/>';
        }

        /*
         * Проверка заказа 
         * Запрос проверки корректности параметров заказа. 
         * Этот шаг позволяет исключить ошибки, которые могли возникнуть при 
         * прохождении платежной формы через браузер плательщика.
         * В случае успешного ответа Контрагента Оператор предлагает плательщику оплатить 
         * заказ и при успехе отправляет Контрагенту «Уведомление о переводе».
         */
        self.checkOrder = function (params, onSuccess, onError) {
            Logger.info("\n !!! checkOrder");
            var r = params;
            var hash =  MD5.generate(r.action + ";" + r.orderSumAmount + ";" + r.orderSumCurrencyPaycash + ";" +
                    r.orderSumBankPaycash + ";" + r.shopId + ";" + r.invoiceId + ";" +
                    r.customerNumber + ";" + SHOP_PASSWORD);
            if (hash.toUpperCase() === r.md5.toUpperCase()) {
                onSuccess(xmlToYandex(self.RESPONSE_SUCCESS, r.shopId, r.invoiceId, r.requestDatetime));
            } else {
                onSuccess(xmlToYandex(self.RESPONSE_FAIL_HASH, r.shopId, r.invoiceId, r.requestDatetime));
            }
        };

        /*
         * Уведомление о переводе 
         * Уведомление Контрагента о принятом переводе. Этот запрос обозначает факт успешного 
         * перевода денежных средств плательщика в адрес Контрагента и обязанность Контрагента выдать товар плательщику.
         * Обратите внимание: на этом шаге Контрагент не может отказаться от приема перевода.
         */
        self.paymentAviso = function (params, onSuccess, onError) {
            Logger.info("paymentAviso");
            var r = params;
            var hash = MD5.generate(r.action + ";" + r.orderSumAmount + ";" + r.orderSumCurrencyPaycash + ";" +
                    r.orderSumBankPaycash + ";" + r.shopId + ";" + r.invoiceId + ";" +
                    r.customerNumber + ";" + SHOP_PASSWORD);
            if (hash.toUpperCase() === r.md5.toUpperCase()) {
                if (r.billOperation) {
                    model.qBillOperations.params.operation_id = r.billOperation;
                    model.qBillOperations.query({operation_id: r.billOperation}, function(operations){
                        if (operations.length) {
                            opModule.setOperationDone(r.billOperation, function(){
                                Logger.info("BILL STATUS CHANGED!");
                                onSuccess(xmlToYandex(self.RESPONSE_SUCCESS, r.shopId, r.invoiceId, r.requestDatetime));
                            }, function(){
                                onSuccess(xmlToYandex(self.RESPONSE_FAIL, r.shopId, r.invoiceId, r.requestDatetime));
                            });
                        } else {
                            onSuccess(xmlToYandex(self.RESPONSE_FAIL, r.shopId, r.invoiceId, r.requestDatetime));
                        }
                    }, function(){
                        onSuccess(xmlToYandex(self.RESPONSE_FAIL, r.shopId, r.invoiceId, r.requestDatetime));
                    });
                }
            } else {
                onSuccess(xmlToYandex(self.RESPONSE_FAIL_HASH, r.shopId, r.invoiceId, r.requestDatetime));
            }
        };
    }
    return module_constructor;
});
