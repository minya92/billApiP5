/**
 * 
 * @author User
 */
define('ServiceInfo', ['orm', 'forms', 'rpc', 'ui'], function (Orm, Forms, Rpc, Ui, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

        var BillFunc = new Rpc.Proxy('BillApiFunctions');
        var Once = false;
        var Prep = false;
        var Types;

        self.showModal = function (callback) {
            form.showModal(callback);
        };

        self.setParams = function (serviceId) {
            Request(serviceId);
        };

        //Запрос типов и данных по услуге
        function Request(serviceId) {
            BillFunc.request("services/get_types", {}, function (success_getTypes) {
                console.log(success_getTypes);
                Types = success_getTypes;
                BillFunc.request("services/get", {service_id: serviceId}, function (success_get) {
                    console.log(success_get);
                    DataFilling(success_get.services[0]);
                }, function (error_get) {
                    console.log(error_get);
                    md.alert("Ошибка загрузки данных по услуге!");
                });
            }, function (error_getTypes) {
                console.log(error_getTypes);
                md.alert("Ошибка получения типов!");
            });
        }

        //Русификация типа
        function RusType(TypeId) {
            return Types.filter(function (aItems) {
                return aItems.bill_services_types_id.indexOf(TypeId) !== -1;
            })[0];
        }

        //Заполнение формы
        function DataFilling(aData) {
            form.lblName.text = aData.service_name;
            form.lblCost.text = aData.service_cost;
            form.lbDescription.text = aData.service_desc;
            form.lblType.text = RusType(aData.service_type_id).type_name;
            form.lblPeriod.text = aData.service_month ? "Месяц" : aData.service_days != 0 ? aData.service_days + " дн." : "нет";
            form.lblCount.text = aData.cost_counts ? aData.cost_counts : "0";
            form.mcbOnce.value = Once = aData.once;
            form.mcbPrepayment.value = Prep = aData.prepayment;
        }

        form.btnOk.onActionPerformed = function (e) {
            form.close(true);
        };

        form.mcbOnce.onValueChange = function (e) {
            form.mcbOnce.value = Once;
        };

        form.mcbPrepayment.onValueChange = function (e) {
            form.mcbPrepayment.value = Prep;
        };
    }
    return module_constructor;
});
