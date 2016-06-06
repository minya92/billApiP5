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
        self.checkRequiredParams = function(aHttpContext, aRequiredFields, callback, onSuccessCallback){
            var err = false;
            var requestParams = (aHttpContext.request ? aHttpContext.request.params : aHttpContext);
            aHttpContext.response.status = 200;
            aHttpContext.response.headers.add("Access-Control-Allow-Origin", "*");
            aHttpContext.response.contentType = 'text/json';
            for (var i in requestParams){
                requestParams[i] = self.str2Bool(requestParams[i]);
            }
            aRequiredFields.forEach(function(field){
                if (!requestParams[field])
                    err = true;
            });
            if(err){
                self.setResponseCode(aHttpContext, {error: msg.get('reqFields')}, 200, onSuccessCallback);
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
        self.setResponseCode = function(aHttpContext, aResponse, aCode, aCallback){
            aHttpContext.response.status = aCode ? aCode : 200; 
            aHttpContext.response.headers.add("Access-Control-Allow-Origin", "*");
            aHttpContext.response.contentType = 'text/json';
            if(aCallback)
                aCallback(aResponse);
            else
                aHttpContext.response.body = JSON.stringify(aResponse); //так лучше не делать, почему то все ломает
        };
        
        /**
         * На вход может приходить примитив типа boolean или null в качестве строки
         * 'false', 'true', 'null' что не хорошо
         * Этот метод производит сериализацию и возвращает false если 'false', null если null и т.д.
         * @param {type} str
         * @returns {undefined}
         */
        self.str2Bool = function(str){
            if(str === 'false' || str === false)
                return false;
            else if(str === 'true' || str === true)
                return true;
            else if(str === 'null' || str === null)
                return null;
            else return str;
        }
    };
});
