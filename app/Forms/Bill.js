/**
 * 
 * @author User
 */
define('Bill', ['orm', 'forms', 'ui', 'rpc', 'BillStatistics'], function (Orm, Forms, Ui, Rpc, BillStatistics, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

        var BillFunc = new Rpc.Proxy('BillApiFunctions');

        self.show = function () {
            form.show();
        };

        var billId;
        var billStatistics = new BillStatistics();       
        billStatistics.show(form.pnlStatistics);

        self.setParams = function (aTitle) {
            if (aTitle) {
                form.title = "Ваш счёт (" + aTitle + ")";
                billId = +aTitle;
                billStatistics.setParams(billId);
            }

            var Choose = [{list: "Пополнить счет на "},
                {list: "Снять со счета "}];
            form.mcChoose.displayList = Choose;
            form.mcChoose.displayField = 'list';
            form.mcChoose.value = form.mcChoose.displayList[0];
            form.modelDate.value = new Date;
        };

//        form.buttonGroup.onItemSelected = function () {
//            if (form.rbToday.selected = true) {
//                form.modelDate.enabled = false;
//                form.label.text = "" + (+form.label.text + 1);
//            } else
//                form.modelDate.enabled = true;
//        };

        function Operations(strConfirm, params, type1, type2) {
            var date = form.rbToday.selected ? form.rbToday.text : form.modelDate.value;

            md.confirm(strConfirm + date.toLocaleDateString(), function (answer) {
                if (answer) {
                    /*Если тут поменять billId на 555 то пиздец*/
                    BillFunc.request("operations/create", params, function (success_create) {
                        //Выбран пункт "Сегодня"
                        if (form.rbToday.selected) {
                            BillFunc.request("operations/done", {id: success_create.id}, function (success_done) {
                                console.log(success_done);
                                if (success_done.error == null && success_done.result == "ok")
                                    md.alert(type1 + " успешно!");
                                else
                                    md.alert("Ошибка разрешения " + type2 + " на сервере!");
                            }, function (done_error) {
                                console.log(done_error);
                                md.alert("Ошибка разрешения " + type2 + "!");
                            });
                            //Выбрана определённая дата
                        } else {
                            BillFunc.request("operations/planned", {id: success_create.id, date: date.toDateString()}, function (success_plan) {
                                console.log(success_plan);
                                if (success_plan.error == null && success_plan.result == "ok")
                                    md.alert(type1 + " счёта успешно запланировано!");
                                else
                                    md.alert("Ошибка разрешения запланированного " + type2 + " на сервере!");
                            }, function (plan_error) {
                                console.log(plan_error);
                                md.alert("Ошибка разрешения запланированного " + type2 + "!");
                            });
                        }
                        form.mffBalance.onMousePressed();
                        form.mffBalance.text = "";
                        form.tfSum.text = "";
                        form.btnExecute.enabled = false;
                    }, function (create_error) {
                        console.log(create_error);
                        md.alert("Ошибка создания " + type2 + "!");
                    });
                }
            });
        }

        form.btnExecute.onActionPerformed = function () {
            if (/\D/.test(form.tfSum.text) || (+form.tfSum.text == 0)) {
                md.alert("Введённая сумма имеет неверный формат!");
                return;
            }
            var strReplenish = "Вы хотите пополнить счёт " + billId + " на сумму " + +form.tfSum.text + " руб? "
                    + "Дата пополнения: ";
            var strWithdraw = "Вы хотите списать со счёта " + billId + " сумму в " + +form.tfSum.text + " руб? "
                    + "Дата списания: ";

            //пользователь выбрал "Пополнить счёт на"
            if (form.mcChoose.value == form.mcChoose.displayList[0]) {
                Operations(strReplenish, {id: billId, sum: +form.tfSum.text}, "Пополнение", "пополнения");
                //пользователь выбрал "Списать со счёта"    
            } else if (form.mcChoose.value == form.mcChoose.displayList[1]) {
                Operations(strWithdraw, {id: billId, sum: +form.tfSum.text, withdraw: true}, "Списание", "списания");//                
            }
        };

        form.rbToday.onValueChange = function () {
            form.modelDate.enabled = false;
        };

        form.rbDate.onValueChange = function () {
            form.modelDate.enabled = true;
        };

        form.mcChoose.onValueChange = function () {
            if (form.mcChoose.value == null)
                form.btnExecute.enabled = false;
            else if (form.tfSum.text != '')
                form.btnExecute.enabled = true;
        };

        form.tfSum.onKeyReleased = function () {
            //form.label.text = "" + (+form.label.text + 1);
            if (form.tfSum.text == '')
                form.btnExecute.enabled = false;
            else if (form.mcChoose.value != null)
                form.btnExecute.enabled = true;
        };

        form.btnBalance.onActionPerformed = function () {
            if (form.mffBalance.text == "") {
                BillFunc.request("accounts/get_sum", {id: billId}, function (res_sum) {
                    console.log(res_sum);
                    if (res_sum.error == null && res_sum.sum != null) {
                        form.mffBalance.text = res_sum.sum + " руб.";
                        /*var Balance = [{balance: res_sum.sum}];
                         form.mffBalance.data = Balance;
                         form.mffBalance.field = 'balance';*/
                        form.btnBalance.visible = false;
                        form.mffBalance.visible = true;
                    } else
                        md.alert("Ошибка получения суммы на сервере!");
                }, function (sum_error) {
                    console.log(sum_error);
                    md.alert("Ошибка получения суммы!");
                });
            } else {
                form.btnBalance.visible = false;
                form.mffBalance.visible = true;
            }
        };

        form.mffBalance.onMousePressed = function () {
            form.btnBalance.visible = true;
            form.mffBalance.visible = false;
//            form.mffBalance.text = "";
        };
    }
    return module_constructor;
});
