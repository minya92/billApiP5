# Services (услуги)

### *- обязательные параметры

 **Создание услуги**
 
    @POST /services/create
    name - название *
    cost - абонентская плата *
    days - кол-во дней списания средств (по умолчанию 0)
    lock - заблокированная для удаления (по умолчанию false)
    afterMonth - ежемесечная true/false (по умолчанию true)
    prepayment - предоплата true/false  (по умолчанию false)
    once - одноразовая  true/false      (по умолчанию false)
    counts - счетчик                    (по умолчанию 0)
    return {
        service_id: id,
        service_cost: aCost,
        service_days: aDays,
        service_month: anAfterMonth,
        start_date: new Date(),
        prepayment: aPrepayment,
        once: anOnce,
        cost_counts: aCounter
    }
    
 **Изменение существующей услуги**
 
    @POST /services/change
    service_id - service_id *
    cost - абонентская плата
    days - кол-во дней списания средств 
    afterMonth - ежемесечная true/false 
    prepayment - предоплата true/false  
    once - одноразовая  true/false      
    counts - счетчик                    
    return {service_id: xxxx, error: xxxx}
    
 **Добавление услуги на счет**
 
    @POST /services/add
    service_id  *
    account_id  *
    return {result: servicesOnAccountId, error: xxxx}
    
 **Отключение услуги на счету**
 
    @POST /services/disable
    service_id  *
    account_id  *
    service_account_id - serviceOnAcoountId (получается при добавлении)
    return {result: xxxx, service_account_id: xxxx, error: xxxx}

 **Удаление услуги**
 
    @POST /services/delete
    service_id  *
    unsubscribe - true/false Отключить услугу у всех клинтов (По умолчанию false)
    return {result: xxxx, error: xxxx, accounts: [{account1}, {account2}]}

 **Приотсановить услугу на счету (заморозить)**
 
    @POST /services/pause
    service_id  *
    account_id  *
    service_account_id - serviceOnAcoountId (получается при добавлении)
    return {result: xxxx, service_account_id: xxxx, error: xxxx}

 **Получить услугу (услуги)**
 
    @POST /services/get
    service_id  
    return [{service1}, {service2}]
    
**Получить услугу на счету**
 
    @POST /services/on_account
    service_id  
    account_id 
    service_account_id - serviceOnAcoountId (получается при добавлении)
    return {result: [{service1}, {service2}], error: xxxx}

 **Изменить счетчик у услги на счету**
 
    @POST /services/set_count
    service_id  
    account_id  
    service_account_id - serviceOnAcoountId (получается при добавлении)
    count - значение счетчика. Рассчитывается по формуле: текущее_значение - count (по умолчанию 1)
    return {result: xxxx, service_counts: xxxx, error: xxxx}
