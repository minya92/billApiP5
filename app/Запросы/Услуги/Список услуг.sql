/**
 * @author Work
 * @name qServiceList
 */ 
Select * 
From bill_services t1
 Inner Join bill_cost t on t1.bill_services_id = t.service_id
 Where (:service_id = t1.bill_services_id or :service_id is null)
 and t.end_date is null