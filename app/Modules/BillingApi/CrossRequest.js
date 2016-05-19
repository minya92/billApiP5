/**
 * @author Work
 * @constructor
 */
define('CrossRequest', ['logger'], function(Logger, ModuleName){
    function CrossRequest() {
        var self = this;
        var HTTP_METHOD_GET = "GET";
        var HTTP_METHOD_POST = "POST";
        var CONTENT_TYPE_HEADER_NAME = "Content-Type";
        var BASIC_AUTH_HEADER_NAME = "Authorization";
        var JSON_CONTENT_TYPE = "application/json; charset=utf-8";
        var FORM_URLENCODED_CONTENT_TYPE = "application/x-www-form-urlencoded";

        /*
         * Creates an URL connection
         * Basic authorisation if auth params is specified
         */
        self.UrlConnection = function(aURL, aParams, aMethod, anUserName, aPassword){
            //var urlStr = self.getUrlString(aURL, aParams);
            var urlStr = aURL;
            var urlObj = new (Java.type('java.net.URL'))(urlStr);
            var con = urlObj.openConnection();

            con.setRequestMethod(aMethod?aMethod:HTTP_METHOD_GET);
            if (aMethod === HTTP_METHOD_POST && aParams) {
                con.setDoOutput(true);
                var wr = new (Java.type('java.io.DataOutputStream'))(con.getOutputStream());
                try {
                    wr.writeBytes(serializeUrlEncoded(aParams));
                    wr.flush();
                } finally {
                    wr.close();
                }
            }
//            var res = {
//                code    : con.getResponseCode(),
//                response: getResponseFromCon(con)
//            };
//            Logger.info('\n' + res.code + ' res: ' + res.response)
            return getResponseFromCon(con);
            //aCallBack(getResponseFromCon(con));
        };   

        function getResponseFromCon(aCon){
            var response ="";
            var buf = Java.type('java.io.BufferedReader');
            var reader = new buf(new (Java.type('java.io.InputStreamReader'))(aCon.getInputStream()));
            try {
                var inputLine;
                while (true) {
                    inputLine = reader.readLine();
                    if (inputLine === null) {
                        break;
                    }
                    response = response + inputLine + "\n";
                }
            } catch(e) {
                Logger.severe(e);
            }
            finally {
                reader.close();
            }
            return response;
        };

        self.getUrlString = function(aURL, aParams){
            return aParams ? 
                        aURL + (aURL[aURL.length-1] === '/' ? '' : '/') 
                        + '?' + serializeUrlEncoded(aParams)
                    :
                        aURL;
        };

//        function getBasicAuthHeaderValue(anUserName, aPassword) {
//            var userPass = new java.lang.String(anUserName + ":" + aPassword);
//            return "Basic " + javax.xml.bind.DatatypeConverter.printBase64Binary(userPass.getBytes());   
//        }

        function serializeUrlEncoded(obj, prefix) {
            var str = [];
            for (var p in obj) {
                var k = prefix ? prefix + "[]" : p, v = obj[p];
                str.push(typeof v === "object" ?
                        serializeUrlEncoded(v, k) :
                        encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
            return str.join("&");
        }

        function unserialize(str) {
            var obj;
            try {
                obj = JSON.parse(str);
            } catch (ex) {
                obj = str;
            }
            return obj;
        }
    }
    return CrossRequest;
});