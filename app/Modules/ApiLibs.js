/**
 * @author Work
 */
define('ApiLibs', ['Messages'], function (Messages, ModuleName) {
    return function () {
        var self = this;
        
        var msg = new Messages();
        
        /*
         * Проверка набора входящих параметров.
         * @param {object} aParams - набор пораметров из http.request.params
         * @param {mas} aRequiredFields - массив обязательных параметров
         * @returns {unresolved}
         */
        self.checkRequiredParams = function(aHttpContext, aRequiredFields, callback){
            var err = false;
            var requestParams = (aHttpContext.request ? aHttpContext.request.params : aHttpContext);
            aHttpContext.response.status = 200;
            aHttpContext.response.headers.add("Access-Control-Allow-Origin", "*");
            aHttpContext.response.contentType = 'text/json';
            aRequiredFields.forEach(function(field){
                if (!requestParams[field])
                    err = true;
            });
            if(err){
                aHttpContext.response.status = 400;
                var res = JSON.stringify({error: msg.get('reqFields')});
                aHttpContext.response.body = res;
                return {error: msg.reqFields};
            }
            else{
                if(!callback)
                    return requestParams;
                else callback(requestParams, aHttpContext);
            }
        };

        self.execute = function () {
            // TODO : place application code here
        };
    };
});
