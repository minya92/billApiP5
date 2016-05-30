/* 
 * Выполнение метода api
 */
function request(httpMethod, apiMethod, params, callback) {
     $.ajax({
        url: "/bill/application/" + apiMethod,
        data: params,
        type: httpMethod,
        complete: function (dat) {
            //console.log(dat);
            if (dat.responseJSON) {
                callback(dat.responseJSON);
            } else {
                callback({
                    error: "Server error: " + dat.status,
                    response: dat.responseText
                });
            }
        }
    });
}

function errorMsg(aResult) {
    var res = " ";
    if (aResult.error)
        res += "Error: " + aResult.error;
    if (aResult.response)
        res += " Response: " + aResult.response;
    return res;
}

var accountId = null;
var serviceId = null;
var servicePrepayment = null;
var serviceCounter = null;

QUnit.test("Получить остаток на НЕ существующем счету", function (assert) {
    var done = assert.async();
    request("POST", "accounts/get_sum", {id: accountId}, function (res) {
        assert.ok(!res.sum, "Sum: " + res.sum + errorMsg(res));
        done();
    });
});

QUnit.test("Создать новый счет", function (assert) {
    var done = assert.async();
    request("POST", "accounts/create", null, function (res) {
        assert.ok(res.account_id, "Bill account created: id=" + res.account_id + errorMsg(res));
        accountId = res.account_id;
        done();
    });
});

QUnit.test("Снять с пустого счета 200", function (assert) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId, sum: 200, withdraw: true}, function (res) {
        assert.ok(res.id, "Operation Processing: " + res.id + errorMsg(res));
        request("POST", "operations/done", {id: res.id}, function (r) {
            assert.ok(r.error, "Operation done: " + r.result + errorMsg(r));
            done();
        });
    });
});

QUnit.test("Пополнить счет на 500", function (assert) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId, sum: 500}, function (res) {
        assert.ok(res.id, "Operation Processing: " + res.id + errorMsg(res));
        request("POST", "operations/done", {id: res.id}, function (r) {
            assert.ok(r.result, "Operation done: " + r.result + errorMsg(r));
            done();
        });
    });
});

QUnit.test("Снять со счета 400", function (assert) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId, sum: 400, withdraw: true}, function (res) {
        assert.ok(res.id, "Operation Processing: " + res.id + errorMsg(res));
        request("POST", "operations/done", {id: res.id}, function (r) {
            assert.ok(r.result, "Operation done: " + r.result + errorMsg(r));
            done();
        });
    });
});

QUnit.test("Снять со счета 101 (не хватит денег)", function (assert) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId, sum: 101, withdraw: true}, function (res) {
        assert.ok(res.id, "Operation Processing: " + res.id + errorMsg(res));
        request("POST", "operations/done", {id: res.id}, function (r) {
            assert.ok(!r.result, "Operation done: " + r.result + errorMsg(r));
            done();
        });
    });
});

QUnit.test("Снять со счета 303 на след. неделе", function (assert) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId, sum: 303, withdraw: true}, function (res) {
        assert.ok(res.id, "Operation Processing: " + res.id + errorMsg(res));
        var date = new Date();
        date.setDate(date.getDate() + 7);
        request("POST", "operations/planned", {id: res.id, date: date.toDateString()}, function (r) {
            assert.ok(r.result, "Operation done: " + r.result + errorMsg(r));
            done();
        });
    });
});

//QUnit.test( "Снять со счета 10 сегодня (запланировано)", function( assert ) {
//    var done = assert.async();
//    request("POST", "operations/create", {id: accountId, sum: 10, withdraw:true}, function(res){
//        assert.ok( res.id, "Operation Processing: " + res.id + errorMsg(res));
//        var date = new Date();
//        date.setDate(date.getDate() + 0);
//        request("POST", "operations/planned", {id: res.id, date: date.toDateString()}, function(r){
//            assert.ok( r.result, "Operation done: " + r.result + errorMsg(r));
//            done();
//        });
//    });
//});
//
//QUnit.test( "Пополнить счет на 15 сегодня (запланировано)", function( assert ) {
//    var done = assert.async();
//    request("POST", "operations/create", {id: accountId, sum: 15, withdraw:false}, function(res){
//        assert.ok( res.id, "Operation Processing: " + res.id + errorMsg(res));
//        var date = new Date();
//        date.setDate(date.getDate() + 0);
//        request("POST", "operations/planned", {id: res.id, date: date.toDateString()}, function(r){
//            assert.ok( r.result, "Operation done: " + r.result + errorMsg(r));
//            done();
//        });
//    });
//});
//
//QUnit.test( "Списание с запланированных счетов (CRON)", function( assert ) {
//    var done = assert.async();
//    request("GET", "cron/planned", {}, function(res){
//        assert.ok( res.response, "RESPONSE: " + res.response + errorMsg(res));
//        done();
//    });
//});

QUnit.test("Получить остаток средств на счете", function (assert) {
    var done = assert.async();
    request("POST", "accounts/get_sum", {id: accountId}, function (res) {
        assert.ok(res.sum, "Sum: " + res.sum + errorMsg(res));
        done();
    });
});

QUnit.test("Создание услуги с предоплатой (стоимость 50)", function (assert) {
    var done = assert.async();
    request("POST", "services/create", {name: "test service with prepayment", cost: 50, days: 14, prepayment: true}, function (res) {
        servicePrepayment = res.service_id;
        assert.ok(res.service_id, "RESULT: " + JSON.stringify(res.service_id) + errorMsg(res));
        done();
    });
});

QUnit.test("Создание услуги (стоимость 500)", function (assert) {
    var done = assert.async();
    request("POST", "services/create", {name: "test service", cost: 500}, function (res) {
        serviceId = res.service_id;
        assert.ok(res.service_id, "RESULT: " + JSON.stringify(res.service_id) + errorMsg(res));
        done();
    });
});

QUnit.test("Создание услуги со счетчиком (стоимость 400)", function (assert) {
    var done = assert.async();
    request("POST", "services/create", {name: "service counter!!!", cost: 400, counts: 5}, function (res) {
        serviceCounter = res.service_id;
        assert.ok(res.service_id, "RESULT: " + JSON.stringify(res.service_id) + errorMsg(res));
        done();
    });
});

QUnit.test("Получить инфу по услуге со счетчиком (пред.)", function (assert) {
    var done = assert.async();
    request("POST", "services/get", {service_id: serviceId}, function (res) {
        assert.ok(res.services, "RESULT: " + JSON.stringify(res.services) + errorMsg(res));
        done();
    });
});

QUnit.test("Список всех услуг", function (assert) {
    var done = assert.async();
    request("POST", "services/get", {}, function (res) {
        assert.ok(res.services, "RESULT: " + JSON.stringify(res.services) + errorMsg(res));
        done();
    });
});

QUnit.test("Подключить обычную услугу на счет", function (assert) {
    var done = assert.async();
    new request("POST", "services/add", {service_id: serviceId, account_id: accountId}, function (res) {
        assert.ok(res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

var serviceAccountCounter = null; //id подключенной услуги со счетчиком 
QUnit.test("Подключить услугу со счетчиком на счет", function (assert) {
    var done = assert.async();
    console.log("!!!!!!!!!!!!!!=" + serviceCounter);
    request("POST", "services/add", {service_id: serviceCounter, account_id: accountId}, function (res) {
        serviceAccountCounter = res.result;
        assert.ok(res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        console.log(serviceAccountCounter);
        request("POST", "services/on_account", {service_account_id: serviceAccountCounter}, function (service) {
            console.log(service);
            assert.equal(service.result[0].service_counts, 5, "Counts limit on this Service = 5; Errors:" + errorMsg(service));
            request("POST", "services/set_count", {service_account_id: serviceAccountCounter}, function (service2) {
                console.log(service2);
                assert.equal(service2.result[0].service_counts, 4, "-1 count. Counts limit on this Service = 4; Errors:" + errorMsg(service2));
                done();
            });
        });
    });
});

//QUnit.test( "Баланс счетчика", function( assert ) {
//    var done = assert.async();
//    request("POST", "services/on_account", {service_account_id: serviceAccountCounter}, function(service){
//        console.log(service);
//        assert.equal(service.result[0].service_counts, 10, "Counts limit on this Service = 10; Errors:" + errorMsg(res));
//        done();
//    });
//});

QUnit.test("Подключить услугу c предоплатой на счет", function (assert) {
    var done = assert.async();
    console.log({service_id: servicePrepayment, account_id: accountId});
    request("POST", "services/add", {service_id: servicePrepayment, account_id: accountId}, function (res) {
        console.log(res);
        assert.ok(res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test("Все услуги на счету", function (assert) {
    var done = assert.async();
    request("POST", "services/on_account", {account_id: accountId}, function (res) {
        assert.equal(res.result.length, 3, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test("Все операции по счету", function (assert) {
    var done = assert.async();
    request("POST", "operations/get", {id: accountId}, function (res) {
        assert.equal(res.result.length, 9, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test("Все пройденные операции по счету", function (assert) {
    var done = assert.async();
    request("POST", "operations/get", {id: accountId, status: 'done'}, function (res) {
        assert.equal(res.result.length, 3, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test("Запланированные операции по счету", function (assert) {
    var done = assert.async();
    request("POST", "operations/get", {id: accountId, status: 'planned'}, function (res) {
        assert.equal(res.result.length, 4, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});


QUnit.test("Пройденные операции списания по счету", function (assert) {
    var done = assert.async();
    request("POST", "operations/get", {id: accountId, type: 'withdraw', status: 'done'}, function (res) {
        assert.equal(res.result.length, 2, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test("НЕ пройденные операции списания по счету", function (assert) {
    var done = assert.async();
    request("POST", "operations/get", {id: accountId, type: 'withdraw', status: 'canceled'}, function (res) {
        assert.equal(res.result.length, 1, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test("Приостановить обычную услугу со счета", function (assert) {
    var done = assert.async();
    request("POST", "services/pause", {service_id: serviceId, account_id: accountId}, function (res) {
        console.log(res);
        assert.ok(res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test( "Удалить обычную услугу (получится, хотя она подключена на счет)", function( assert ) {
    var done = assert.async();
    request("POST", "services/delete", {service_id: serviceId}, function(res){
        assert.ok(res.result , "Удаление услуги. Message: " + res.result + errorMsg(res));
        request("POST", "services/on_account", {account_id: accountId}, function (res) {
            assert.equal(res.result.length, 3, "Сколько услуг на аккаунте: " + JSON.stringify(res.result) + errorMsg(res));
            request("POST", "services/get", {}, function (res) {
                var match = false;
                for(var i in res.services){
                    if(res.services[i].bill_services_id == serviceId)
                        match = true;
                }
                assert.notOk(match, "Есть ли удаленная услуга в общем списке: " + JSON.stringify(res.services) + errorMsg(res));
                done();
            });
        });
    });
});

QUnit.test("Вернуть услуге активность после удаления", function (assert) {
    var done = assert.async();
    request("POST", "services/enable", {service_id: serviceId}, function (res) {
        assert.ok(res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test("Отключить обычную услугу со счета", function (assert) {
    var done = assert.async();
    request("POST", "services/delete", {service_id: serviceId}, function(res){
        request("POST", "services/disable", {service_id: serviceId, account_id: accountId}, function (res) {
            assert.ok(res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
            done();
        });
    });
});

QUnit.test("Полностью удалить обычную услугу", function (assert) {
    var done = assert.async();
    request("POST", "services/hard_delete", {service_id: serviceId}, function (res) {
        assert.ok(res.result, "Message: " + res.result + errorMsg(res));
        done();
    });
});

QUnit.test("Изменение услуги c спредоплатой (с 50 на 1000)", function (assert) {
    var done = assert.async();
    request("POST", "services/change", {service_id: servicePrepayment, cost: 1000, days: 7}, function (res) {
        assert.ok(res.service_id, "RESULT: " + JSON.stringify(res.service_id) + errorMsg(res));
        done();
    });
});

QUnit.test("Подключить услугу c предоплатой на счет (не хватит денег)", function (assert) {
    var done = assert.async();
    request("POST", "services/add", {service_id: servicePrepayment, account_id: accountId}, function (res) {
        assert.ok(res.error, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test("Получить остаток средств на счете", function (assert) {
    var done = assert.async();
    console.log(accountId);
    request("POST", "accounts/get_sum", {id: accountId}, function (res) {
        assert.equal(res.sum, 50, "Sum: " + res.sum + errorMsg(res));
        done();
    });
});

QUnit.test("Полностью удалить услугу с предоплатой (не выйдет, надо сначала отключить)", function (assert) {
    var done = assert.async();
    request("POST", "services/hard_delete", {service_id: servicePrepayment}, function (res) {
        assert.ok(res.error, "Message: " + res.result + errorMsg(res));
        done();
    });
});

QUnit.test("Удалить услугу с предоплатой (отключить) и отписать со всех счетов", function (assert) {
    var done = assert.async();
    request("POST", "services/delete", {service_id: servicePrepayment, unsubscribe: true}, function (res) {
        assert.ok(res.result, "Message: " + res.result + errorMsg(res));
        done();
    });
});

QUnit.test("Удалить услугу со счетчиком (отключить) и отписать со всех счетов", function (assert) {
    var done = assert.async();
    request("POST", "services/delete", {service_id: serviceCounter, unsubscribe: true}, function (res) {
        assert.ok(res.result, "Message: " + res.result + errorMsg(res));
        done();
    });
});

QUnit.test("Полностью удалить услугу с предоплатой", function (assert) {
    var done = assert.async();
    request("POST", "services/hard_delete", {service_id: servicePrepayment}, function (res) {
        assert.ok(res.result, "Message: " + res.result + errorMsg(res));
        done();
    });
});

QUnit.test("Полностью удалить услугу со счетчиком", function (assert) {
    var done = assert.async();
    request("POST", "services/hard_delete", {service_id: serviceCounter}, function (res) {
        assert.ok(res.result, "Message: " + res.result + errorMsg(res));
        done();
    });
});

QUnit.test("Пополнить счет на 150 на несуществующем id", function (assert) {
    var done = assert.async();
    request("POST", "operations/create", {id: 555, sum: 150}, function (res) {
        assert.ok(res.error, "Operation Processing: " + res.id + errorMsg(res));
        done();
    });
});

QUnit.test("Пополнить счет, но не передать сумму", function (assert) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId}, function (res) {
        assert.ok(res.error, "Пустая сумма " + res + " " + errorMsg(res));
        done();
    });
});

QUnit.test("Пополнить счет на '8рк.9' (некорректная сумма)", function (assert) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId, sum: "8рк.9"}, function (res) {
        assert.ok(res.error, "Неверная сумма " + res + " " + errorMsg(res));
        done();
    });
});

QUnit.test("Снять со счета 03 на несуществующей дате", function (assert) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId, sum: 03, withdraw: true}, function (res) {
        assert.ok(res.id, "Operation Processing: " + res.id + errorMsg(res));
        var date = new Date();
        date.setDate(date.getDate() + 7);
        request("POST", "operations/planned", {id: res.id}, function (r) {
            assert.ok(r.error, "Не указана дата " + r + errorMsg(r));
            done();
        });
    });
});

QUnit.test("Снять со счета 03 на невалидной дате", function (assert) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId, sum: 03, withdraw: true}, function (res) {
        assert.ok(res.id, "Operation Processing: " + res.id + errorMsg(res));
        var date = new Date();
        date.setDate(date.getDate() + 7);
        request("POST", "operations/planned", {id: res.id, date: "r5yh"}, function (r) {
            assert.ok(r.error, "Не верная дата " + r + errorMsg(r));
            done();
        });
    });
});

QUnit.test("Снять со счета 5 на прошедшей дате", function (assert) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId, sum: 03, withdraw: true}, function (res) {
        assert.ok(res.id, "Operation Processing: " + res.id + errorMsg(res));
        var date = new Date();
        date.setDate(date.getDate() + 7);
        request("POST", "operations/planned", {id: res.id, date: date.toDateString()-5}, function (r) {
            assert.ok(r.error, "Нельзя списать деньги задним числом " + r + errorMsg(r));
            done();
        });
    });
});

QUnit.test("Есть ли НЕсуществующий аккаунт", function (assert) {
    var done = assert.async();
    request("POST", "accounts/check_exist_account", {id: 846}, function (res) {
        assert.ok(res.error, "Аккаунт не существует " + res + errorMsg(res));
        done();
    });
});

QUnit.test("Есть ли НЕзаданный аккаунт", function (assert) {
    var done = assert.async();
    request("POST", "accounts/check_exist_account", {}, function (res) {
        assert.ok(res.error, "Аккаунт не задан " + res + errorMsg(res));
        done();
    });
});

QUnit.test("Есть ли НЕвалидный аккаунт", function (assert) {
    var done = assert.async();
    request("POST", "accounts/check_exist_account", {id: "g45d/ж"}, function (res) {
        assert.ok(res.error, "Неверный формат id счёта: " + errorMsg(res));
        done();
    });
});

QUnit.test("Есть ли существующий аккаунт", function (assert) {
    var done = assert.async();
    request("POST", "accounts/check_exist_account", {id: accountId}, function (res) {
        assert.ok(res.id, "Счёт существует " + res.id + " " +  errorMsg(res));
        done();
    });
});

QUnit.test("Получить список статусов оперций", function (assert) {
    var done = assert.async();
    request("POST", "operations/get_statuses", {}, function (res) {
        console.log(res);
        assert.ok(!res.error, "Statuses : " + JSON.stringify(res) + errorMsg(res));
        done();
    });
});

QUnit.test("Получить список типов оперций", function (assert) {
    var done = assert.async();
    request("POST", "operations/get_types", {}, function (res) {
        console.log(res);
        assert.ok(!res.error, "Types : " + JSON.stringify(res) + errorMsg(res));
        done();
    });
});

QUnit.test("Получить список статусов и типов оперций одновременно", function (assert) {
    var done = assert.async();
    request("POST", "operations/get_types_statuses", {}, function (res) {
        console.log(res);
        assert.ok(!res.error, "Types : " + JSON.stringify(res) + errorMsg(res));
        done();
    });
});

QUnit.test("Удалить счет (полное удаление, c ошибкой. Сначала надо сделать неактивным)", function (assert) {
    var done = assert.async();
    request("POST", "accounts/hard_delete", {id: accountId}, function (res) {
        assert.ok(res.error, "Message: " + res.result + errorMsg(res));
        done();
    });
});

QUnit.test("Удалить счет (сделать неактивным)", function (assert) {
    var done = assert.async();
    request("POST", "accounts/delete", {id: accountId}, function (res) {
        assert.ok(res.result, "Message: " + res.result + errorMsg(res));
        done();
    });
});

QUnit.test("Удалить счет (полное удаление)", function (assert) {
    var done = assert.async();
    request("POST", "accounts/hard_delete", {id: accountId}, function (res) {
        assert.ok(res.result, "Message: " + res.result + errorMsg(res));
        done();
    });
});
