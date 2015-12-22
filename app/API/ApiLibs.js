/**
 * 
 * @author Work
 * @module ApiLibs
 */
define(['Messages'], function (Messages, ModuleName) {
    return function () {
        var self = this;
        
        var msg = new Messages();
        
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
                return {error: msg.get('reqFields')};
            else
                return aParams;
        };
        
        
        self.execute = function () {
            // TODO : place application code here
        };
    };
});
