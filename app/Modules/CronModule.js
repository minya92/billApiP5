/**
 * @author Work
 * @stateless
 */
define('CronModule', ['orm', 'rpc', 'Messages', 'Events', 'logger'],
        function (Orm, Rpc, Messages, Events, Log, ModuleName) {
            function module_constructor() {
                var self = this, model = Orm.loadModel(ModuleName);
                var msg = new Messages();
                var events = new Events();
                var accounts = new Rpc.Proxy('AccountsModule');
                var operations = new Rpc.Proxy('OperationsModule');
                var services = new Rpc.Proxy('BillServicesModule');

                self.execute = function () {
                    // TODO : place application code here
                };

                /*
                 * Проверить заплаированные операции на сегодня
                 * date - 11.23.2016
                 */
                self.CheckPlannedPayments = function (aDate, cb) {
                    model.qListPlannedOperations.params.pDate = aDate ? new Date(aDate) : null;
                    model.qListPlannedOperations.requery();
                    if (model.qListPlannedOperations.length) {
                            for (var i = 0; i < model.qListPlannedOperations.length; i++) {
                                (function (i) {
                                    accounts.getSumFromAccount(model.qListPlannedOperations[i].account_id, function (account) {
                                        if (!account.error) {
                                            var serviceAccountId = model.qListPlannedOperations[i].bill_services_accounts;
                                            model.qAddService.params.service_account_id = serviceAccountId;
                                            model.qAddService.requery();
                                            if(model.qAddService.length){
                                                var serviceCost = model.qAddService.cursor.service_cost;
                                                if (account.sum >= serviceCost) {
                                                    if(model.qListPlannedOperations[i].bill_services_accounts){
                                                        if(model.qAddService.cursor.service_days || model.qAddService.cursor.service_month){
                                                            if(!model.qAddService.cursor.paused){
                                                                var date;
                                                                if(aDate)
                                                                    date = new Date(aDate);
                                                                else
                                                                    date = new Date();
                                                                Log.info('\n !!!!!!!!!' + date);
                                                                if (model.qAddService.cursor.service_month)
                                                                    date.setMonth(date.getMonth() + 1);
                                                                else
                                                                    date.setDate(date.getDate() + model.qAddService.cursor.service_days);
                                                                Log.info('\n !!!!!!!!!!' + date);
                                                                var accountId = model.qAddService.cursor.account_id;
                                                                var serviceId = model.qAddService.cursor.service_id;
                                                                operations.createOperation(accountId, serviceCost, true, serviceAccountId, null, function(op){
                                                                    if(op.id){
                                                                        operations.setOperationPlanned(op.id, date, function(){
                                                                            cb({res: 'planned done'});
                                                                        }, function(){
                                                                            cb({error: 'planned err'});
                                                                        });
                                                                    }
                                                                }, function(){
                                                                    services.PauseOrResumeService(null, null, serviceAccountId, true, function () {
                                                                        cb({res: 'pause done'});
                                                                    }, function(){
                                                                        cb({error: 'pause err'});
                                                                    });
                                                                });
                                                            } else {
                                                                cb('456');
                                                            }
                                                        }
                                                        if(model.qAddService.cursor.transfer){
                                                            model.qAddService.cursor.service_counts += model.qAddService.cursor.cost_counts;
                                                        } else {
                                                            model.qAddService.cursor.service_counts = model.qAddService.cursor.cost_counts;
                                                        }
                                                        model.qListPlannedOperations[i].operation_status = operations.getStatusId('done');
                                                        model.save();
                                                        cb({res: 'done'});
                                                    } else {
                                                        cb({error: 'no bill_services_accounts'});
                                                    }
                                                } else {
                                                    services.PauseOrResumeService(null, null, model.qListPlannedOperations[i].bill_services_accounts, true, function () {
                                                        cb({res: 'service paused'});
                                                    }, function(){
                                                        cb({error: 'service not paused'});
                                                    });
                                                }
                                            } else {
                                                cb({error: 'Err find qAddService'});
                                            }
                                        }
                                        if (i == model.qListPlannedOperations.length - 1)
                                            cb({response: "ok"});
                                    }, function(err) {
                                        cb(err);
                                    });
                                })(i);
                            }
                        } else {
                            cb({response: 0});
                        }
                };
                
//                self.CheckServiceCounter()
                
                self.CheckRevaluation = function (callback, errCallback) {
                    model.qServiceListRevaluation.requery(function () {
                        if (model.qServiceListRevaluation.length) {
                            for (var i = 0; i < model.qServiceListRevaluation.length; i++) {    
                                var date = new Date();
                                date.setDate(date.getDate() + model.qServiceListRevaluation[i].rev_days);
                                model.qServiceListRevaluation[i].rev_date = date;
                                if(model.qServiceListRevaluation[i].rev_transfer) //перенос средств
                                    model.qServiceListRevaluation[i].service_counts += model.qServiceListRevaluation[i].cost_counts;
                                else
                                    model.qServiceListRevaluation[i].service_counts = model.qServiceListRevaluation[i].cost_counts;
                            }
                            model.save(function(){
                                callback({response: "ok"});
                            }, errCallback);
                        } else {
                            callback({response: "0"});
                        }
                    });
                };
            }
            return module_constructor;
        });
