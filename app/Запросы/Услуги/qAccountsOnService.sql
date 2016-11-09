/**
 *
 * @author User
 * @name qAccountsOnService
 * @public 
 */ 
Select t1.account_id, t1.bill_services_accounts_id, t1.service_counts, t1.paused, max(operation_date) as operation_date
From bill_services_accounts t1
 Inner Join bill_operations t on t.bill_services_accounts = t1.bill_services_accounts_id
 Where :service_id = t1.service_id
GROUP BY t1.account_id, t1.bill_services_accounts_id, t1.service_counts, t1.paused
 Order by t1.account_id