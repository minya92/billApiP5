"use strict";
if (!window.tests)
    window.tests = [];
tests.push({
    name: 'MetrikaTests',
    description: 'Метрика - нагрузочное тестирование',
    roles: ['anonymus'],
    repeats: 10,
    priority: 1,
    test:
        function (assert, userData, finish, crash) {
            var moduleName = "MetrikaTestModule";
            var module;
            var labelIdToTest = '0';
            var innerCount = 10;
            
            return getProxy(moduleName, assert)
                .then(function (aModule) {
                    module = aModule;
                    assert.ok(module.shot, 'API method exists');
                    
                    return new Promise(function(resolve, reject) {
                        var shotsEnabled = 0;
                        for  (var j = 0; j < innerCount; j++) {
                            module.shot('10', function(res) {
                                shotsEnabled++;
                                assert.ok(res, 'Sending metrika data');
                                if (shotsEnabled === innerCount)
                                    resolve();
                            }, reject);
                        }
                    });
                }).then(function() {
                    assert.ok(true, 'Data was successfully sent');
                    finish();                    
                }, crash);
        }
});
