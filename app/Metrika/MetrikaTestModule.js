/**
 * 
 * @author Алексей
 * @statefull
 * @public 
 */
define('MetrikaTestModule', ['orm', 'MetrikaLauncher', 'logger'], function (Orm, metrika, Log, ModuleName) {
    function module_constructor() {
        var self = this, model = Orm.loadModel(ModuleName);
        
        self.shot = function(labelId, success) {
            metrika(labelId, null, null, function() {success(true)}, function() {success(false)});
        };
        
        var m;
        self.startMetrika = function(labelId, success) {
            m = new metrika(labelId, null, null, function() {success(true)}, function() {success(false)});
        };
        self.checkpoint = function(pointId, success) {
            m.checkpoint(pointId, null, function() {success(true)}, function() {success(false)});
        };
        self.stopMetrika = function(success) {
            m.end(null, function() {success(true)}, function() {success(false)});
        };
    }
    return module_constructor;
});
