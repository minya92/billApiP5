/**
 * 
 * @author Алексей
 * @resident
 * @public
 */
define('MetrikaResident', ['orm', 'logger'], function (Orm, Logger, ModuleName) {
    function module_constructor() {
        var self = this, model = Orm.loadModel(ModuleName);

        var sessions = {};
        var labels = {};

        self.add = function (aSessionId, aOnMessage) {
            sessions[aSessionId] = {};
            sessions[aSessionId].process = aOnMessage;
//            aOnMessage('registered');// send 'registered' status
            Logger.info('add ' + aSessionId + '. sessions count: ' + Object.keys(sessions).length);
            aOnMessage('opened');
        };
        self.remove = function (aSessionId) {
            if (sessions[aSessionId].labels)
                sessions[aSessionId].labels.forEach(function (label) {
                    if (labels[label]) {
//                        TODO DELETE SESSION ID FROM HERE
                    }
                });
            delete sessions[aSessionId];
        };
        self.processMessage = function (aSessionId, aData) {
            if (sessions[aSessionId]) {
                if (!sessions[aSessionId].labels)
                    sessions[aSessionId].labels = [];
                if (!labels[aData])
                    labels[aData] = [];
                labels[aData].push(aSessionId);
                sessions[aSessionId].labels.push(aData);
                sessions[aSessionId].process('Ok!');
            } else {
                Logger.warning('Error. No such session: ' + aSessionId);
            }
        };

        function shot(label) {
//            Logger.info('Message shot. Label: ' + label)
            if (labels[label])
                labels[label].forEach(function (sesId) {
                    if (sessions[sesId])
                        sessions[sesId].process(label);
                });
        }


        self.shot = shot;
    }
    return module_constructor;
});
