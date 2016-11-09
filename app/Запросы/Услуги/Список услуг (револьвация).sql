/**
 *
 * @author minya92
 * @name qServiceListRevaluation
 * @writable bill_services_accounts
 */ 
Select t.*, t2.rev_days, t2.cost_counts, t1.rev_transfer, t1.transfer, t1.once, t1.service_month, t2.service_days, t2.service_cost
From bill_services t1
 Inner Join bill_services_accounts t on t1.bill_services_id = t.service_id
 Inner Join bill_cost t2 on t.service_id = t2.service_id
 Where 
 to_char(t.rev_date, 'YY:MM:DD') = to_char(now(), 'YY:MM:DD')
 and t2.end_date is null