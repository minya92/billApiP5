/**
 * @author Work
 * @stateless
 */
define('DiscountModule', ['orm', 'Messages', 'logger'],
        function (Orm, Messages, log, ModuleName) {
            return function () {
                var self = this, model = Orm.loadModel(ModuleName);
                var msg = new Messages();

                self.addDiscActive = function(anAccountId, aDiscountId, aCounter, aRule, onSuccess, onError){
                    model.qDiscActive.params.account_id = +anAccountId;
                    model.qDiscActive.params.discount_id = +aDiscountId;
                    model.qDiscRulesMin.params.discount_id = +aDiscountId;
                    model.qDiscActive.requery(function(){
                        model.qDiscRulesMin.requery(function(){
                            if(model.qDiscActive.length){
                                model.qDiscActive.cursor.discount_counter = aCounter ? aCounter : model.qDiscActive.cursor.discount_counter;
                                model.qDiscActive.cursor.active_rule = aRule ? aRule : model.qDiscActive.cursor.active_rule;
                            } else {
                                if(!aRule && model.qDiscRulesMin.length)
                                    aRule = model.qDiscRulesMin.cursor.disc_rules_id;
                                model.qDiscActive.push({
                                    account_id : anAccountId,
                                    discount_id: aDiscountId,
                                    start_date: new Date(),
                                    discount_counter : aCounter ? aCounter : null,
                                    active_rule : aRule ? aRule : null
                                });
                            }
                            model.save(function(){
                                onSuccess({response: 'ok', active: model.qDiscActive.cursor});
                            }, function(){
                                onError({error: msg.get('errSaving')});
                            });
                        }, function(){
                            onError({error: msg.get('errQuery')});
                        });
                    }, function(){
                        onError({error: msg.get('errQuery')});
                    });
                };
                
                self.closeDiscActive = function(anAccountId, aDiscountId, onSucces){
                    model.prDiscCloseActive.params.account_id = anAccountId;
                    model.prDiscCloseActive.params.discount_id = aDiscountId;
                    model.prDiscCloseActive.requery(function(){
                        onSuccess({response: 'ok'});
                    }, function(){
                        onSuccess({response: 'ok'});
                    });
                };
                
                function findDiscount(anAccountId, onSuccess, onError){
                    model.qDiscountsOnAccount.query({account_id : +anAccountId}, function(cursor){
                        if(cursor.length){
                            onSuccess(cursor[0]);
                        } else {
                            onError({error: 'No find discount'});
                        }
                    }, function(err){
                        log.info('\n ' + err);
                        onError({error: 'No find discount'});
                    });
                }
                
                /*
                 * Событие срабатывающие при пополнении баланса 
                 */
                self.onBalanceAdd = function(anAccountId, aSum, onSuccess, onError){
                    function calculateDiscount(discActive, callback){
                        var newSum = aSum;
                        callback({new_sum: newSum, rule_id: null});
                    }
                    findDiscount(anAccountId, function(discount){
                        self.addDiscActive(anAccountId, discount.discount_id, null, null, function(active){
                            if(discount.discount_type == 1) { // Тип скидки Пополнение 
                                if(aSum > active.active.rule_amount){ //Пытаемся найти более подходящее правило
                                     model.qDiscRules.query({discount_id: +discount.discount_id}, function(rules){
                                        var flag = false;
                                        var curRule = {
                                            id: null,
                                            amount: -1
                                        };
                                        rules.forEach(function(rule){
                                            if(rule.rule_amount != active.active.rule_amount && aSum >= rule.rule_amount && rule.rule_amount > curRule.amount) {
                                                flag = true;
                                                curRule.id = rule.disc_rules_id;
                                                curRule.amount = rule.rule_amount;
                                            }
                                        });
                                        if(!flag){
                                            calculateDiscount(active.active, onSuccess);
                                        } else {
                                            self.addDiscActive(anAccountId, discount.discount_id, null, curRule.id, function(active){
                                                calculateDiscount(active.active, onSuccess);
                                            }, onError);
                                        }
                                    }, onError);
                                } else {
                                    calculateDiscount(active.active, onSuccess)
                                }
                            } else {
                                calculateDiscount(active.active, onSuccess)
                            }
                        }, onError);
                    }, onError);
                };
                
                /*
                 * Событие срабатывающие при списании баланса 
                 */
                self.onBalanceDel = function(anAccountId, aSum, onSuccess, onError){
                    function calculateDiscount(discActive, callback){
                        var newSum = 0;
                        if(discActive.discount_percent){
                            var discount = aSum / 100 * discActive.discount_percent;
                            newSum = aSum - discount;
                            callback({new_sum: newSum, rule_id: discActive.active_rule});
                        } else if(discActive.discount_natural){
                            newSum = aSum - discActive.discount_natural;
                            callback({new_sum: newSum, rule_id: discActive.active_rule});
                        } else {
                            onError({error: "Error calculate discount"});
                        }
                    }
                    findDiscount(anAccountId, function(discount){
                        self.addDiscActive(anAccountId, discount.discount_id, null, null, function(active){
                            if(discount.discount_type == 2) { // Тип скидки От кол-ва проездов 
                                var counter = active.active.discount_counter + 1;
                                model.qDiscRules.query({discount_id: +discount.discount_id}, function(rules){
                                    var curRule = {
                                        id: null,
                                        amount: -1
                                    };
                                    rules.forEach(function(rule){
                                        if(counter > rule.rule_amount && rule.rule_amount > curRule.amount) {
                                            curRule.amount = rule.rule_amount;
                                            curRule.id = rule.disc_rules_id;
                                        }
                                    });
                                    self.addDiscActive(anAccountId, discount.discount_id, counter, curRule.id, function(active){
                                        calculateDiscount(active.active, onSuccess);
                                    }, onError);
                                }, onError);
                            } else {
                                calculateDiscount(active.active, onSuccess);
                            }
                        }, onError);
                    }, onError);
                };
            };
        });
