/**
 *
 * @author Work
 * @name qAccountsOnService
 * @public 
 */ 
Select * 
From bill_accounts t1
 Inner Join bill_services_accounts t on t.account_id = t1.bill_accounts_id
 Where :service_id = t.service_id