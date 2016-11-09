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
    
 **Удалить счет (делает неактивным)**
 
    @POST /accounts/delete
    @GET /accounts/delete
    id - account_id *
    return {result: xxxxxxxxxx, error: xxxx}
    
 **Удалить счет (полное удаление из БД)**
 
    @POST /accounts/hard_delete
    @GET /accounts/hard_delete
    id - account_id *
    return {result: xxxxxxxxxx, error: xxxx}

 **Проверить, существует ли счет**
 
    @POST /accounts/check_exist_account
    @GET /accounts/check_exist_account
    id - account_id *
    return {result: xxxxxxxxxx, error: xxxx}

 **Получить список всех счетов**
 
    @POST /accounts/get_accounts
    @GET /accounts/get_accounts
    limit - сколько вернуть записей (по умолчанию 50)
    offset - сдвиг от начала
    return {result: xxxxxxxxxx, error: xxxx}