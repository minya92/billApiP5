/**
 * @author Work
 */
define('OperationsModule', ['orm', 'Messages', 'Events', 'AccountsModule', 'logger'],
        function (Orm, Messages, Events, AccountsModule, Logger, ModuleName) {
            return function () {
                var self = this, model = Orm.loadModel(ModuleName);
                var msg = new Messages();
                var events = new Events();
                var accountsModule = new AccountsModule();

                /*
                 * Добавить новую оперцию по счету
                 * @param {type} anAccountId
                 * @param {type} aSum
                 * @param {type} anOperationType
                 * @param {type} aCallback
                 * @returns {undefined}
                 */
                self.createOperation = function (anAccountId, aSum, anOperationType, servicesOnAccountId, aCallback, aErrCallback) {
                    var error = null;
                    if (!anAccountId || !aSum)
                        error = msg.get("reqFields");
                    //withdraw - снять; replenish - пополнить
                    anOperationType = anOperationType ? anOperationType = 'withdraw' : anOperationType = 'replenish';
                    model.qBillAccounts.params.account_id = +anAccountId;
                    model.qBillAccounts.requery(function () {
                        if (model.qBillAccounts.length) {
                            var operation = {
                                account_id: anAccountId,
                                operation_sum: aSum,
                                operation_date: new Date(),
                                operation_type: anOperationType,
                                operation_status: self.getStatusId('processing'),
                                bill_services_accounts: servicesOnAccountId
                            };
                            model.qBillOperations.push(operation);
                            model.save(function () {
                                operation.id = model.qBillOperations[model.qBillOperations.length - 1].bill_operations_id;
                                aCallback(operation);
                            }, function(){
                                model.revert();
                                aErrCallback({error: msg.get('errSaving')});
                            });
                        } else {
                            aErrCallback({error: msg.get('errFindAccount')});
                        }
                    }, function(err){
                        Logger.severe(err);
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };

                //TODO продумать логику с операциями

                /*
                 * Пометить операцию успешной
                 * TODO добавить сюда логгер
                 */
                self.setOperationDone = function (anOperationId, aCallback, aErrCallback) {
                    model.qBillOperations.params.operation_id = +anOperationId;
                    model.qBillOperations.requery(function () {
                        if (model.qBillOperations.length) {
                            model.qBillAccounts.params.account_id = model.qBillOperations[0].account_id;
                            model.qBillAccounts.requery(function () {
                                if (model.qBillAccounts.length) {
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
                    if (aDate) {
                        aDate = new Date(aDate);
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
