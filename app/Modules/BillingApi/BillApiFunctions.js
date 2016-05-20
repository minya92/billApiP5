/**
 * @public
 * @author Work
 */
define('BillApiFunctions', ['orm', 'CrossRequest', 'logger', 'resource'], function (Orm, CrossRequest, Logger, Resource, ModuleName) {
    function module_constructor() {
        var self = this, model = Orm.loadModel(ModuleName);
        
        var BILL_SERVER_URL = 'http://127.0.0.1:8084/bill';
        var crossRequest = new CrossRequest();
        
        self.request =  function (httpMethod, apiMethod, params, success, fail){
            var res = null, response = null;
            try{
                res = crossRequest.UrlConnection(BILL_SERVER_URL+'/application/'+apiMethod, params, httpMethod, null, null);
                response = JSON.parse(res);
                success(response);
            } catch(e) {
                Logger.severe('\n\n BILL API ERROR! ' + e);
                fail({error: e.toString()});
            }
        };
        
        var request = self.request;
        
        self.createAccount = function(success, fail){
            request("POST", "accounts/create", null, success, fail);
        };
        
        self.getSumFromAccount = function(accountId, success, fail){
            request("POST", "accounts/get_sum", {id: accountId}, success, fail);
        };
        
        self.checkExistAccount = function(accountId, success, fail){
            request("POST", "accounts/check_exist_account", {id: accountId}, success, fail);
        };
        
        self.execute = function () {
            
        };
    }
    return module_constructor;
});
