/**
 *    Copyright 2016 Valeriy Maslov
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */
define(['./HttpEntity','./ContentType'],function(HttpEntity,ContentType) {
    var HttpGet = Java.type('org.apache.http.client.methods.HttpGet');
    var HttpHead = Java.type('org.apache.http.client.methods.HttpHead');
    var HttpOptions = Java.type('org.apache.http.client.methods.HttpOptions');
    var HttpPatch = Java.type('org.apache.http.client.methods.HttpPatch');
    var HttpPost = Java.type('org.apache.http.client.methods.HttpPost');
    var HttpPut = Java.type('org.apache.http.client.methods.HttpPut');
    var HttpTrace = Java.type('org.apache.http.client.methods.HttpTrace');
    
    /**
     * HttpRequest is JS wrapper for Java classes which implement Apache httpcore requests
     * 
     * @class
     * @param {String} method
     * @param {String || java.net.URI} URI
     * @param {JSON} options
     */
    function HttpRequest(method,URI,options) {
        var self = this;
        var instance = instantiateByMethod(method,URI);
        var charset = "UTF-8";
        
        /**
         * Java instance of http request
         */
        Object.defineProperty(this,'instance',{
            get: function() {
                return instance;
            }
        });
        
        /**
         * Method allows to set entity content for this request
         * Notice that new call of this method will rewrite existing entity
         * 
         * @param {ContentType} type
         * @param {Object} content
         */
        Object.defineProperty(this,'setContent',{
            value: function(type,content) {
                var entity = new HttpEntity(type.withCharset(charset),content);
                instance.setEntity(entity.instance);
            }
        });
        
        /**
         * Method sets charset of current entity (actual for string-based mime types)
         * 
         * @param {String} charset
         */
        Object.defineProperty(this,'setCharset',{
            value: function(value) {
                charset = value;
                var entity = instance.getEntity();
                if (entity) {
                    entity.setContentEncoding(charset);
                    instance.setEntity(entity);
                }
            }
        });
        
        /**
         * Property which is encapsulate ContentType wrapper
         */
        Object.defineProperty(this,'types',{
            value: ContentType
        });

    }
    
    function instantiateByMethod(method,URI) {
        switch(method.toUpperCase()) {
            case 'OPTIONS':
                return new HttpOptions(URI);
            case 'HEAD':
                return new HttpHead(URI);
            case 'GET':
                return new HttpGet(URI);
            case 'POST':
                return new HttpPost(URI);
            default:
                return null;
        }
    }
    
    return HttpRequest;

});