# Operations (операции)

### *- обязательные параметры

 **Создание операции**
 
    @POST /operations/create
    @GET /operations/create
    id - account_id *
    sum: средства по операции *
    witdraw : true / false - является ли операция операцией списания, по умолчанию false (пополнение)
    return {
        id: operation_id
        account_id: anAccountId,
        operation_sum: aSum,
        operation_date: new Date(),
        operation_type: anOperationType,
        operation_status: status,
        bill_services_accounts: servicesOnAccountId
    }
    
 **Пометить операцию выполненной**
 
    @POST /operations/done
    @GET /operations/done
    id - operation_id *
    return {result: xxxx, error: xxxx}
    
 **Получить список оперций по счету**
 
    @POST /operations/get
    @GET /operations/get
    id - account_id *
    type: тип операции ('replenish', 'withdraw')
    status: статус ('done', 'canceled', 'processing', 'planned')
    return [{operation1}, {operation2}, ...]
    
 **Запланировать операцию на дату**
 
    @POST /operations/done
    @GET /operations/done
    id - operation_id *
    date - дата date.toDateString() ('Fri Mar 18 2016') *
    return {result: xxxx, error: xxxx}
    