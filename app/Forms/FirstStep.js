/**
 * 
 * @author User
 */
define('FirstStep', ['orm', 'forms', 'ui', 'rpc', 'Bill', 'Services'],
        function (Orm, Forms, Ui, Rpc, Bill, Services, ModuleName) {
            function module_constructor() {
                var self = this
                        , model = Orm.loadModel(ModuleName)
                        , form = Forms.loadForm(ModuleName, model);

                var BillFunc = new Rpc.Proxy('BillApiFunctions');
                var FormBill = new Bill();
                var FormServices = new Services();                

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
                    BillFunc.checkExistAccount(form.tfRes.text, function (success_chek) {
                        console.log(success_chek);
                        FormBill.setParams(success_chek.id);
                        FormBill.show();
                    }, function (chek_error) {
                        console.log(chek_error);                        
                        //В 'e' какая то дичь)
                        md.alert("Неверный id счёта!");
                    });
                };

                form.btnServices.onActionPerformed = function () {
                    FormServices.setParams();
                    FormServices.show();
                };

                window.onkeyup = function (e) {
                    if (e.keyCode == 13)
                        ;
//                    md.alert("Ес");
//                    else md.alert("Ноу");
                    //document.getElementById("go").click();
                };
            }
            return module_constructor;
        });
