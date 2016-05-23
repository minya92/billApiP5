/**
 * @public
 * @author Work
 */
define('BillApiFunctions', ['logger', 'resource'], function (Logger, Resource, ModuleName) {
    function module_constructor() {
        var self = this;
        
        var BILL_SERVER_URL = 'http://127.0.0.1:8084/bill';
        
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
                try{
                    success(JSON.parse(res));
                }catch(e){
                    success(res);
                }
            }, fail);
        };
         
        var request = self.request;
        
        self.createAccount = function(success, fail){
            request("accounts/create", null, success, fail);
        };
        
        self.getSumFromAccount = function(accountId, success, fail){
            request("accounts/get_sum", {id: accountId}, success, fail);
        };
        
        self.checkExistAccount = function(accountId, success, fail){
            request("operations/getTypes", {id: accountId}, success, fail);
        };
        
        self.getAllOperationsStatuses = function(accountId, success, fail){
            request("/operations/get_statuses", {}, success, fail);
        };
        
        self.getAllOperationsTypes = function(accountId, success, fail){
            request("/operations/get_types", {}, success, fail);
        };
    }
    return module_constructor;
});
