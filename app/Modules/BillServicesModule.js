/**
 * 
 * @author Work
 * @module BillServicesModule
 */
define(['orm', 'AccountsModule', 'Messages', 'Events', 'OperationsModule'], function (Orm, AccountsModule, Messages, Events, OperationsModule, ModuleName) {
    return function () {
        var self = this, model = Orm.loadModel(ModuleName);
        var accounts = new AccountsModule();
        var operations = new OperationsModule();
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
        self.GetService = function (aServiceId, aCallBack) {
            aServiceId = aServiceId ? +aServiceId : null;
            model.qServiceList.params.service_id = aServiceId;
            model.qServiceList.requery(function () {
                if (model.qServiceList.length) {
                    aCallBack({services: model.qServiceList, error: null});
                } else {
                    aCallBack({services: null, error: msg.get('errFindService')});
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
        self.CreateService = function (aName, aCost, aDays, aLock, anAfterMonth, aPrepayment, anOnce, aCounter, aCallBack) {
            var service_type = aCounter ? 'CounterServiceModule' : 'PeriodServiceModule'
            aPrepayment = aPrepayment ? true : null;
            anOnce = anOnce ? true : null;
            if (aDays == false || aDays == 0 || aDays == null || aDays === undefined || !aDays) {
                anAfterMonth = true;
                aDays = 0;
            } else {
                anAfterMonth = null;
            }
            model.qServiceList.push({
                service_name: aName,
                locked: aLock,
                service_type_id: service_type
            });
            model.save();
            model.qServiceSetting.push({
                service_id: model.qServiceList[model.qServiceList.length - 1].bill_services_id,
                service_cost: aCost,
                service_days: aDays,
                service_month: anAfterMonth,
                start_date: new Date(),
                prepayment: aPrepayment,
                once: anOnce,
                cost_counts: (aCounter ? +aCounter : null)
            });
            model.save(function () {
                aCallBack(model.qServiceList[model.qServiceList.length - 1].bill_services_id);
            });
        };

        /*
         * Изменение существующей услуги
         * @param {type} aServiceId
         * @param {type} aSum
         * @param {type} aDays
         * @param {type} anAfterMonth
         * @param {type} aPrepayment
         * @param {type} anOnce
         * @param {type} aCallBack
         * @returns {undefined} 
         */
        self.ChangeService = function (aServiceId, aCost, aDays, anAfterMonth, aPrepayment, anOnce, aCounter, aCallBack) {
            function closeCostCallback() {
                model.qServiceSetting.push({
                    service_id: aServiceId,
                    service_cost: aCost,
                    service_days: aDays,
                    service_month: anAfterMonth,
                    start_date: new Date(),
                    prepayment: aPrepayment,
                    once: anOnce,
                    cost_counts: (aCounter ? +aCounter : null)
                });
                model.save(function () {
                    aCallBack(aServiceId);
                });
            }
            model.qServiceList.params.service_id = +aServiceId;
            model.qServiceList.requery(function () {
                if (model.qServiceList.length) {
                    aPrepayment = (aPrepayment == false ? false : model.qServiceList[0].prepayment);
                    anAfterMonth = (anAfterMonth == false ? false : model.qServiceList[0].service_month);
                    anOnce = (anOnce == false ? false : model.qServiceList[0].once);
                    aCost = (aCost ? aCost : model.qServiceList[0].service_cost);
                    aDays = (aDays ? aDays : model.qServiceList[0].service_days);
                    model.qCloseCostService.params.service_id = +aServiceId;
                    model.qCloseCostService.executeUpdate(closeCostCallback);
                } else {
                    aCallBack({error: msg.get('errFindService')});
                }
            });
        };

        /*
         * Добавление услуги на лицевой счет
         */
        self.AddServiceOnAccount = function (anAccountId, aServiceId, aCallback) {
            var servicesOnAccountId = null; 
            function addService() {
                model.qAddService.push({
                    account_id: anAccountId,
                    service_id: aServiceId,
                    service_start_date: new Date(),
                    service_counts: model.qServiceList[0].cost_counts
                });
                model.save();
                servicesOnAccountId = model.qAddService[model.qAddService.length - 1].bill_services_accounts_id;
                aCallback({
                    result: servicesOnAccountId,
                    error: null
                });
            }
            function setOperationDone(date) {
                return function(operation){
                    function setStatus(status){
                        if (status.result) {
                            addService();
                        } else {
                            aCallback({error: status.error});
                        }
                    }
                    if (operation.id) { // удалось провести операцию
                        if(!date)
                            operations.setOperationDone(operation.id, setStatus);
                        else
                            operations.setOperationPlanned(operation.id, date, setStatus);
                    } else {
                        aCallback({error: operation.error});
                    }
                };
            }
            accounts.getSumFromAccount(anAccountId, function (res) {
                if (!res.error) {
                    model.qServiceList.params.service_id = +aServiceId;
                    model.qServiceList.requery(function () {
                        if (model.qServiceList.length) {
                            if (model.qServiceList[0].prepayment) { // предоплата
                                if (res.sum >= model.qServiceList[0].service_cost) {
                                    operations.createOperation(anAccountId, model.qServiceList[0].service_cost, 'withdraw', servicesOnAccountId,(setOperationDone()));
                                } else {
                                    aCallback({error: msg.get('errNoMoney')});
                                    return true;
                                }
                            }  
                            var date = new Date();
                            if(model.qServiceList[0].service_month)
                                date.setMonth(date.getMonth() + 1);
                            else
                                date.setDate(date.getDate() + model.qServiceList[0].service_days);
                            operations.createOperation(anAccountId, model.qServiceList[0].service_cost, 'withdraw', servicesOnAccountId,(setOperationDone(date))); 
                        } else {
                            aCallback({error: msg.get('errFindService')});
                        }
                    });
                } else {
                    aCallback({error: res.error});
                }
            });
        };
        
        self.UnsubscribeService = function(aServiceId, aCallback){
            model.qAddService.params.service_id = +aServiceId;
            model.qAddService.requery(function(){
                if(model.qAddService.length){
                    var mas = model.qAddService;
                    var length = model.qAddService.length;
                    for(var i = 0; i < length; i++){
                        (function(i, mas, length){
                            self.DisableService(mas[i].account_id, aServiceId, null, function(status){
                                if(status.result){
                                    if(i == length - 1)
                                        aCallback({result: "ok", service_id: aServiceId});
                                } else {
                                    aCallback({error: status.error, accounts: model.qAddService});
                                }
                            });
                        })(i, mas, length);
                    }
                } else {
                    aCallback({error: msg.get('errFindServiceOnAccount'), accounts: model.qAddService});
                }
            });
        };
        
        /*
         * Удалить услугу
         * unsubscrible - сначала отключить ее у всех пользователей (если нет, не удалится)
         */
        self.DeleteService = function(aServiceId, unsubscribe, aCallback){
            function delService(){
                model.qServiceList.params.service_id = +aServiceId;
                model.qServiceList.requery(function(){
                    if(model.qServiceList.length){
                        model.qServiceList.splice(0, 1);
                        model.save();
                        aCallback({result: "ok", error: null});
                    } else {
                        aCallback({error: msg.get('errFindService')})
                    }
                });
            }
            if (typeof(unsubscribe) == 'function') {
                aCallback = unsubscribe;
                unsubscribe = null;
            }
            model.qAddService.params.service_id = +aServiceId;
            model.qAddService.requery(function(){
                if(model.qAddService.length){
                    if(unsubscribe){
                        self.UnsubscribeService(aServiceId, function(res){
                            if(res.result)
                                delService();
                            else
                                aCallback({error: res.error});
                        });
                    } else {
                        aCallback({error: msg.get('errDeleteService'), accounts: model.qAddService});
                    }
                } else {
                    delService();
                }
            });
        };
        
        function getServiceOnAccount(anAccountId, aServiceId, aServiceAccountId, aCallback){
            anAccountId = anAccountId ? +anAccountId : null;
            aServiceId = aServiceId ? +aServiceId : null;
            aServiceAccountId = aServiceAccountId ? +aServiceAccountId : null;
            model.qAddService.params.service_id = aServiceId;
            model.qAddService.params.account_id = anAccountId;
            model.qAddService.params.service_account_id = aServiceAccountId;
            model.qAddService.requery(aCallback);
            //TODO сюда добавить проверку, если больше одной то не давать ниче делать!
        }
        
        /*
         * Отключить услугу на выбранном счету
         */
        self.DisableService = function (anAccountId, aServiceId, aServiceAccountId, aCallback) {
            getServiceOnAccount(anAccountId, aServiceId, aServiceAccountId, function () {
                if (model.qAddService.length) {
                    var service_account_id = model.qAddService[model.qAddService.length - 1].bill_services_accounts_id;
                    model.qAddService.splice(model.qAddService.length - 1, 1);
                    model.save();
                    aCallback({result: "ok", service_account_id : service_account_id, error: null});
                } else {
                    aCallback({error: msg.get('errFindServiceOnAccount')});
                }
            });
        };
        
        /*
         * Список всех услуг на аккаунте
         * либо инфа по конкретной услуге
         * @param {type} anAccountId
         * @param {type} cb
         * @returns {undefined}
         */
        self.GetServiceOnAccount = function(anAccountId, aServiceId, aServiceAccountId, cb){
            getServiceOnAccount(anAccountId, aServiceId, aServiceAccountId, function(){
                if(model.qAddService.lenght){
                   cb({error: null, result: model.qAddService});
                } else {
                    cb({error: msg.get('errFindAccount'), result: model.qAddService});
                }
            });
        };
        
        /*
         * Приотсановить услугу
         */
        self.PauseService = function (anAccountId, aServiceId, aServiceAccountId, aCallback) {
            getServiceOnAccount(anAccountId, aServiceId, aServiceAccountId, function () {
                if (model.qAddService.length) {
                    var service_account_id = model.qAddService[model.qAddService.length - 1].bill_services_accounts_id;
                    model.qAddService[model.qAddService.length - 1].paused = true;
                    model.save();
                    aCallback({result: "ok", service_account_id : service_account_id, error: null});
                } else {
                    aCallback({error: msg.get('errFindServiceOnAccount')});
                }
            });
        };
        
        /*
         * изменить счетчик у услги на счету
         */
        self.SetCounterService = function (anAccountId, aServiceId, aServiceAccountId, aCount, aCallback) {
            getServiceOnAccount(anAccountId, aServiceId, aServiceAccountId, function(){
                if(model.qAddService.length) {
                    model.qAddService[0].service_counts = model.qAddService[0].service_counts - (aCount?aCount:1);
                    model.save();
                    aCallback({result: model.qAddService, service_counts : model.qAddService[0].service_counts, error: null});
                } else {
                    aCallback({error: msg.get('errFindServiceOnAccount')});
                }
            });
        };
    };
});
