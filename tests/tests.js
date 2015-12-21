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
                callback({error: "Server error 500"});
            }
        }
    });
}

QUnit.test( "Create Billing account", function( assert ) {
    var done = assert.async();
    request("POST", "accounts/create", null, function(res){
        console.log(res);
        assert.ok( res.account_id, "Bill account created: id=" + res.account_id + " Error:" + res.error);
        done();
    });
});
