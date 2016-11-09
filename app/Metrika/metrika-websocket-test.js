"use strict";
if (!window.tests)
    window.tests = [];
tests.push({
    name: 'MetrikaWebsocketTests',
    description: 'Метрика',
    roles: ['anonymus'],
    repeats: 1,
    priority: 1,
    test:
        function (assert, userData, finish, crash) {
            var moduleName = "MetrikaTestModule";
            var ws, module;
            var labelIdToTest = '0';
            var labelIdToTestLong = '1';
            
            return getProxy(moduleName, assert)
                .then(function (aModule) {
                    module = aModule;
                    assert.ok(module.shot, 'API method exists');
                    return new Promise(function(resolve) {
                        console.log('Getting websocket connection...');
                        ws = wsConnection('MetrikaEndpoint', resolve);
                    });
                }).then(function() {
                    console.log('Done...1');
                    assert.ok(true, 'Getting metrika websocket connection');
                    return new Promise(function(resolve) {
                        var num = 0, res = '';
                        function checkAsync(ares) {
                            num++;
                            res += ares
                            console.log('Check async ' + num);
                            if (num == 2) {
                                resolve(res);
                            }
                        };
                        ws.message = checkAsync;
                        ws.send(labelIdToTest);
                        ws.send(labelIdToTestLong);
                    });
                }, crash).then(function(res) {
                    console.log('Done...2 ' + res);
                    assert.equal(res, 'Ok!Ok!', 'Websocket subscribtion status: ' + res);
                    return new Promise(function(resolve, reject) {
                        var metrikaSend = assert.async();
                        ws.message = checkAsync;
                        
                        var num = 0;
                        function checkAsync() {
                            num++;
                            console.log('Check async ' + num);
                            if (num == 2) {
                                resolve();
                                metrikaSend();
                            }
                        };
                        module.shot(labelIdToTest, function(res) {
                            console.log('Done...3 ' + res);
                            assert.ok(res, 'Sending metrika data');
                        }, reject);
                        module.startMetrika(labelIdToTestLong, function(res) {
                            console.log('Done...3-1 ' + res);
                            assert.ok(res, 'Sending long metrika data');
                        }, reject);
                    });
                }).then(function(res) {
                    return new Promise(function(resolve, reject) {
                        console.log('Done...4 ');
                        assert.ok(true, 'Websocket messages recieved');
                        ws.message = resolve;
                        module.checkpoint('A');
                    });
                }).then(function(res) {
                    return new Promise(function(resolve, reject) {
                        console.log('Done...5 ' + res);
                        assert.ok(res, 'Websocket message recieved: ' + res);
                        ws.message = resolve;
                        module.stopMetrika();
                    });
                }).then(function(res) {
//                    return new Promise(function(resolve, reject) {
                    console.log('Done...6 ' + res);
                    assert.ok(res, 'Websocket message recieved: ' + res);
//                        ws.message = resolve;
                    ws.close();
                    finish();                    
//                    });
                });
        }
});
