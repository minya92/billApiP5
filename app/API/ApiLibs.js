/**
 * 
 * @author Work
 * @module ApiLibs
 */
define([], function (ModuleName) {
    return function () {
        var self = this;
        
        var MSG = {
            usePost     : "You need to use POST method!",
            reqFields   : "Not filled in all required fields!"
        };
        
        /*
         * Проверка набора входящих параметров.
         * @param {object} aParams - набор пораметров из http.request.params
         * @param {mas} aRequiredFields - массив обязательных параметров
         * @returns {unresolved}
         */
        self.checkRequiredParams = function(aParams, aRequiredFields){
            var err = false;
            aRequiredFields.forEach(function(field){
                err = true;
                for (var i in aParams){
                    if(i == field){
                        err = false;
                        break;
                    }
                }
            });
            if(err)
                return {error: MSG.reqFields};
            else
                return aParams;
        };
        
        /*
         * Получить сообщение по коду
         */
        self.getMsg = function(aCode){
            return MSG[aCode];
        };
        
        self.execute = function () {
            // TODO : place application code here
        };
    };
});
