/**
 * @author Work
 */
define('AccountsModule', ['orm', 'Messages', 'Events'],
        function (Orm, Messages, Events, ModuleName) {
            return function () {
                var self = this, model = Orm.loadModel(ModuleName);
                var msg = new Messages();
                var events = new Events();

                /*
                 * Создает новый биллинговый аккаунт и возвращает его ID
                 */
                self.createBillAccount = function (aCallBack, aErrCallback) {
                    model.qBillAccounts.push({
                        currnt_sum: 0, //TODO А нужно ли?
                        active: true
                    });
                    model.save(function () {
                        events.addEvent("accountCreated", {account_id: model.qBillAccounts.cursor.bill_accounts_id});
                        aCallBack(model.qBillAccounts.cursor.bill_accounts_id);
                    }, function(){
                        aErrCallback(false);
                    });
                };

                /*
                 * Получить остаток суммы на счету
                 */
                self.getSumFromAccount = function (anAccountId, aCallBack, aErrCallback) {
                    model.qGetAccountBalance.params.account_id = +anAccountId;
                    var sum = 0, error = null;
                    model.requery(function () {
                        if (model.qGetAccountBalance.length)
                            aCallBack({
                                account_id: anAccountId,
                                sum: model.qGetAccountBalance[0].account_balance
                            });
                        else {
                            aErrCallback({error: msg.get('errFindAccount')});
                        }
                    }, function(){
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };

                /*
                 * Удалить счет (сделать неактивным)
                 */
                self.delAccount = function (anAccountId, aCallBack, aErrCallback) {
                    model.qBillAccounts.params.account_id = +anAccountId;
                    model.requery(function () {
                        if (model.qBillAccounts.length) {
                            model.qBillAccounts[0].active = false;
                            model.save(function(){
                                events.addEvent("accountDeleted", {account_id: anAccountId});
                                aCallBack({
                                    result: msg.get("successDelAccount")
                                });
                            }, function(){
                                aErrCallback({error: msg.get('errSaving')});
                            });
                        } else {
                            aErrCallback({error: msg.get("errFindAccount")});
                        }
                    }, function(){
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };

                /*
                 * Проверяет есть ли такой аккаунт в бд
                 */
                self.checkExistAccount = function (aAcId, aCallBack, aErrCallback) {
                    model.qBillAccounts.params.account_id = +aAcId;
                    model.qBillAccounts.requery(function () {
                        if (model.qBillAccounts.length != 0) {
                            aCallBack({id: model.qBillAccounts.cursor.bill_accounts_id});
                        } else {
                            aErrCallback({error: msg.get("errFindAccount")});
                        }
                    }, function(){
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };
            };
        });
