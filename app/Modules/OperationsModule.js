/**
 * @author Work
 * @stateless
 */
define('OperationsModule', ['orm', 'Messages', 'Events', 'rpc', 'logger'],
        function (Orm, Messages, Events, Rpc, Logger, ModuleName) {
            return function () {
                var self = this, model = Orm.loadModel(ModuleName);
                var msg = new Messages();
                var events = new Events();
                var accountsModule = new Rpc.Proxy('AccountsModule');
                var discountModule = new Rpc.Proxy('DiscountModule');
                var metrika = new Rpc.Proxy('MetrikaTestModule');
                
                var M_BILL_OP_CREATE = 10;
                var M_BILL_SET_OP_DONE = 11;
                var M_BILL_SET_OP_PLANNED = 12;
                
                /*
                 * Обработчик события списания денег по услуге
                 * @returns {undefined}
                 */
                function operationServiceHandler (accountId, callback, errorCallback){
                    require('BillServicesModule', function(m){
                        var bsm = new m(); 
                        bsm.GetServiceOnAccount(accountId, null, null, function(res){
                            var serviceAccountsId = res.result[0].bill_services_accounts_id;
                            var serviceType = res.result[0].service_type_id;
                            if(serviceType == 'CounterServiceModule' || serviceType == 'PeriodCounterServiceModule') {
                                bsm.SetCounterService(null, null, serviceAccountsId, null, function(res){
                                    callback(res);
                                }, function(err){
                                    errorCallback(err);
                                });
                            } else if(serviceType == 'Unlimited') {
                                callback({res: 'Unlimited'});
                            } else {
                                errorCallback({error: 'There is no necessary service'});
                            }
                        }, function(err){
                            callback();
                        });
                    }, function(e){
                        errorCallback(e);
                    });
                }
                
                /*
                 * Добавить новую оперцию по счету
                 * Если передается aServiceId, то будет СПИСАНА сумма равная стоимости этой услуги!!!
                 * @param {type} anAccountId
                 * @param {type} aSum
                 * @param {type} anOperationType
                 * @param {type} aCallback
                 * @returns {undefined}
                 */
                self.createOperation = function (anAccountId, aSum, anOperationType, servicesOnAccountId, aServiceId, aCallback, aErrCallback) {
                    metrika.shot(M_BILL_OP_CREATE, function(){});
                    if (!anAccountId){
                        aErrCallback({error: msg.get('reqFields')});
                        return;
                    }
                    var ruleId = null;
                    //withdraw - снять; replenish - пополнить
                    anOperationType = anOperationType ? anOperationType = 'withdraw' : anOperationType = 'replenish';
                    if(anOperationType == 'replenish'){
                        discountModule.onBalanceAdd(anAccountId, aSum, function(res){
                            ruleId = res.rule_id ? res.rule_id : null;
                            createOperation();
                        }, function(){
                            createOperation();
                        });
                    } else {
                        discountModule.onBalanceDel(anAccountId, aSum, function(res){
                            aSum = res.new_sum ? res.new_sum : aSum;
                            ruleId = res.rule_id ? res.rule_id : null;
                            createOperation();
                        }, function(){
                            createOperation();
                        });
                    }
                    function createOperation(){    
                        //model.qBillAccounts.params.account_id = +anAccountId;
                        model.qBillAccounts.query({account_id: +anAccountId}, function (qBillAccounts) {
                            if (qBillAccounts.length) {
                                var operation = {
                                    account_id: anAccountId,
                                    operation_sum: aSum,
                                    operation_date: new Date(),
                                    operation_type: anOperationType,
                                    operation_status: self.getStatusId('processing'),
                                    bill_services_accounts: servicesOnAccountId,
                                    discount_rule: ruleId
                                };
                                function save(){
                                    model.qBillOperations.push(operation);
                                    model.save(function () {
                                        operation.id = model.qBillOperations.cursor.bill_operations_id;
                                        aCallback(operation);
                                    }, function(){
                                        model.revert();
                                        aErrCallback({error: msg.get('errSaving')});
                                    });
                                }
                                if(aServiceId){ 
                                    operationServiceHandler(anAccountId, function(){
                                        model.qServiceList.query({deleted: false, service_id: +aServiceId}, function(service){
                                            if(service.length){
                                                operation.cost_id = service[0].bill_cost_id;
                                                operation.operation_sum = aSum ? aSum : service[0].service_cost;
                                                operation.operation_type = 'withdraw';
                                                save();
                                            } else {
                                                aErrCallback({error: msg.get('errFindService')});
                                            }
                                        }, function(){
                                            aErrCallback({error: msg.get('errQuery')});
                                        });
                                    }, function(err){
                                        aErrCallback(err);
                                    });
                                } else {
                                    save();
                                }
                            } else {
                                aErrCallback({error: msg.get('errFindAccount')});
                            }
                        }, function(err){
                            Logger.severe(err);
                            aErrCallback({error: msg.get('errQuery')});
                        });
                    }
                };


                /*
                 * Пометить операцию успешной
                 * TODO добавить сюда логгер
                 */
                self.setOperationDone = function (anOperationId, aCallback, aErrCallback) {
                    metrika.shot(M_BILL_SET_OP_DONE, function(){});
                    model.qBillOperations.params.operation_id = +anOperationId;
                    model.qBillOperations.requery(function () {
                        if (model.qBillOperations.length) {
                            model.qBillAccounts.params.account_id = model.qBillOperations[0].account_id;
                            model.qBillAccounts.query({account_id: model.qBillOperations[0].account_id}, function (qBillAccounts) {
                                if (qBillAccounts.length) {
                                    if (getMultiplier(model.qBillOperations[0].operation_type) === -1) { // операция списания
                                        accountsModule.getSumFromAccount(model.qBillOperations[0].account_id, function (res) {
                                            if (res.sum && res.sum >= model.qBillOperations[0].operation_sum) {
                                                model.qBillOperations[0].operation_status = self.getStatusId('done');
                                                model.save(function () {
                                                    aCallback({result: "ok"});
                                                }, function(){
                                                    aErrCallback({error: msg.get('errSaving')});
                                                });
                                            } else {
                                                model.qBillOperations[0].operation_status = self.getStatusId('canceled');
                                                model.save(function () {
                                                    aErrCallback({error: msg.get('errNoMoney')});
                                                }, function(){
                                                    aErrCallback({error: msg.get('errSaving')});
                                                });
                                            }
                                        }, function(){
                                            aErrCallback({error: msg.get('errQuery')});
                                        });
                                    } else {
                                        model.qBillOperations[0].operation_status = self.getStatusId('done');
                                        model.save(function () {
                                            aCallback({result: "ok"});
                                        }, function(){
                                            aErrCallback({error: msg.get('errSaving')});
                                        });
                                    }
                                } else {
                                    aErrCallback({error: msg.get('errFindAccount')});
                                }
                            }, function(){
                                aErrCallback({error: msg.get('errQuery')});
                            });
                        } else {
                            aErrCallback({error: msg.get('errFindOperation')});
                        }
                    }, function(){
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };

                /*
                 * Запланировать оперцию на срок aDate
                 * @param {type} anOperationId
                 * @param {type} aDate
                 * @param {type} aCallback
                 * @returns {undefined}
                 */
                self.setOperationPlanned = function (anOperationId, aDate, aCallback, aErrCallback) {
                    model.qBillOperations.params.operation_id = +anOperationId;
                    metrika.shot(M_BILL_SET_OP_PLANNED, function(){});
                    if (aDate) {
                        aDate = new Date(aDate);
                        //TODO убрал условие, чтобы выполнялись тесты. 
                        if ((new Date()) < aDate.valueOf()) {
                            model.qBillOperations.requery(function () {
                                if (model.qBillOperations.length) {
                                    model.qBillOperations[0].operation_date = aDate;
                                    model.qBillOperations[0].operation_status = self.getStatusId('planned');
                                    model.save(function () {
                                        aCallback({result: "ok"});
                                    }, function(){
                                        aErrCallback({error: msg.get('errSaving')});
                                    });
                                } else {
                                    aErrCallback({error: msg.get('errFindOperation')});
                                }
                            }, function(){
                                aErrCallback({error: msg.get('errQuery')});
                            });
                        } else {
                            aErrCallback({error: msg.get('errWrongDate')});
                        }
                    } else {
                        aErrCallback({error: msg.get('errUnknownDate')});
                    }
                };

                /*
                 * Поулчить все операции по аккаунту
                 * TODO добавить limit 
                 */
                self.getOperations = function (anAccountId, anOperationType, anOperationStatus, aCallback, aErrCallback) {
                    model.qBillOperationsOnAccount.params.account_id = +anAccountId;
                    model.qBillOperationsOnAccount.params.type = (anOperationType ? anOperationType : null);
                    model.qBillOperationsOnAccount.params.status = (anOperationStatus ? self.getStatusId(anOperationStatus) : null);
                    model.qBillOperationsOnAccount.requery(function () {
                        if (model.qBillOperationsOnAccount.length) {
                            aCallback({result: model.qBillOperationsOnAccount});
                        } else {
                            aCallback({info: msg.get('errFindOperation'), result: []});
                        }
                    }, function(){
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };
                
                model.qBillOperationsTypes.requery();
                
                function getMultiplier(aOperationType) {
                    var multiplier = null;
                    model.qBillOperationsTypes.forEach(function (cursor) {
                        if (cursor.bill_operations_type_id == aOperationType)
                            multiplier = cursor.multiplier;
                    });
                    return multiplier;
                }
                
                model.qBillOperationStatus.requery();
                
                self.getStatusId = function (aShortName) {
                    var operationStatus = null;
                    model.qBillOperationStatus.forEach(function (cursor) {
                        if (cursor.short_name == aShortName)
                            operationStatus = cursor.bill_operations_status_id;
                    });
                    return operationStatus;
                };
                
                /*
                 * Получить все статусы операций
                 */
                self.getAllOperationsStatuses = function(aCallback, aErrCallback){
                    if(model.qBillOperationStatus.length)
                        aCallback(model.qBillOperationStatus);
                    else
                        aErrCallback({error: 'empty'});
                };
                
                /*
                 * Получить все типы операций
                 */
                self.getAllOperationsTypes = function(aCallback, aErrCallback){
                    if(model.qBillOperationsTypes.length)
                        aCallback(model.qBillOperationsTypes);
                    else
                        aErrCallback({error: 'empty'});
                };
            };
        });
