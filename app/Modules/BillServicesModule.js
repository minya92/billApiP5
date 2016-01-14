/**
 * 
 * @author Work
 * @module BillServicesModule
 */
define(['orm', 'AccountsModule', 'Messages', 'Events'], function (Orm, AccountsModule, Messages, Events, ModuleName) {
    return function () {
        var self = this, model = Orm.loadModel(ModuleName);
        var accountsModule = new AccountsModule();
        var msg = new Messages();
        var events = new Events();
        
        var ERRORS = {
            FIND_ACCOUNT_ID: "Аккаунт с таким ID не найден",
            FIND_SERVICE_ID: "Услуга с таким ID не найдена",
            LOST_MONEY: "Недостаточно средств на счету",
            INVALID_OP_ID: "Неверный ID операции",
            SERVICE_ADDED: "Услуга уже добавлена на лицевой счет",
            SERVICE_LOCKED: "Ошибка удаления услуги с аккаунта. Услуга заблокирована для удаления!"
        };

        self.execute = function () {
            // TODO : place application code here
        };
        
        /* Получить услугу или все услуги
         * @param {type} aServiceId
         * @param {type} aCallBack
         * @returns {undefined}
         */
        self.GetService = function(aServiceId, aCallBack){
            aServiceId = aServiceId ? +aServiceId : null;
            model.qServiceList.params.service_id = aServiceId;
            model.qServiceList.requery(function(){
                if(model.qServiceList.length){
                    aCallBack({services: model.qServiceList, error : null});
                } else {
                    aCallBack({services:null, error: msg.get('errFindService')});
                }
            });
        };
        
        /*
         * Создание новой услуги
         * aDays - промежуток дней для снятия абонентской платы
         * aDays (null) - ежемесячное списание абонентской платы
         * aPrepayment - if true списать деньги сразу при активации услуги
         * anOnce - одноразовая
         * @param {type} aName
         * @param {type} aSum
         * @param {type} aDays
         * @returns {Boolean}
         */
        self.CreateService = function (aName, aSum, aDays, aLock, anAfterMonth, aPrepayment, anOnce, aCallBack) {
            anAfterMonth = anAfterMonth ? true : null;
            aPrepayment = aPrepayment ? true : null;
            anOnce = anOnce ? true : null;
            if (aDays == false || aDays == 0 || aDays == null || aDays === undefined || !aDays) {
                anAfterMonth = true;
                aDays = 0;
            }
            model.qServiceList.push({
                service_name: aName,
                locked: aLock,
            });
            model.qServiceSetting.push({
                service_id: model.qServiceList[0].bill_services_id,
                item_cost: aSum,
                service_days: aDays,
                service_month: anAfterMonth,
                start_date: new Date(),
                prepayment: aPrepayment,
                once: anOnce
            });
            model.save(function () {
                aCallBack(model.qServiceList[0].bill_services_id);
            });
        };

        self.AddServiceOnAccount = function (anAccountId, aServiceId, aCallback) {
            var error = null;
            accountsModule.getSumFromAccount(anAccountId, function(res){
                if(!res.error){
                    model.qServiceList.params.service_id = +aServiceId;
                    model.qServiceList.requery(function(){
                        if(model.qServiceList.length){
                            model.qAddService.push({
                                account_id  : anAccountId,
                                service_id : aServiceId,
                                service_start_date : new Date()
                            });
                            model.save();
                            aCallback({result : model.qAddService[0].bill_services_accounts_id, error : error});
                        } else {
                            aCallback({error : msg.get('errFindService')});
                        }
                    })
                } else {
                    aCallback({error : msg.get('errFindAccount')});
                }
            });
        }
    };
});
