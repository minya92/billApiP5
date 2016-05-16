/**
 * 
 * @author User
 */
define('FirstStep', ['orm', 'forms', 'ui', 'rpc'],
        function (Orm, Forms, Ui, Rpc, ModuleName) {
            function module_constructor() {
                var self = this
                        , model = Orm.loadModel(ModuleName)
                        , form = Forms.loadForm(ModuleName, model);

                var BillFunc = new Rpc.Proxy('BillApiFunctions');

                self.show = function () {
                    form.show();
                };

                form.btnNewAc.onActionPerformed = function () {
                    BillFunc.createAccount(function (res) {
                        form.tfRes.text = res.account_id;
                    });
                };
            }
            return module_constructor;
        });
