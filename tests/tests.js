/* 
 * Выполнение метода api
 */
function request(httpMethod, apiMethod, params, callback){
    $.ajax({
        url: "/bill/application/" + apiMethod,
        data: params,
        type: httpMethod,
        complete : function(dat){
            //console.log(dat);
            if(dat.status == 200){
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

function errorMsg(aResult){
    var res = " ";
    if(aResult.error)
        res += "Error: " + aResult.error;
    if(aResult.response)
        res += " Response: " + aResult.response;
    return res;
}

var accountId = null;
var serviceId = null;

QUnit.test( "Get Sum from NOT existing account", function( assert ) {
    var done = assert.async();
    request("POST", "accounts/get_sum", {id: accountId}, function(res){
        assert.ok( !res.sum , "Sum: " + res.sum + errorMsg(res));
        done();
    });
});

QUnit.test( "Create Billing account", function( assert ) {
    var done = assert.async();
    request("POST", "accounts/create", null, function(res){
        assert.ok( res.account_id, "Bill account created: id=" + res.account_id + errorMsg(res));
        accountId = res.account_id;
        done();
    });
});

QUnit.test( "Add 500 coins on Account", function( assert ) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId, sum: 500}, function(res){
        assert.ok( res.id, "Operation Processing: " + res.id + errorMsg(res));
        request("POST", "operations/done", {id: res.id}, function(r){
            assert.ok( r.result, "Operation done: " + r.result + errorMsg(r));
            done();
        });
    });
});

QUnit.test( "Remove 400 coins on Account", function( assert ) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId, sum: 400, withdraw:true}, function(res){
        assert.ok( res.id, "Operation Processing: " + res.id + errorMsg(res));
        request("POST", "operations/done", {id: res.id}, function(r){
            assert.ok( r.result, "Operation done: " + r.result + errorMsg(r));
            done();
        });
    });
});

QUnit.test( "Remove 101 coins on Account", function( assert ) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId, sum: 101, withdraw:true}, function(res){
        assert.ok( res.id, "Operation Processing: " + res.id + errorMsg(res));
        request("POST", "operations/done", {id: res.id}, function(r){
            assert.ok( !r.result, "Operation done: " + r.result + errorMsg(r));
            done();
        });
    });
});

QUnit.test( "Remove 303 coins on the next Week", function( assert ) {
    var done = assert.async();
    request("POST", "operations/create", {id: accountId, sum: 303, withdraw:true}, function(res){
        assert.ok( res.id, "Operation Processing: " + res.id + errorMsg(res));
        var date = new Date();
        date.setDate(date.getDate() + 7);
        request("POST", "operations/planned", {id: res.id, date: date.toDateString()}, function(r){
            assert.ok( r.result, "Operation done: " + r.result + errorMsg(r));
            done();
        });
    });
});

QUnit.test( "Get Sum from existing account", function( assert ) {
    var done = assert.async();
    request("POST", "accounts/get_sum", {id: accountId}, function(res){
        assert.ok( res.sum, "Sum: " + res.sum + errorMsg(res));
        done();
    });
});

QUnit.test( "Get All operations from account", function( assert ) {
    var done = assert.async();
    request("POST", "operations/get", {id: accountId}, function(res){
        assert.ok( res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test( "Get All DONE operations from account", function( assert ) {
    var done = assert.async();
    request("POST", "operations/get", {id: accountId, status: 'done'}, function(res){
        assert.ok( res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test( "Get DONE Withdraw operations from account", function( assert ) {
    var done = assert.async();
    request("POST", "operations/get", {id: accountId, type: 'withdraw', status: 'done'}, function(res){
        assert.ok( res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test( "Get CANCEL Withdraw operations from account", function( assert ) {
    var done = assert.async();
    request("POST", "operations/get", {id: accountId, type: 'withdraw', status: 'canceled'}, function(res){
        assert.ok( res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test( "Create Service", function( assert ) {
    var done = assert.async();
    request("POST", "services/create", {name: "TEST SERVICE", sum: 500, days: 7}, function(res){
        serviceId = res.service_id;
        assert.ok( res.service_id, "RESULT: " + JSON.stringify(res.service_id) + errorMsg(res));
        done();
    });
});

QUnit.test( "Get last added service", function( assert ) {
    var done = assert.async();
    request("POST", "services/get", {service_id: serviceId}, function(res){
        assert.ok( res.services, "RESULT: " + JSON.stringify(res.services) + errorMsg(res));
        done();
    });
});

QUnit.test( "Get All Services List", function( assert ) {
    var done = assert.async();
    request("POST", "services/get", {}, function(res){
        assert.ok( res.services, "RESULT: " + JSON.stringify(res.services) + errorMsg(res));
        done();
    });
});

QUnit.test( "Add service on account", function( assert ) {
    var done = assert.async();
    request("POST", "services/addOnAccount", {service_id: serviceId, account_id: accountId}, function(res){
        console.log(res);
        assert.ok( res.result, "RESULT: " + JSON.stringify(res.result) + errorMsg(res));
        done();
    });
});

QUnit.test( "Del Bill Account account", function( assert ) {
    var done = assert.async();
    request("POST", "accounts/delete", {id: accountId}, function(res){
        assert.ok( res.message , "Message: " + res.message + errorMsg(res));
        done();
    });
});