/**
 * 
 * @author Алексей
 * @stateless
 * @public 
 */
define('MetrikaLauncher', ['orm', 'rpc'], function (Orm, Lpc, ModuleName) {
    function launch(aMetrikaId, aMessage, aTime, aSuccess, aFailure) {
        var model = Orm.loadModel(ModuleName);

        var metrika = new Lpc.Proxy('MetrikaResident');
        var metrikaID = aMetrikaId;
        model.qMtkShot.push({
            mtk_label: metrikaID,
            shot_message: aMessage ? aMessage : null,
            shot_time: aTime ? aTime : new Date()
        });
        
        var shotID = model.qMtkShot.cursor.mtk_shots_id;
        save(aSuccess, aFailure);
        
        var saving = false;
        function save(success, failure) {
            if (!saving) {
                saving = true;
                model.save(function() {
                    saving = false;
                    metrika.shot(metrikaID);
                    success(model.qMtkShot.cursor.mtk_shots_id);
                }, function() {
                    saving = false;
                    failure();
                });
            } else {
                setTimeout(function(){save(success, failure);}, 100);
            }
        }
        
        this.checkpoint = function(aCPLabel, aTime, aSuccess, aFailure) {
            model.qMtkShot.push({
                mtk_label: metrikaID,
                shot_message: aCPLabel ? aCPLabel : 'checkpoint',
                shot_time: aTime ? aTime : new Date(),
                con_shot: shotID
            });
            save(aSuccess, aFailure);
        };
        
        this.end = function(aTime, aSuccess, aFailure) {
            model.qMtkShot.push({
                mtk_label: metrikaID,
                shot_message: 'end',
                shot_time: aTime ? aTime : new Date(),
                con_shot: shotID
            });
            save(aSuccess, aFailure);            
        };
    }
    return launch;
});
