/**
 *
 * @author Work
 * @name qBillAccountsLimit
 */ 
Select * 
From bill_accounts t1
 Where (:lim is not null or :lim is null)
 and (:off is not null or :off is null)
 Order by t1.bill_accounts_id