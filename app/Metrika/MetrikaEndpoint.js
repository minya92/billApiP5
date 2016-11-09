/**
 * @public
 * @stateless
 */
define('MetrikaEndpoint', ['rpc', 'logger'], function (Lpc, Logger) {
    function mc() {
        var metrika = new Lpc.Proxy('MetrikaResident');
        var id;
        this.onopen = function (session) {
            id = session.id;
            metrika.add(id, function(aData){
                session.send(aData);
            });
        };
        this.onclose = function (evt) {
            // evt.id - Session id
            // evt.wasClean - True if session was closed without an error
            // evt.code - Session close code
            // evt.reason - Description of session close
            metrika.remove(evt.id);
        };
        this.onmessage = function (evt) {
            // evt.id - Session id
            // evt.data - Text data recieved from other (client) endpoint
            metrika.processMessage(evt.id, evt.data);
        };
        this.onerror = function (evt) {
            // evt.id - Session id
            // evt.message - Error message from container's exception
        };
    }
    return mc;
});

