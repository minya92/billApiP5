/**
 * @author Work
 * @stateless
 */
define('AccountsModule', ['orm', 'Messages', 'Events', 'rpc'],
        function (Orm, Messages, Events, Rpc, ModuleName) {
            return function () {
                var self = this, model = Orm.loadModel(ModuleName);
                var msg = new Messages();
                var events = new Events();
                var metrika = new Rpc.Proxy('MetrikaTestModule');
                
                var M_BILL_CREATE_ACC = 13;
                var M_BILL_GET_SUM = 14;
                
                /*
                 * Создает новый биллинговый аккаунт и возвращает его ID
                 */
                self.createBillAccount = function (aCallBack, aErrCallback) {
                    metrika.shot(M_BILL_CREATE_ACC, function(){});
                    model.qBillAccounts.push({
                       // currnt_sum: 0, //TODO А нужно ли?
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
                    metrika.shot(M_BILL_GET_SUM, function(){});
                    var sum = 0, error = null;
                    model.qGetAccountBalance.query({account_id: +anAccountId}, function (balance) {
                        if (balance.length)
                            aCallBack({
                                account_id: anAccountId,
                                sum: balance[0].account_balance
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
                    model.qBillAccounts.requery(function () {
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
                 * (!!!!) Удалить счет полностью со всеми данными (!!!!)
                 * (!!!!) Сначала нужно сделать неактивным (!!!!)
                 */
                self.delAccountHardcore = function (anAccountId, aCallBack, aErrCallback) {
                    model.qBillAccounts.params.account_id = +anAccountId;
                    model.qBillAccounts.requery(function () {
                        if (model.qBillAccounts.length) {
                            if(!model.qBillAccounts[0].active){
                                model.qBillAccounts.splice(0, 1);
                                model.save(function(){
                                    events.addEvent("accountDeleted", {account_id: anAccountId});
                                    aCallBack({
                                        result: msg.get("successDelAccount")
                                    });
                                }, function(){
                                    aErrCallback({error: msg.get('errSaving')});
                                });
                            } else {
                                aErrCallback({error: msg.get('errDeleteAccount')});
                            }
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
                
                /*
                 * Получить список всех аккаунтов
                 */
                self.GetAllAccounts = function (aLimit, aOffset, aCallBack, aErrCallback) {
                    model.qBillAccounts.query({lim: aLimit, off: aOffset}, function (res) {
                        if (res.length)
                            aCallBack({
                                accounts: res
                            });
                        else {
                            aErrCallback({error: msg.get('errFindAccount')});
                        }
                    }, function(){
                        aErrCallback({error: msg.get('errQuery')});
                    });
                };

            };
        });
