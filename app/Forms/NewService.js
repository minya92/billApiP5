/**
 * 
 * @author User
 */
define('NewService', ['orm', 'forms', 'ui', 'rpc'], function (Orm, Forms, Ui, Rpc, ModuleName) {
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

        self.setParamsOpen = function (aListOfTypes) {
            form.btnCreate.visible = false;
            form.btnDel.visible = true;
            form.cbUnsubscribe.visible = true;
            form.btnSave.visible = true;

            checkListOfTypes(aListOfTypes, function (types) {
                SetData_mcType(types);
            });
        };

        //Тут не работает
        self.setParamsNew = function (aListOfTypes) {
            form.mcType.displayList = aListOfTypes;
            form.mcType.displayField = 'type_name';
//            checkListOfTypes(aListOfTypes, function (types) {
//                SetData_mcType(types);
//            });
        };

        //заполнение mcType
        SetData_mcType = function (ListOfTypes) {
            form.mcType.displayList = ListOfTypes;
            form.mcType.displayField = 'type_name';
        };

        //Если есть список типов, присваиваем, если н6ет, запрашиваем с сервера
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
        GetListOfTypes = function (CallBack) {
            BillFunc.request("services/get_types", {}, function (success_getTypes) {
                console.log(success_getTypes);
//                    Request();
                CallBack(success_getTypes);
            }, function (error_getTypes) {
                console.log(error_getTypes);
                CallBack(null);
                md.alert("Ошибка получения типов!");
            });
        };

        form.btnCreate.onActionPerformed = function () {
            console.log(form.mcType.displayList);
        };

        form.btnSave.onActionPerformed = function () {
            console.log(form.mcType.displayList);
        };

        form.mcbPeriod.onValueChange = function (evt) {
            form.rbMonth.enabled = !form.rbMonth.enabled;
            form.rbDays.enabled = !form.rbDays.enabled;
            form.mffDays.enabled = !form.mffDays.enabled;
            form.lbDays.enabled = !form.lbDays.enabled;

//            if (!form.mcbPeriod.value)
//                form.mcbCounter.value = true;

            form.mcbCounter.enabled = form.mcbPeriod.value;
        };

        form.mcbCounter.onValueChange = function () {
            form.mffCounter.enabled = !form.mffCounter.enabled;
            form.lbCounter.enabled = !form.lbCounter.enabled;

//            if (!form.mcbCounter.value)
//                form.mcbPeriod.value = true;

            form.mcbPeriod.enabled = form.mcbCounter.value;
        };

    }
    return module_constructor;
});
