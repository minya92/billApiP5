/**
 * @author Work
 * @module Events
 */
define('Events', ['orm'], function (Orm, ModuleName) {
    return function () {
        var self = this, model = Orm.loadModel(ModuleName);
        
        model.requery();
        
        self.addEvent = function(aEventType, aEventData){
            try {
                var evt = JSON.stringify(aEventData);
                model.eventById.push({
                    type        :   aEventType,
                    event_data  :   evt,
                    date        :   new Date()
                });
                model.save();
            } catch (e) {
                model.revert();
                //Logger.warning(e);
            }
        };
        
        self.execute = function () {
            // TODO : place application code here
        };
    };
});
