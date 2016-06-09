/**
 * 
 * @author User
 */
define('NewService', ['orm', 'forms', 'ui', 'rpc', 'invoke'], 
function (Orm, Forms, Ui, Rpc, invoke, ModuleName) {
    function module_constructor(parentSelf, parentForm, parentServiceSelf) {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

        var BillFunc = new Rpc.Proxy('BillApiFunctions');
        var ServiceId;
        //var Services = Services(form);        

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
        self.setParamsOpen = function (aListOfTypes, serviceId) {
            form.btnCreate.visible = false;
            form.btnDel.visible = true;
            form.cbUnsubscribe.visible = true;
            form.btnSave.visible = true;
            form.mffName.enabled = false;

            ServiceId = serviceId;

            checkListOfTypes(aListOfTypes, function (types) {
                SetData_mcType(types);
            });

            GetServiseRequest(serviceId);
        };

        //Открытия для создания
        self.setParamsNew = function (aListOfTypes) {
//            form.mcbPrepayment.value = false;
//            form.mffName.text = "";
//            form.mffCost.text = "";
//            form.mffDays.text = "";
//            form.mffCounter.text = "";
//            form.rbMonth.selected = true;

            checkListOfTypes(aListOfTypes, function (types) {
                SetData_mcType(types);
            });
        };

        //Запрос услуги для заполнения формы
        function GetServiseRequest(serviceId) {
            BillFunc.request("services/get", {service_id: serviceId}, function (success_get) {
                console.log(success_get);
                DataFilling(success_get);
            }, function (error_get) {
                console.log(error_get);
                md.alert("Ошибка загрузки дынных по услуге!");
            });
        }

        //Заполнение формы
        function DataFilling(success_get) {
            parentForm.title += success_get.services[0].service_name;
            form.mffName.value = success_get.services[0].service_name;
            form.mffCost.value = +success_get.services[0].service_cost;
            ChangeType(success_get.services[0].service_type_id);
            form.mcbPrepayment.value = success_get.services[0].prepayment ? true : false;
            form.mffCounter.value = success_get.services[0].cost_counts ? +success_get.services[0].cost_counts : "";
            form.mffDays.value = success_get.services[0].service_days ? +success_get.services[0].service_days : "";
            form.rbDays.selected = success_get.services[0].service_days;
            parentSelf.ChangeVisibleColums(form.mcbPeriod.value, form.mcbCounter.value);
        }

        //заполнение mcType
        function SetData_mcType(aListOfTypes) {
            form.mcType.displayList = aListOfTypes;
            form.mcType.displayField = 'type_name';
            form.mcType.value = form.mcType.displayList[0];
        }

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

        //Изменение значения типа в списке типов
        function ChangeType(TypeId) {
            form.mcType.value = form.mcType.displayList.filter(function (aItems) {
                return aItems.bill_services_types_id.indexOf(TypeId) !== -1;
            })[0];
        }

        //Нажали галочку на периоде
        form.mcbPeriod.onActionPerformed = function () {
            if (form.mcbPeriod.value) {
                if (!form.mcbOnce.value)
                    ChangeType('CounterServiceModule');
                else
                    form.mcbCounter.value = true;
            } else {
                if (!form.mcbOnce.value)
                    ChangeType('PeriodCounterServiceModule');
                else
                    form.mcbCounter.value = false;
            }
            //form.mcbCounter.enabled = form.mcbPeriod.value;
        };

        //Кликнули галочку на счетчике
        form.mcbCounter.onActionPerformed = function () {
            if (form.mcbCounter.value)
                if (!form.mcbOnce.value)
                    ChangeType('PeriodServiceModule');
                else
                    form.mcbPeriod.value = true;
            else {
                if (!form.mcbOnce.value)
                    ChangeType('PeriodCounterServiceModule');
                else
                    form.mcbPeriod.value = false;
            }
//            form.mcbPeriod.enabled = form.mcbCounter.value;
        };

        //Нажатие на галочку "Единоразово"
        form.mcbOnce.onActionPerformed = function () {
            if (!form.mcbOnce.value)
                ChangeType('OneTime');

            else if (!form.mcbCounter.value)
                ChangeType('PeriodServiceModule');
            else if (!form.mcbPeriod.value)
                ChangeType('CounterServiceModule');
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
                        md.alert("Ошибка присваивания типов!");
                        break;
                }
        };

        //Запрос создание услуги
        function CreateService(params, callback) {
            BillFunc.request("services/create", params, function (success_create) {
                console.log(success_create);
                md.alert("Услуга успешно создана!");
                callback(true);
            }, function (error_create) {
                console.log(error_create);
                md.alert("Ошибка создания услуги!");
            });
        }

        //Кнопка подверждения создания
        form.btnCreate.onActionPerformed = function () {
            var Message = "Подтвердите создание услуги: Имя: " + form.mffName.text + ", Стоимость: " + form.mffCost.text + " руб., Тип: " + form.mcType.text +
                    (form.mcbCounter.value ? ", Счётчик: " + form.mffCounter.text + " единиц" : "") +
                    (form.mcbPeriod.value ? ", Период действия/списания: " + (form.rbMonth.selected ? "Месяц" : form.mffDays.text + " дней") : "") +
                    (form.mcbPrepayment.value ? ", Оплата: Предварительная." : ".");
            CheckData(Message, function (params) {
                CreateService(params, function (aCallback) {
                    form.close(aCallback);
                });
            });
        };

        //Проверка данных для создания/сохранения
        function CheckData(Message, callback) {
            if (form.mffName.text == "" || form.mffCost.text == "" || /\D/.test(form.mffCost.text) ||
                    (form.rbDays.selected && (form.mffDays.text == "" || /\D/.test(form.mffDays.text))) ||
                    (form.mcbCounter.value && (form.mffCounter.text == "" || /\D/.test(form.mffCounter.text))))
                md.alert("Данные введены неверно!!!");
            else {
                md.confirm(Message, function (answer) {
                    if (answer) {
                        var params = {
                            name: form.mffName.text,
                            cost: +form.mffCost.text,
                            days: form.rbDays.selected ? +form.mffDays.text : null,
                            prepayment: form.mcbPrepayment.value,
                            once: form.mcbOnce.value,
                            counts: form.mcbCounter.value ? +form.mffCounter.text : null,
                            type: form.mcType.value.bill_services_types_id
                        };
                        callback(params);
                    }
                });
            }
        }

        //Кнопка сохранения
        form.btnSave.onActionPerformed = function () {
            CheckData("Подтвердите сохранение", function (params) {
                params.service_id = ServiceId;
                SaveService(params, function (aCallback) {
                    //form.close(aCallback);
                    //Services.request;
                    parentServiceSelf.Request();
                    parentSelf.request(ServiceId);
                });
            });
        };

        //Запрос сохранения услуги
        function SaveService(params, callback) {
            BillFunc.request("services/change", params, function (success_change) {
                console.log(success_change);
                md.alert("Услуга успешно сохранена!");
                callback(true);
            }, function (error_change) {
                console.log(error_change);
                md.alert("Ошибка изменения услуги!");
            });
        }

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

        //Изменяем текст поля с количеством дней
        form.mffDays.onMouseClicked = function () {
            form.rbDays.selected = true;
        };

        //Клик на текст с периодом
        form.lbPeriod.onMouseClicked = function () {
            form.mcbPeriod.onActionPerformed();
        };

        //Клик на текст со счётчиком
        form.lbCount.onMouseClicked = function () {
            form.mcbCounter.onActionPerformed();
        };
    }
    return module_constructor;
});
