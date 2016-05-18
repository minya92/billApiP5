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

        form.btnExecute.onActionPerformed = function () {
            //var a = form.tfSum.text.search(/\D/);
            if (/\D/.test(form.tfSum.text)) {
                md.alert("Введённая сумма имеет неверный формат!");
                return;
            }

            var date = form.rbToday.selected ? form.rbToday.text : form.modelDate.value.toLocaleString();

            if (form.mcChoose.value == form.mcChoose.displayList[0])
                md.confirm("Вы хотите пополнить счёт " + billId + " на сумму " + form.tfSum.text + " руб? "
                        + "Дата пополнения: " + date, function (res) {
                            if (res) {
/*Если тут поменять billId на 555 то пиздец*/BillFunc.request("POST", "operations/create", {id: billId, sum: +form.tfSum.text}, function (res) {
                                    BillFunc.request("POST", "operations/done", {id: res.id}, function (res2) {
                                        if (res2.error == null && res2.result == "ok")
                                            md.alert("Счёт успешно пополнен!");
                                        else
                                            md.alert("Ошибка!");
                                    }, function (error2) {console.log(md.alert("Ошибка!"));});
                                }, function (error) {console.log(md.alert("Ошибка!"));});
                            }
                        }
                );

            else if (form.mcChoose.value == form.mcChoose.displayList[1])
                md.confirm("Вы хотите списать со счёта " + billId + " сумму в " + form.tfSum.text + " руб?"
                        + "Дата списания: " + date);
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
