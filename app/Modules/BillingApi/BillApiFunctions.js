/**
 * @public
 * @author Work
 */
define('BillApiFunctions', ['orm', 'CrossRequest', 'logger'], function (Orm, CrossRequest, Logger, ModuleName) {
    function module_constructor() {
        var self = this, model = Orm.loadModel(ModuleName);
        
        var BILL_SERVER_URL = 'http://127.0.0.1:8084/bill';
        var crossRequest = new CrossRequest();
        
        function request(httpMethod, apiMethod, params, success, fail){
            var res = null;
            try{
                res = crossRequest.UrlConnection(BILL_SERVER_URL+'/application/'+apiMethod, params, httpMethod, null, null);
                success(JSON.parse(res));
            } catch(e) {
                Logger.severe('\n\n BILL API ERROR! ' + e);
                res = {error: e};
                fail(JSON.parse(res));
            }
        }
        
        self.createAccount = function(success, fail){
            request("POST", "accounts/create", null, success, fail);
        };
        
        self.getSumFromAccount = function(accountId, success, fail){
            request("POST", "accounts/get_sum", {id: accountId}, success, fail);
        };
        
        self.execute = function () {
            
        };
    }
    return module_constructor;
});
