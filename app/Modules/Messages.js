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
                en  : "Account was not found",
                ru  : "Аккаунт не найден"
            },
            errFindOperation  :    {
                en  : "Billing Operation was not found",
                ru  : "Операция по счету не найдена"
            },
            errCreateOperation  :    {
                en  : "Error creating account transactions",
                ru  : "Ошибка создания операции по счету"
            },
            errNoMoney  :    {
                en  : "Not enough money",
                ru  : "Нет хватает денег"
            },
            errUnknownDate :    {
                en  : "Date is not set or has an unknown format",
                ru  : "Дата не задана или имеет неизвестный формат"
            },
            errWrongDate :    {
                en  : "Date it should be different from the current date",
                ru  : "Дата должна отличаться от текущей даты"
            },
            errFindService :    {
                en  : "The service is not found",
                ru  : "Услуга не найдена"
            },
            errDeleteService :    {
                en  : "Exists no disabled account",
                ru  : "Существуют не отключенныe счета"
            },
            errFindServiceOnAccount :    {
                en  : "The service is not found on account",
                ru  : "Услуга не найдена на счету"
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
