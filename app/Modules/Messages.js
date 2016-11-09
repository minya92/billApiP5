/**
 * @author Work
 */
define('Messages', [], function (ModuleName) {
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
            },
            errQuery :   {
                en  : "Server Error. 500",
                ru  : "Ошибка сервера. 500"
            }, 
            errSaving : {
                en  : "Error Saving Transactions. 500",
                ru  : "Ошибка проведения транзакций. 500"
            },
            errDeleteAccount : {
                en  : "Failed to delete bill account. Please first make inactive. /accoutns/delete?id=xxxxxx",
                ru  : "Ошибка удаление счета. Сначала сделайте счет неактивным. /accoutns/delete?id=xxxxxx"
            }, 
            errHardDeleteService : {
                en  : "Failed to delete service. Please first make inactive. /services/delete?service_id=xxxxxx",
                ru  : "Ошибка удаление услуги. Сначала сделайте услгу неактивной. /services/delete?service_id=xxxxxx"
            },
            errEmptyCount : {
                en  : "Counter ended",
                ru  : "Счетчик закончился"
            },
            discAddSuccess : {
                en  : "Discount Success Added to Account",
                ru  : "Скидка успешно подключена на к услуге"
            },
            discAddError : {
                en  : "Discount error add to Account",
                ru  : "Ошибка подключения скидки к услуге"
            }
        };
        
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
        };
        
        self.execute = function () {
            // TODO : place application code here
        };
    };
});
