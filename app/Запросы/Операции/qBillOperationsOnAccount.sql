/**
 * 
 * @author Work
 * @name qBillOperationsOnAccount
 */ 
Select * 
From bill_operations t
 Where :account_id = t.account_id
 and (:type = t.operation_type or :type is null)
 and (:status = t.operation_status or :status is null)