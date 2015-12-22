/* 
 * Выполнение метода api
 */
function request(httpMethod, apiMethod, params, callback){
    $.ajax({
        url: "/bill/application/" + apiMethod,
        data: params,
        type: httpMethod,
        complete : function(dat){
            console.log(dat);
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
        res += " Respose: " + aResult.response;
    return res;
}

QUnit.test( "Create Billing account", function( assert ) {
    var done = assert.async();
    request("POST", "accounts/create", null, function(res){
        assert.ok( res.account_id, "Bill account created: id=" + res.account_id + errorMsg(res));
        done();
    });
});

QUnit.test( "Get Sum from existing account", function( assert ) {
    var done = assert.async();
    request("POST", "accounts/get_sum", {id: '145069357181001'}, function(res){
        assert.ok( res.sum, "Sum: " + res.sum + errorMsg(res));
        done();
    });
});

QUnit.test( "Get Sum from NOT existing account", function( assert ) {
    var done = assert.async();
    request("POST", "accounts/get_sum", {id: '145069357181'}, function(res){
        assert.ok( !res.sum , "Sum: " + res.sum + errorMsg(res));
        done();
    });
});

QUnit.test( "Del Bill Account account", function( assert ) {
    var done = assert.async();
    request("POST", "accounts/delete", {id: '145079353812919'}, function(res){
        assert.ok( res.message , "Message: " + res.message + errorMsg(res));
        done();
    });
});