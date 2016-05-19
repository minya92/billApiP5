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
                self.setResponseCode(aHttpContext, 400, {error: msg.get('reqFields')});
            }
            else{
                if(!callback)
                    return requestParams;
                else callback(requestParams, aHttpContext);
            }
        };
        
        /**
         * Вернуть ответ с http кодом
         * @param {type} aHttpContext
         * @param {type} aCode
         * @param {type} aResponse
         * @returns {undefined}
         */
        self.setResponseCode = function(aHttpContext, aCode, aResponse){
            aHttpContext.response.status = aCode ? aCode : 200;
            aHttpContext.response.headers.add("Access-Control-Allow-Origin", "*");
            aHttpContext.response.contentType = 'text/json';
            aHttpContext.response.body = JSON.stringify(aResponse);
        };
    };
});
