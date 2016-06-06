/**
 * @author Work
 */
define('BillServicesModule', ['orm', 'AccountsModule', 'Messages', 'Events', 'OperationsModule'],
        function (Orm, AccountsModule, Messages, Events, OperationsModule, ModuleName) {
            return function () {
                var self = this, model = Orm.loadModel(ModuleName);
                var accounts = new AccountsModule();
                var operations = new OperationsModule();
                var msg = new Messages();
                var events = new Events();

                /* Получить услугу или все услуги
                 * @param {type} aServiceId
                 * @param {type} aCallBack
                 * @returns {undefined}
                 */
                self.GetService = function (aServiceId, aDeleted, aCallBack, aErrCallback) {
                    aServiceId = aServiceId ? +aServiceId : null;
                    model.qServiceList.params.service_id = aServiceId;
                    model.qServiceList.params.deleted = aDeleted ? true : false;
                    model.qServiceList.requery(function () {
                        if (model.qServiceList.length) {
                            aCallBack({services: model.qServiceList});
                        } else {
                            aErrCallback({error: msg.get('errFindService')});
                        }
                    }, function () {
                        aErrCallback({error: msg.get('errQuery')});
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
                self.CreateService = function (aName, aCost, aDays, aLock, anAfterMonth, aPrepayment, anOnce, aCounter, aType, aCallBack, aErrCallback) {
//                    var service_type = aCounter ? 'CounterServiceModule' : 'PeriodServiceModule'
                    var service_type = !aType? 'PeriodServiceModule' : aType;
                    aPrepayment = !aPrepayment? null : true;
                    anOnce = !anOnce ? null : true;
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
                    }, function () {
                        aErrCallback({error: msg.get('errSaving')});
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
                self.ChangeService = function (aServiceId, aCost, aDays, anAfterMonth, aPrepayment, anOnce, aCounter, aType, aCallBack, aErrCallback) {
                    function closeCostCallback(result) {
                        model.qServiceSetting.push({
                            service_id: aServiceId,
                            service_cost: aCost,
                            service_days: aDays,
                            service_month: anAfterMonth,
                            start_date: new Date(),
                            prepayment: aPrepayment,
                            once: anOnce,
                            service_type_id: aType,
                            cost_counts: (aCounter ? +aCounter : null)
                        });
                        model.save(function () {
                            model.qServiceList.params.service_id = +aServiceId;
                            model.qServiceList.requery(function () {
                                aCallBack(model.qServiceList[0]);
                            }, function () {
                                aErrCallback({error: msg.get('errQuery')});
                            });
                        }, function () {
                            aErrCallback({error: msg.get('errSaving')});
                        });
                    }
                    model.qServiceList.params.service_id = +aServiceId;
                    model.qServiceList.requery(function () {
                        if (model.qServiceList.length) {
                            aPrepayment = (typeof aPrepayment != 'undefined') ?  aPrepayment : model.qServiceList[0].prepayment;
                            anAfterMonth = (typeof anAfterMonth != 'undefined') ? anAfterMonth : model.qServiceList[0].service_month;
                            anOnce = (typeof anOnce != 'undefined') ? anOnce : model.qServiceList[0].once;
                            aCost = (aCost ? aCost : model.qServiceList[0].service_cost);
                            aDays = (aDays ? aDays : model.qServiceList[0].service_days);
                            model.qCloseCostService.params.service_id = +aServiceId;
                            model.qCloseCostService.executeUpdate(closeCostCallback, closeCostCallback);
                        } else {
                            aErrCallback({error: msg.get('errFindService')});
                        }
                    }, function () {
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };

                /*
                 * Добавление услуги на лицевой счет
                 */
                self.AddServiceOnAccount = function (anAccountId, aServiceId, aCallback, aErrCallback) {
                    var servicesOnAccountId = null;
                    function addService() {
                        model.qAddService.push({
                            account_id: anAccountId,
                            service_id: aServiceId,
                            service_start_date: new Date(),
                            service_counts: model.qServiceList[0].cost_counts
                        });
                        model.save(function () {
                            servicesOnAccountId = model.qAddService[model.qAddService.length - 1].bill_services_accounts_id;
                            aCallback({
                                result: servicesOnAccountId
                            });
                        }, function () {
                            aErrCallback({error: msg.get('errSaving')});
                        });
                    }
                    function setOperationDone(date) {
                        return function (operation) {
                            function setStatus(status) {
                                if (status.result) {
                                    addService();
                                } else {
                                    aErrCallback({error: status.error});
                                }
                            }
                            if (operation.id) { // удалось провести операцию
                                if (date)
                                    operations.setOperationPlanned(operation.id, date, setStatus, setStatus);
                                else
                                    operations.setOperationDone(operation.id, setStatus, setStatus);
                            } else {
                                aErrCallback({error: operation.error});
                            }
                        };
                    }
                    accounts.getSumFromAccount(anAccountId, function (res) {
                        model.qServiceList.params.service_id = +aServiceId;
                        model.qServiceList.requery(function () {
                            if (model.qServiceList.length) {
                                var date = new Date();
                                if (model.qServiceList[0].service_month)
                                    date.setMonth(date.getMonth() + 1);
                                else
                                    date.setDate(date.getDate() + model.qServiceList[0].service_days);

                                if (model.qServiceList[0].prepayment) { // предоплата
                                    if (res.sum >= model.qServiceList[0].service_cost) {
                                        operations.createOperation(anAccountId, model.qServiceList[0].service_cost, 'withdraw', servicesOnAccountId, function (op) {
                                            if (op.id) {
                                                operations.setOperationDone(op.id, function () {
                                                    operations.createOperation(anAccountId, model.qServiceList[0].service_cost, 'withdraw', servicesOnAccountId, (setOperationDone(date)), (setOperationDone()));
                                                }, function (err) {
                                                    aErrCallback({error: err});
                                                });
                                            } else {
                                                aErrCallback({error: op.error});
                                            }
                                        }, (setOperationDone()));
                                    } else {
                                        aErrCallback({error: msg.get('errNoMoney')});
                                    }
                                } else { // без предоплаты
                                    operations.createOperation(anAccountId, model.qServiceList[0].service_cost, 'withdraw', servicesOnAccountId, (setOperationDone(date)), (setOperationDone()));
                                }
                            } else {
                                aErrCallback({error: msg.get('errFindService')});
                            }
                        });
                    }, function () {
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };

                self.UnsubscribeService = function (aServiceId, aCallback, aErrCallback) {
                    model.qAddService.params.service_id = +aServiceId;
                    model.qAddService.requery(function () {
                        if (model.qAddService.length) {
                            var mas = model.qAddService;
                            var length = model.qAddService.length;
                            for (var i = 0; i < length; i++) {
                                (function (i, mas, length) {
                                    self.DisableService(mas[i].account_id, aServiceId, null, function (status) {
                                        if (status.result) {
                                            if (i == length - 1)
                                                aCallback({result: "ok", service_id: aServiceId});
                                        } else {
                                            aErrCallback({error: status.error, accounts: model.qAddService});
                                        }
                                    });
                                })(i, mas, length);
                            }
                        } else {
                            aErrCallback({error: msg.get('errFindServiceOnAccount'), accounts: model.qAddService});
                        }
                    }, function () {
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };

                /*
                 * Удалить услугу (сдалать неактивной) 
                 * unsubscrible - сначала отключить ее у всех пользователей
                 */
                self.DeleteService = function (aServiceId, unsubscribe, aCallback, aErrCallback) {
                    function delService() {
                        model.qServiceList.params.service_id = +aServiceId;
                        model.qServiceList.requery(function () {
                            if (model.qServiceList.length) {
                                //model.qServiceList.splice(0, 1);
                                model.qServiceList[0].deleted = true;
                                model.save(function () {
                                    aCallback({result: "ok"});
                                }, function () {
                                    aErrCallback({error: msg.get('errSaving')});
                                });
                            } else {
                                aErrCallback({error: msg.get('errFindService')})
                            }
                        });
                    }
                    if (typeof (unsubscribe) == 'function') {
                        aErrCallback = aCallback;
                        aCallback = unsubscribe;
                        unsubscribe = null;
                    }
                    model.qAddService.params.service_id = +aServiceId;
                    model.qAddService.requery(function () {
                        if (model.qAddService.length) {
                            if (unsubscribe) {
                                self.UnsubscribeService(aServiceId, function (res) {
                                    if (res.result)
                                        delService();
                                    else
                                        aErrCallback({error: res.error});
                                });
                            } else {
                                //aErrCallback({error: msg.get('errDeleteService'), accounts: model.qAddService});
                                delService();
                            }
                        } else {
                            delService();
                        }
                    }, function () {
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };

                self.EnableService = function (aServiceId, aCallback, aErrCallback) {
                    model.qDelService.params.service_id = +aServiceId;
                    model.qDelService.requery(function () {
                        if (model.qDelService.length) {
                            model.qDelService[0].deleted = false;
                            model.save(function () {
                                aCallback({result: "ok"});
                            }, function () {
                                aErrCallback({error: msg.get('errSaving')});
                            });
                        } else {
                            aErrCallback({error: msg.get('errFindService')});
                        }
                    });
                };

                self.HardDeleteService = function (aServiceId, aCallback, aErrCallback) {
                    model.qDelService.params.service_id = +aServiceId;
                    model.qDelService.requery(function () {
                        if (model.qDelService.length) {
                            if (model.qDelService[0].deleted) {
                                model.qDelService.splice(0, 1);
                                model.save(function () {
                                    aCallback({result: "ok"});
                                }, function () {
                                    aErrCallback({error: msg.get('errSaving')});
                                });
                            } else {
                                aErrCallback({error: msg.get('errHardDeleteService')});
                            }
                        } else {
                            aErrCallback({error: msg.get('errFindService')});
                        }
                    });
                };

                function getServiceOnAccount(anAccountId, aServiceId, aServiceAccountId, aCallback, aErrCallback) {
                    anAccountId = anAccountId ? +anAccountId : null;
                    aServiceId = aServiceId ? +aServiceId : null;
                    aServiceAccountId = aServiceAccountId ? +aServiceAccountId : null;
                    model.qAddService.params.service_id = aServiceId;
                    model.qAddService.params.account_id = anAccountId;
                    model.qAddService.params.service_account_id = aServiceAccountId;
                    model.qAddService.requery(aCallback, aErrCallback);
                    //TODO сюда добавить проверку, если больше одной то не давать ниче делать!
                }

                /*
                 * Отключить услугу на выбранном счету
                 */
                self.DisableService = function (anAccountId, aServiceId, aServiceAccountId, aCallback, aErrCallback) {
                    getServiceOnAccount(anAccountId, aServiceId, aServiceAccountId, function () {
                        if (model.qAddService.length) {
                            var service_account_id = model.qAddService[model.qAddService.length - 1].bill_services_accounts_id;
                            model.qAddService.splice(model.qAddService.length - 1, 1);
                            model.save(function () {
                                aCallback({result: "ok", service_account_id: service_account_id});
                            }, function () {
                                aErrCallback({error: msg.get('errSaving')});
                            });
                        } else {
                            aErrCallback({error: msg.get('errFindServiceOnAccount')});
                        }
                    }, function () {
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };

                /*
                 * Список всех услуг на аккаунте
                 * либо инфа по конкретной услуге
                 * @param {type} anAccountId
                 * @param {type} cb
                 * @returns {undefined}
                 */
                self.GetServiceOnAccount = function (anAccountId, aServiceId, aServiceAccountId, aCallback, aErrCallback) {
                    getServiceOnAccount(anAccountId, aServiceId, aServiceAccountId, function () {
                        if (model.qAddService.length) {
                            aCallback({result: model.qAddService});
                        } else {
                            aErrCallback({error: msg.get('errFindAccount'), result: model.qAddService});
                        }
                    }, function () {
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };

                /*
                 * Приотсановить услугу
                 */
                self.PauseService = function (anAccountId, aServiceId, aServiceAccountId, aCallback, aErrCallback) {
                    getServiceOnAccount(anAccountId, aServiceId, aServiceAccountId, function () {
                        if (model.qAddService.length) {
                            var service_account_id = model.qAddService[model.qAddService.length - 1].bill_services_accounts_id;
                            model.qAddService[model.qAddService.length - 1].paused = true;
                            model.save(function () {
                                aCallback({result: "ok", service_account_id: service_account_id});
                            }, function () {
                                aErrCallback({error: msg.get('errSaving')});
                            });
                        } else {
                            aErrCallback({error: msg.get('errFindServiceOnAccount')});
                        }
                    }, function () {
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };

                /*
                 * изменить счетчик у услги на счету
                 */
                self.SetCounterService = function (anAccountId, aServiceId, aServiceAccountId, aCount, aCallback, aErrCallback) {
                    getServiceOnAccount(anAccountId, aServiceId, aServiceAccountId, function () {
                        if (model.qAddService.length) {
                            model.qAddService[0].service_counts = model.qAddService[0].service_counts - (aCount ? aCount : 1);
                            model.save(function () {
                                aCallback({result: model.qAddService, service_counts: model.qAddService[0].service_counts});
                            }, function () {
                                aErrCallback({error: msg.get('errSaving')});
                            });
                        } else {
                            aErrCallback({error: msg.get('errFindServiceOnAccount')});
                        }
                    }, function () {
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };

                model.qBillServicesTypes.requery();

                /*
                 * Получить все типы услуг
                 */
                self.getAllServicesTypes = function (aCallback, aErrCallback) {
                    if (model.qBillServicesTypes.length)
                        aCallback(model.qBillServicesTypes);
                    else
                        aErrCallback({error: 'empty'});
                };
            };
        });
