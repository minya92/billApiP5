/**
 * 
 * @author User
 */
define('Bill', ['orm', 'forms', 'ui'], function (Orm, Forms, Ui, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);
        
        self.show = function () {
            form.show();
        }; 
        
        self.setParams= function (Title) {
            if(Title)form.title = "Ваш счёт (" + Title + ")";
        };         
        
        model.requery(function () {
            // TODO : place your code here
        });
        
    }
    return module_constructor;
});
