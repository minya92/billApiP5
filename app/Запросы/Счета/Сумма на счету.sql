/**
 * @author minya92
 * @name qGetAccountBalance
 */ 
Select t1.bill_accounts_id as account_id, case when sum(t2.operation_sum * t.multiplier) is null then 0 else sum(t2.operation_sum * t.multiplier) end AS account_balance 
From bill_accounts t1
 Left Join bill_operations t2 on t1.bill_accounts_id = t2.account_id
 Left Join bill_operations_type t on t2.operation_type = t.bill_operations_type_id
 Where (t2.operation_status = 1 or t2.operation_status is null)
 and  :account_id = t1.bill_accounts_id
 Group by t1.bill_accounts_id