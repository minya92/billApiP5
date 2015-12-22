/**
 * @author minya92
 * @name qGetAccountBalance
 */ 

Select t1.account_id, sum(t1.operation_sum * t.multiplier) as account_balance
From bill_operations t1
 Inner Join bill_operations_type t on t1.operation_type = t.bill_operations_type_id
where (t1.operation_status = 1) and :account_id = t1.account_id
group by t1.account_id