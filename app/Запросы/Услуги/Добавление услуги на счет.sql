/**
 * @author minya92
 * @name qAddService
 * @writable bill_services_accounts
 */ 
Select * 
From bill_services_accounts t1
 Inner Join bill_services t on t.bill_services_id = t1.service_id
 Where (t1.account_id = :account_id or :service_account_id is not null)
 and (t1.service_id = :service_id or :service_id is null)
 and (t1.bill_services_accounts_id = :service_account_id or :service_account_id is null)