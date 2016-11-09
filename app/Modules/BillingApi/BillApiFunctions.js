/**
 * @public
 * @author Work
 */
define('BillApiFunctions', ['logger', 'invoke', 'resource'], function (Log, Invoke, Resource, ModuleName) {
    function module_constructor() {
        var self = this;
        
        var BILL_SERVER_URL = 'http://localhost:8080/tk';
        
        self.getUrlString = function(aURL, aParams){
            return aParams ? 
                        aURL + (aURL[aURL.length-1] === '/' ? '' : '/') 
                        + '?' + serializeUrlEncoded(aParams)
                    :
                        aURL;
        };
        
        function serializeUrlEncoded(obj, prefix) {
            var str = [];
            for (var p in obj) {
                var k = prefix ? prefix + "[]" : p, v = obj[p];
                str.push(typeof v === "object" ?
                        serializeUrlEncoded(v, k) :
                        encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
            return str.join("&");
        }
        
        self.request = function(apiMethod, params, success, fail){
            Resource.loadText(self.getUrlString(BILL_SERVER_URL+'/application/'+apiMethod, params), function(res){
                var result = null;
                try{
                    result = JSON.parse(res);
                    if(result.error)
                        fail(result);
                    else
                        success(result);
                }catch(e){
                    fail(res);
                }
            }, fail);
        };
        
//        self.request_new = function(apiMethod, params, success, fail){
//            var req = HttpClient.get(BILL_SERVER_URL+'/application/'+apiMethod);
//            HttpClient.execute(req,function(value) {
//               var headers = value.allHeaders;
//                Log.info(typeof value);
//                Log.info( headers instanceof Array);
//                Log.info(JSON.stringify(value.protocolVersion));
//                Log.info(JSON.stringify(headers));
//                Log.info('Date: ' + value.containsHeader('Date'));
//                Log.info('Content-Length: ' + value.containsHeader('Content-Length'));
//                if(value.getContentLength() > 0) {
//                    var a = value.getContent();
//                    Log.info(a);
//                    HttpClient.close();
//                    Invoke.later(function(){
//                        
//                    });
//                } else {
//                    Invoke.later(function(){
//                        success('addddddddddddddddd');
//                    });
//                }
//            }, function(e) {
//                throw e;
//            });
//            success('addddddddddddddddd');
//        };
         
        var request = self.request;
        /*
         * Создать новый счет
         */
        self.createAccount = function(success, fail){
            self.request("accounts/create", null, success, fail);
        };
        
        self.getSumFromAccount = function(accountId, success, fail){
            request("accounts/get_sum", {id: accountId}, success, fail);
        };
        
        self.checkExistAccount = function(accountId, success, fail){
            request("accounts/check_exist_account", {id: accountId}, success, fail);
        };
        
        self.getAllOperationsStatuses = function(accountId, success, fail){
            request("/operations/get_statuses", {}, success, fail);
        };
        
        self.getAllOperationsTypes = function(accountId, success, fail){
            request("/operations/get_types", {}, success, fail);
        };
        
        /*
         * Провести операцию по счету
         * withdaraw - списать деньги. (true - cпишутся, false - добавятся)
         */
        self.createOperation = function (accountId, serviceId, sum, withdraw, success, fail) {
            var sendParams = {
                id: accountId,
                sum: sum
            };
            if(serviceId)
                sendParams.service_id = serviceId;
            if (withdraw && typeof withdraw != 'function')
                sendParams.withdraw = true;
            else if(typeof withdraw == 'function'){
                fail = success;
                success = withdraw;
            }
            request("operations/create", sendParams, function (operation) {
                request("operations/done", {id: operation.id}, function (response) {
                    if (response.result)
                        success(operation.id);
                    else
                        fail(response);
                }, fail);
            }, fail);
        };
        
        /*
         * Подключить услугу на счет 
         */
        self.addServiceToAccount = function(accountId, serviceId, success, fail){
            request("services/add", {service_id: serviceId, account_id: accountId}, success, fail);
        };
        
        /*
         * Получения стоимости услуги
         */
        self.getAllCostByServices = function(aCallback){
            
           request("services/get", false, aCallback);
     
        };
    }
    return module_constructor;
});
