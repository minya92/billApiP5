/**
 * 
 * @author Work
 * @module Messages
 */
define([], function (ModuleName) {
    return function () {
        var self = this;
        
        var MSG = {
            usePost         :    {
                en  : "You need to use POST method!",
                ru  : "Вы должны использовать метод POST"
            },
            reqFields       :    {
                en  : "Not filled in all required fields!",
                ru  : "Заполнены не все обязательные поля!"
            },
            errFindAccount  :    {
                en  : "Account was not found or is not used",
                ru  : "Аккаунт не найден или не используется"
            },
            successDelAccount:   {
                en  : "Account deleted successfully",
                ru  : "Аккаунт успешно удален"
            }
        }
        
        self.get = function(msg, lang){
            if(MSG[msg]){
                if(MSG[msg][lang]){
                    return MSG[msg][lang];
                } else {
                    return MSG[msg].en;
                }
            } else {
                return null;
            }
        }
        
        self.execute = function () {
            // TODO : place application code here
        };
    };
});
