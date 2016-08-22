/**
 * @author minya92
 * @name qAddService
 * @writable bill_services_accounts
 */ 
Select t.*, t1.*, max(operation_date) as operation_date
From bill_services_accounts t1
 Inner Join bill_services t on t.bill_services_id = t1.service_id
 Inner Join bill_operations t2 on t1.bill_services_accounts_id = t2.bill_services_accounts
 Where (t1.account_id = :account_id or :account_id is null)
 and (t1.service_id = :service_id or :service_id is null)
 and (t1.bill_services_accounts_id = :service_account_id or :service_account_id is null)
Group by t1.bill_services_accounts_id, t1.account_id, t1.service_id, 
t1.service_start_date, t1.service_end_date, t1.paused, t1.service_counts, t.bill_services_id, 
t.service_name, t.locked, t.deleted, t.service_desc