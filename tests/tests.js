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
            if (dat.status == 200) {
                callback(JSON.parse(dat.responseText));
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

QUnit.test("Снять со счета 101", function (assert) {
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

QUnit.test("Все операции по счету", function (assert) {
    var done = assert.async();
    request("POST", "operations/get", {id: accountId}, function (res) {
        assert.ok(res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test("Все пройденные операции по счету", function (assert) {
    var done = assert.async();
    request("POST", "operations/get", {id: accountId, status: 'done'}, function (res) {
        assert.ok(res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test("Пройденные операции списания по счету", function (assert) {
    var done = assert.async();
    request("POST", "operations/get", {id: accountId, type: 'withdraw', status: 'done'}, function (res) {
        assert.ok(res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test("НЕ пройденные операции списания по счету", function (assert) {
    var done = assert.async();
    request("POST", "operations/get", {id: accountId, type: 'withdraw', status: 'canceled'}, function (res) {
        assert.ok(res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

//12
QUnit.test("Создание услуги с предоплатой (50)", function (assert) {
    var done = assert.async();
    request("POST", "services/create", {name: "test service with prepayment", cost: 50, days: 14, prepayment: true}, function (res) {
        servicePrepayment = res.service_id;
        assert.ok(res.service_id, "RESULT: " + JSON.stringify(res.service_id) + errorMsg(res));
        done();
    });
});

QUnit.test("Создание услуги", function (assert) {
    var done = assert.async();
    request("POST", "services/create", {name: "test service", cost: 500}, function (res) {
        serviceId = res.service_id;
        assert.ok(res.service_id, "RESULT: " + JSON.stringify(res.service_id) + errorMsg(res));
        done();
    });
});

QUnit.test("Создание услуги со счетчиком", function (assert) {
    var done = assert.async();
    request("POST", "services/create", {name: "service counter!!!", cost: 500, counts: 5}, function (res) {
        serviceCounter = res.service_id;
        assert.ok(res.service_id, "RESULT: " + JSON.stringify(res.service_id) + errorMsg(res));
        done();
    });
});

QUnit.test("Получить инфу по предыдущей услуге", function (assert) {
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
    request("POST", "services/add", {service_id: serviceId, account_id: accountId}, function (res) {
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
    request("POST", "services/add", {service_id: servicePrepayment, account_id: accountId}, function (res) {
        assert.ok(res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test("Все услуги на счету", function (assert) {
    var done = assert.async();
    request("POST", "services/on_account", {account_id: accountId}, function (res) {
        console.log(res);
        assert.ok(res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
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

QUnit.test("Отключить обычную услугу со счета", function (assert) {
    var done = assert.async();
    request("POST", "services/disable", {service_id: serviceId, account_id: accountId}, function (res) {
        assert.ok(res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
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
    request("POST", "accounts/get_sum", {id: accountId}, function (res) {
        assert.ok(res.sum, "Sum: " + res.sum + errorMsg(res));
        done();
    });
});

//QUnit.test( "Удалить обычную услугу", function( assert ) {
//    var done = assert.async();
//    request("POST", "services/delete", {service_id: serviceId}, function(res){
//        assert.ok( res.result , "Message: " + res.result + errorMsg(res));
//        done();
//    });
//});

QUnit.test("Удалить услугу с предоплатой", function (assert) {
    var done = assert.async();
    request("POST", "services/delete", {service_id: servicePrepayment, unsubscribe: true}, function (res) {
        assert.ok(res.result, "Message: " + res.result + errorMsg(res));
        done();
    });
});

QUnit.test("Пополнить счет на 150 на несуществующем id", function (assert) {
    var done = assert.async();
    request("POST", "operations/create", {id: 555, sum: 150}, function (res) {
        assert.ok(res.id, "Operation Processing: " + res.id + errorMsg(res));
        request("POST", "operations/done", {id: res.id}, function (r) {
            assert.ok(r.result, "Operation done: " + r.result + errorMsg(r));
            done();
        });
    });
});

QUnit.test("Удалить счет", function (assert) {
    var done = assert.async();
    request("POST", "accounts/delete", {id: accountId}, function (res) {
        assert.ok(res.result, "Message: " + res.result + errorMsg(res));
        done();
    });
});
