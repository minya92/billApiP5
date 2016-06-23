/**
 * 
 * @author User
 */
define('AllServices', ['orm', 'forms', 'ui', 'rpc', 'invoke'], function (Orm, Forms, Ui, Rpc, Invoke, ModuleName) {
    function module_constructor(ParentRequest) {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

        var BillFunc = new Rpc.Proxy('BillApiFunctions');
        var ServicesList;
        var TypesList;
        var AccountId;

        self.show = function () {
            form.show();
        };

        self.showModal = function (callback) {
            form.showModal(callback);
        };

        self.setParams = function (aAccountId) {
            AccountId = aAccountId;
            GetListOfTypes(RusType);
            Request(RusType);
        };

        //Запрос списка услуг
        function Request(callback) {
            BillFunc.request("services/get", {}, function (success_get) {
                console.log(success_get);
                if (success_get.services.length != 0)
                    FillGrid(success_get.services);
                callback();
            }, function (error_get) {
                console.log(error_get);
                md.alert("Ошибка получения списка услуг!");
            });
        }

        //Запрос списка типов
        function GetListOfTypes(callback) {
            BillFunc.request("services/get_types", {}, function (success_getTypes) {
                console.log(success_getTypes);
                TypesList = success_getTypes;
                callback();
                SetData_mсFilterType(success_getTypes);
            }, function (error_getTypes) {
                console.log(error_getTypes);
                md.alert("Ошибка получения типов!");
            });
        }

        //заполнение mсFilterType
        function SetData_mсFilterType(aListOfTypes) {
            form.mсFilterType.displayList = aListOfTypes;
            form.mсFilterType.displayField = 'type_name';
        }

        //заполнение данных грида
        function FillGrid(Data) {
            ServicesList = Data;
            Period();
            form.mgServises.data = Data;
            form.mgServises.colName.field = 'service_name';
            form.mgServises.colCost.field = 'service_cost';
            //form.mgServises.colType.field = 'service_type_id';
            //form.mgServises.colPeriod.field = 'bill_accounts_id';
            form.mgServises.colCount.field = 'cost_counts';
            form.mgServises.colPrepaymemt.field = 'prepayment';
            form.mgServises.colOnce.field = 'once';
        }

        //Заполнение столбца Период
        function Period() {
            for (var i = 0; i < ServicesList.length; i++) {
                ServicesList[i].period = ServicesList[i].service_month ? "Месяц" : (ServicesList[i].service_days != 0 ? (ServicesList[i].service_days + " дн.") : "");
            }
            form.mgServises.colPeriod.field = 'period';
        }

        //Кнопка добавления
        form.btnAdd.onActionPerformed = function () {
            if (form.mgServises.selected.length != 0) {
                form.close(true);
                BillFunc.request("services/add", {service_id: form.mgServises.selected[0].service_id, account_id: AccountId}, function (success_add) {
                    console.log(success_add);
                    ParentRequest();
                }, function (error_add) {
                    console.log(error_add);
                    md.alert("Ошибка добавления услуги!");
                });
            } else
                md.alert("Не выбрана ни одна услуга!");
        };

        var count = 0;
        //русификация типов в гриде
        function RusType() {
            count++;
            if (count == 2) {
                //var Start = new Date();
                for (var i = 0; i < ServicesList.length; i++) {
                    for (var k = 0; k < TypesList.length; k++) {
                        if (TypesList[k].bill_services_types_id == ServicesList[i].service_type_id) {
                            ServicesList[i].service_type = TypesList[k].type_name;
                            break;
                        }
                    }
                }
                //var End = new Date();
                //console.log('RES: ' + (End.valueOf() - Start.valueOf()));
                form.mgServises.colType.field = 'service_type';
            }
        }

        //Русификация типа. Способ 2
        function RusType2() {
            count++;
            if (count == 2) {
                var Start = new Date();
                for (var i = 0; i < ServicesList.length; i++)
                    ServicesList[i].service_type = TypesList.filter(function (aItems) {
                        return aItems.bill_services_types_id.indexOf(ServicesList[i].service_type_id) !== -1;
                    })[0].type_name;
                var End = new Date();
                console.log('RES: ' + (End.valueOf() - Start.valueOf()));
                form.mgServises.colType.field = 'service_type';
            }
        }

        //Поиск по типу
        form.mсFilterType.onValueChange = function () {
            var filtered = null;
            if (form.mсFilterType.value) {
                var filterKey = form.mсFilterType.value.bill_services_types_id;
                filtered = ServicesList.filter(function (aItems) {
                    return aItems.service_type_id == filterKey;
                });
                form.mgServises.data = filtered;
            } else
                form.mgServises.data = ServicesList;
            if (form.mffSearch.text != "") {
                filterKey = form.mffSearch.text;
                var servicesList = filtered ? filtered : ServicesList;
                var filtered = servicesList.filter(function (aItems) {
                    return (aItems.service_name + "").toLowerCase().indexOf(filterKey.toLowerCase()) !== -1;
                });
                form.mgServises.data = filtered;
            }
        };

        //Поиск по имени
        form.mffSearch.onValueChange = form.mffSearch.onKeyReleased = function () {
            form.mсFilterType.onValueChange();
        };
    }
    return module_constructor;
});
