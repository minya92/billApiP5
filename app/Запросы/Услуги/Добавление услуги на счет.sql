/**
 * @author minya92
 * @name qAddService
 */ 
Select * 
From bill_services_accounts t1
where t1.account_id = :account_id and
(t1.service_id = :service_id or :service_id is null)