/**
 * 
 * @author User
 */
define('NewService', ['orm', 'forms', 'ui', 'rpc', 'invoke'], function (Orm, Forms, Ui, Rpc, invoke, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

        var BillFunc = new Rpc.Proxy('BillApiFunctions');
        //var ListOfTypes;

        self.show = function (aPanel) {
            var cont = aPanel ? (typeof (aPanel) === 'object' ? aPanel
                    : document.getElementById(aPanel))
                    : self.container;
            if (cont) {
                if (cont.add)
                    cont.add(form.view, {left: 0, top: 0, right: 0, bottom: 0});
                else
                    form.view.showOn(cont);
                if (form.onWindowOpened)
                    form.onWindowOpened();
            } else
                form.show();
        };

        self.showModal = function (callback) {
            form.showModal(callback);
        };

        form.mcbPeriod.value = true;
        form.mcbCounter.value = false;
        form.mcbPrepayment.value = false;
        form.mcbOnce.value = false;

        //Открытие для редактирования
        self.setParamsOpen = function (aListOfTypes) {
            form.btnCreate.visible = false;
            form.btnDel.visible = true;
            form.cbUnsubscribe.visible = true;
            form.btnSave.visible = true;

            checkListOfTypes(aListOfTypes, function (types) {
                SetData_mcType(types);
            });
        };

        //Открытия для создания
        self.setParamsNew = function (aListOfTypes) {
            checkListOfTypes(aListOfTypes, function (types) {
                SetData_mcType(types);
            });
        };

        //заполнение mcType
        function SetData_mcType(aListOfTypes) {
            form.mcType.displayList = aListOfTypes;
            form.mcType.displayField = 'type_name';
            form.mcType.value = form.mcType.displayList[0];
        }
        ;

        //Если есть список типов, присваиваем, если нет, запрашиваем с сервера
        function checkListOfTypes(aListOfTypes, callback) {
            if (aListOfTypes)
                callback(aListOfTypes);
            else {
                GetListOfTypes(function (types) {
                    callback(types);
                });
            }
        }

        //Запрос списка типов
        function GetListOfTypes(CallBack) {
            BillFunc.request("services/get_types", {}, function (success_getTypes) {
                console.log(success_getTypes);
//                    Request();
                CallBack(success_getTypes);
            }, function (error_getTypes) {
                console.log(error_getTypes);
                CallBack(null);
                md.alert("Ошибка получения типов!");
            });
        }
        ;

        //Кнопка подверждения создания
        form.btnCreate.onActionPerformed = function () {

        };

        //Кнопка сохранения
        form.btnSave.onActionPerformed = function () {

        };

        //Изменение значения типа в списке типов
        function ChangeType(TypeId) {
            form.mcType.value = form.mcType.displayList.filter(function (aItems) {
                return aItems.bill_services_types_id.indexOf(TypeId) !== -1;
            })[0];
        }

        //Нажали галочку на периоде
        form.mcbPeriod.onActionPerformed = function (evt) {
            if (form.mcbPeriod.value) {
                form.mcbCounter.value = true;
                if (form.mcbOnce.value) {
                    //ChangeType('OneTime');
                } else {
                    ChangeType('CounterServiceModule');
                }
            } else {
                if (form.mcbOnce.value) {
                    form.mcbCounter.value = false;
                    //ChangeType('OneTime');
                } else {
                    if (form.mcbCounter.value)
                        ChangeType('PeriodCounterServiceModule');
                    else
                        ChangeType('PeriodServiceModule');
                }
            }

            //form.mcbCounter.enabled = form.mcbPeriod.value;
        };

        //Кликнули галочку на счетчике
        form.mcbCounter.onActionPerformed = function () {
            if (form.mcbCounter.value) {
                form.mcbPeriod.value = true;
                if (form.mcbOnce.value) {
                    //ChangeType('OneTime');
                } else {
                    ChangeType('PeriodServiceModule');
                }
            } else {
                if (form.mcbOnce.value) {
                    form.mcbPeriod.value = false;
                    //ChangeType('OneTime');
                } else {
                    if (form.mcbPeriod.value)
                        ChangeType('PeriodCounterServiceModule');
                    else
                        ChangeType('CounterServiceModule');
                }
            }
            //form.mcbPeriod.enabled = form.mcbCounter.value;
        };

        //Нажатие на галочку "Единоразово"
        form.mcbOnce.onActionPerformed = function () {
            if (!form.mcbOnce.value)
                ChangeType('OneTime');
            
            else if (!form.mcbCounter.value)
                ChangeType('PeriodServiceModule');
            else if (!form.mcbPeriod.value)
                ChangeType('CounterServiceModule');
            else
                ChangeType('PeriodCounterServiceModule');



        };


        //Смена значения списка типов
        form.mcType.onValueChange = function (evt) {
            if (!form.mcType.value) {
                form.mcType.value = form.mcType.displayList[0];
            } else
                switch (form.mcType.value.bill_services_types_id) {
                    case 'PeriodServiceModule':
                        form.mcbPeriod.value = true;
                        form.mcbCounter.value = false;
                        form.mcbOnce.value = false;
                        break;
                    case 'CounterServiceModule':
                        form.mcbPeriod.value = false;
                        form.mcbCounter.value = true;
                        form.mcbOnce.value = false;
                        break;
                    case 'PeriodCounterServiceModule':
                        form.mcbPeriod.value = true;
                        form.mcbCounter.value = true;
                        form.mcbOnce.value = false;
                        break;
                    case 'OneTime':
                        form.mcbOnce.value = true;
                        if (form.mcbPeriod.value && form.mcbCounter.value)
                            form.mcbCounter.value = false;
//                        else if (!form.mcbPeriod.value && !form.mcbCounter.value)
//                            form.mcbPeriod.value = true;
                        break;
                    default:
                        ;
                        break;
                }
        };


        //Изменение значения галочки периода
        form.mcbPeriod.onValueChange = function (evt) {
            form.rbMonth.enabled = !form.rbMonth.enabled;
            form.rbDays.enabled = !form.rbDays.enabled;
            form.mffDays.enabled = !form.mffDays.enabled;
            form.lbDays.enabled = !form.lbDays.enabled;
        };

        //Изменение значения галочки Счетчика
        form.mcbCounter.onValueChange = function (evt) {
            form.mffCounter.enabled = !form.mffCounter.enabled;
            form.lbCounter.enabled = !form.lbCounter.enabled;
        };
    }
    return module_constructor;
});
