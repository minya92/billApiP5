/**
 * 
 * @author Work
 * @module BillServicesModule
 */
define(['orm'], function (Orm, ModuleName) {
    return function () {
        var self = this, model = Orm.loadModel(ModuleName);
        
        var ERRORS = {
            FIND_ACCOUNT_ID : "Аккаунт с таким ID не найден",
            FIND_SERVICE_ID : "Услуга с таким ID не найдена",
            LOST_MONEY      : "Недостаточно средств на счету",
            INVALID_OP_ID   : "Неверный ID операции",
            SERVICE_ADDED   : "Услуга уже добавлена на лицевой счет",
            SERVICE_LOCKED  : "Ошибка удаления услуги с аккаунта. Услуга заблокирована для удаления!"
        };
        
        self.execute = function () {
            // TODO : place application code here
        };
        
        /*
        * Создание новой услуги
        * aDays - промежуток дней для снятия абонентской платы
        * aDays (null) - ежемесячное списание абонентской платы
        * @param {type} aName
        * @param {type} aSum
        * @param {type} aDays
        * @returns {Boolean}
        */
        self.CreateService = function(aName, aSum, aDays, aLock, anAfterMonth, admin) {
            var aMonth = false;
            if(!admin) admin = false;
            if (aDays == false || aDays == 0 || aDays == null || aDays === undefined || !aDays){
                aMonth = true;
                aDays = 0;
            }
            var service = {
                service_name: aName,
                service_days: aDays,
                item_cost: aSum,
                service_month: aMonth
            };
            //model.qServiceList.push(obj);
            model.qServiceList.insert();
            model.qServiceList.cursor.service_id = model.qServiceList.cursor.bill_services_id;
            model.qServiceList.cursor.item_cost = aSum;
            model.qServiceList.cursor.service_days = aDays;
            model.qServiceList.cursor.service_month = aMonth;
            model.qServiceList.cursor.service_name = aName;
            model.qServiceList.cursor.locked = aLock;
            model.qServiceList.cursor.start_date = new Date();
            model.qServiceList.cursor.after_days = anAfterMonth;
            if(admin && getAdminAccess()) 
                model.qServiceList.cursor.admin = true;
            model.save();
            eventProcessor.addEvent('serviceCreated', service);
            return true;
        };
    };
});
