# Accounts (счета)

### *- обязательные параметры

 **Создание нового счета**
 
    @POST /accounts/create
    @GET /accounts/create
    params null
    return {account_id: xxxxxxxxxx}
    
 **Получить сумму на счету**
 
    @POST /accounts/get_sum
    @GET /accounts/get_sum
    id - account_id *
    return {account_id: xxxxxxxxxx, sum: xxxx, error: xxxx}
    
 **Удалить счет**
 
    @POST /accounts/delete
    @GET /accounts/delete
    id - account_id *
    return {result: xxxxxxxxxx, error: xxxx}
    
