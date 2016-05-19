/**
 * 
 * @author User
 */
define('Bill', ['orm', 'forms', 'ui', 'rpc'], function (Orm, Forms, Ui, Rpc, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

        var BillFunc = new Rpc.Proxy('BillApiFunctions');

        self.show = function () {
            form.show();
        };

        var billId;

        self.setParams = function (aTitle) {
            if (aTitle) {
                form.title = "Ваш счёт (" + aTitle + ")";
                billId = +aTitle;
            }
        };

        var Choose = [{list: "Пополнить счет на "},
            {list: "Снять со счета "}];
        form.mcChoose.displayList = Choose;
        form.mcChoose.displayField = 'list';
        form.mcChoose.value = form.mcChoose.displayList[0];
        form.modelDate.value = new Date;

//        form.buttonGroup.onItemSelected = function () {
//            if (form.rbToday.selected = true) {
//                form.modelDate.enabled = false;
//                form.label.text = "" + (+form.label.text + 1);
//            } else
//                form.modelDate.enabled = true;
//        };

        function Operations(strConfirm, params, type1, type2){
            var date = form.rbToday.selected ? form.rbToday.text : form.modelDate.value;
            
            md.confirm(strConfirm + date.toLocaleString(), function (answer) {
                    if (answer) {
                        /*Если тут поменять billId на 555 то пиздец*/
                        BillFunc.request("POST", "operations/create", params, function (success_create) {
                            //Выбран пункт "Сегодня"
                            if (form.rbToday.selected) {
                                BillFunc.request("POST", "operations/done", {id: success_create.id}, function (success_done) {
                                    if (success_done.error == null && success_done.result == "ok")
                                        md.alert(type1 + " успешно!");
                                    else
                                        md.alert(success_done.error);
                                }, function (done_error) {
                                    md.alert("Ошибка разрешения " + type2 + "!");
                                });
                            //Выбрана определённая дата
                            } else {
                                BillFunc.request("POST", "operations/planned", {id: success_create.id, date: date.toDateString()}, function (success_plan) {
                                    if (success_plan.error == null && success_plan.result == "ok")
                                        md.alert(type1 + " счёта успешно запланировано!");
                                    else
                                        md.alert(success_plan.error);
                                }, function (plan_error) {
                                    md.alert("Ошибка разрешения запланированного " + type2 + "!");
                                });
                            }
                        }, function (create_error) {
                            md.alert("Ошибка создания "+ type2 + "!");
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
    }
    return module_constructor;
});
