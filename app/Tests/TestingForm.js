/**
 * 
 * @author Work
 * {global P}
 */
function TestingForm() {
    var self = this
            , model = P.loadModel(this.constructor.name)
            , form = P.loadForm(this.constructor.name, model);
    
    self.show = function () {
        form.show();
    };
    
    var url = new P.ServerModule("URL_handler");
    
    model.requery(function () {
        // TODO : place your code here
    });
    
    form.button.onActionPerformed = function(event) {
        form.tfResponse.text =  url.UrlConnection(form.tfQuery.text, null, 'POST', null, null);
    };
}