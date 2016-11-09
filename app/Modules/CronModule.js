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
                self.CheckPlannedPayments = function (aDate, callback) {
                    var res = [], count = 0;
                    function cb(param, i){
                        res.push(param);
                        count = count + 1;
                        if(count > model.qListPlannedOperations.length || i == -1){
                            model.save();
                            callback({response: res});
                        }
                    }
                    model.qListPlannedOperations.params.pDate = aDate ? new Date(aDate) : null;
                    model.qListPlannedOperations.requery();
                    if (model.qListPlannedOperations.length) {
                            for (var i = 0; i < model.qListPlannedOperations.length; i++) {
                                (function (i) {
                                    model.qGetAccountBalance.params.account_id = model.qListPlannedOperations[i].account_id;
                                    model.qGetAccountBalance.requery();
                                    if (model.qGetAccountBalance.length){
                                        var serviceAccountId = model.qListPlannedOperations[i].bill_services_accounts;
                                        model.qAddService.params.service_account_id = serviceAccountId;
                                        model.qAddService.requery();
                                        if(model.qAddService.length){
                                            var serviceCost = model.qAddService.cursor.service_cost;
                                            if (model.qGetAccountBalance[0].account_balance >= serviceCost) {
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
                                                            operations.createOperation(accountId, serviceCost, true, serviceAccountId, null, function(op){
                                                                if(op.id){
                                                                    operations.setOperationPlanned(op.id, date, function(){
                                                                        cb({res: 'planned done'}, i);
                                                                    }, function(){
                                                                        cb({error: 'planned err'}, i);
                                                                    });
                                                                }
                                                            }, function(){
                                                                services.PauseOrResumeService(null, null, serviceAccountId, true, function () {
                                                                    cb({res: 'pause done'}, i);
                                                                }, function(){
                                                                    cb({error: 'pause err'}, i);
                                                                });
                                                            });
                                                        } else {
                                                            cb('456', i);
                                                        }
                                                    }
                                                    if(model.qAddService.cursor.transfer){
                                                        model.qAddService.cursor.service_counts += model.qAddService.cursor.cost_counts;
                                                    } else {
                                                        model.qAddService.cursor.service_counts = model.qAddService.cursor.cost_counts;
                                                    }
                                                    model.qListPlannedOperations[i].operation_status = operations.getStatusId('done');
                                                    cb({res: 'done'}, i);
                                                } else {
                                                    cb({error: 'no bill_services_accounts'}, i);
                                                }
                                            } else {
                                                services.PauseOrResumeService(null, null, model.qListPlannedOperations[i].bill_services_accounts, true, function () {
                                                    cb({res: 'service paused'}, i);
                                                }, function(){
                                                    cb({error: 'service not paused'}, i);
                                                });
                                            }
                                        } else {
                                            cb({error: 'Err find qAddService'}, i);
                                        }
                                    }
                                    else {
                                        cb({err_get_sum: model.qListPlannedOperations[i].account_id}, i);
                                    }
                                })(i);
                            }
                        } else {
                            cb({response: 0}, -1);
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
