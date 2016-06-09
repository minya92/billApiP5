/**
 *
 * @author Work
 * @name qBillAccounts
 */ 
Select * 
From bill_accounts t1
 Where :account_id = t1.bill_accounts_id or :account_id is null