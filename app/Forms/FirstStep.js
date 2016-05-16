/**
 * 
 * @author User
 */
define('FirstStep', ['orm', 'forms', 'ui', 'rpc', 'Bill'],
        function (Orm, Forms, Ui, Rpc, Bill, ModuleName) {
            function module_constructor() {
                var self = this
                        , model = Orm.loadModel(ModuleName)
                        , form = Forms.loadForm(ModuleName, model);

                var BillFunc = new Rpc.Proxy('BillApiFunctions');
                var FormBill = new Bill;

                self.show = function () {
                    form.show();
                };

                form.btnNewAc.onActionPerformed = function () {
                    BillFunc.createAccount(function (res) {
                        form.tfRes.text = res.account_id;
                        FormBill.setParams(res.account_id);
                        FormBill.show();
                    });
                };

                form.btnOpenAc.onActionPerformed = function () {
                    BillFunc.checkExistAccount(form.tfRes.text, function (res) {
                        if (res.id) {
                            FormBill.setParams(res.id);
                            FormBill.show();
                        } else {
                            md.alert("Неверный id счёта!")
                        }
                    }, function (e) {
                        console.log(e);
                    });
                };

            }
            return module_constructor;
        });
