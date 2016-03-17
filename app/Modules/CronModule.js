/**
 * @author Work
 */
define('CronModule', ['orm', 'AccountsModule', 'Messages', 'Events', 'OperationsModule', 'BillServicesModule'],
        function (Orm, AccountsModule, Messages, Events, OperationsModule, BillServicesModule, ModuleName) {
            function module_constructor() {
                var self = this, model = Orm.loadModel(ModuleName);
                var accounts = new AccountsModule();
                var operations = new OperationsModule();
                var msg = new Messages();
                var events = new Events();
                var services = new BillServicesModule();

                self.execute = function () {
                    // TODO : place application code here
                };

                /*
                 * Проверить заплаированные операции на сегодня
                 */
                self.CheckPlannedPayments = function (cb) {
                    model.qListPlannedOperations.requery(function () {
                        if (model.qListPlannedOperations.length) {
                            for (var i = 0; i < model.qListPlannedOperations.length; i++) {
                                (function (i) {
                                    accounts.getSumFromAccount(model.qListPlannedOperations[i].account_id, function (account) {
                                        if (!account.error) {
                                            if (account.sum >= model.qListPlannedOperations[i].operation_sum) {
                                                model.qListPlannedOperations[i].operation_status = operations.getStatusId('done');
                                                model.save();
                                            } else {
                                                services.PauseService(null, null, model.qListPlannedOperations[i].bill_services_accounts, function () {});
                                            }
                                        }
                                        if (i == model.qListPlannedOperations.length - 1)
                                            cb({response: "ok"});
                                    });
                                })(i);
                            }
                        } else {
                            cb({response: "0"});
                        }
                    });
                };
            }
            return module_constructor;
        });
