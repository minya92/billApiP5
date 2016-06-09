/**
 *
 * @author Work
 * @name qAccountsOnService
 * @public 
 */ 
Select * 
From bill_accounts t1
 Inner Join bill_services_accounts t on t.account_id = t1.bill_accounts_id
 Left Join (
    select t3.bill_operations_id, t3.operation_sum, t3.operation_date, 
        t3.operation_type, t3.operation_status, t3.bill_services_accounts as bill_services_acts
     from bill_services_accounts t4 
    Inner join bill_operations t3 on t3.bill_services_accounts = t4.bill_services_accounts_id
    where :service_id = t4.service_id
    order by t3.operation_date 
) t2
on t2.bill_services_acts = t.bill_services_accounts_id
 Where :service_id = t.service_id