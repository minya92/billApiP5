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
        self.CreateService = function (aName, aCost, aDays, aLock, anAfterMonth, aPrepayment, anOnce, aCallBack) {
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
                locked: aLock
            });
            model.save();
            model.qServiceSetting.push({
                service_id: model.qServiceList[model.qServiceList.length - 1].bill_services_id,
                service_cost: aCost,
                service_days: aDays,
                service_month: anAfterMonth,
                start_date: new Date(),
                prepayment: aPrepayment,
                once: anOnce
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
        self.ChangeService = function (aServiceId, aCost, aDays, anAfterMonth, aPrepayment, anOnce, aCallBack) {
            function closeCostCallback(){
                model.qServiceSetting.push({
                    service_id: aServiceId,
                    service_cost: aCost,
                    service_days: aDays,
                    service_month: anAfterMonth,
                    start_date: new Date(),
                    prepayment: aPrepayment,
                    once: anOnce
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
                    model.qCloseCostService.execute(closeCostCallback, closeCostCallback);
                } else {
                    aCallBack({error: msg.get('errFindService')});
                }
            });
        }

        /*
         * Добавление услуги на лицевой счет
         */
        self.AddServiceOnAccount = function (anAccountId, aServiceId, aCallback) {
            function addService(account_id, service_id) {
                model.qAddService.push({
                    account_id: account_id,
                    service_id: service_id,
                    service_start_date: new Date()
                });
                model.save();
                aCallback({
                    result: model.qAddService[0].bill_services_accounts_id,
                    error: null
                });
            }
            function createOperationCallback(operation) {
                if (operation.id) { // удалось провести операцию
                    operations.setOperationDone(operation.id, function (status) { //пометить выполненной
                        if (status.result) {
                            addService();
                        } else {
                            aCallback({error: status.error});
                        }
                    });
                } else {
                    aCallback({error: operation.error});
                }
            }
            accounts.getSumFromAccount(anAccountId, function (res) {
                if (!res.error) {
                    model.qServiceList.params.service_id = +aServiceId;
                    model.qServiceList.requery(function () {
                        if (model.qServiceList.length) {
                            if (model.qServiceList[0].prepayment) { // предоплата
                                if (res.sum >= model.qServiceList[0].service_cost) {
                                    operations.createOperation(anAccountId, model.qServiceList[0].service_cost, 'withdraw', createOperationCallback);
                                } else {
                                    aCallback({error: msg.get('errNoMoney')});
                                }
                            } else {
                                addService();
                            }
                        } else {
                            aCallback({error: msg.get('errFindService')});
                        }
                    });
                } else {
                    aCallback({error: res.error});
                }
            });
        };
    };
});
