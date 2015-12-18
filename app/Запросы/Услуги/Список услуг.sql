/**
 * @author Work
 * @name qServiceList
 * @writable bill_services
 */ 
Select * 
From bill_services t1
 Inner Join bill_cost t on t1.bill_services_id = t.service_id
 Inner Join bill_services_types t2 on t1.service_type_id = t2.bill_services_types_id
 Where (:service_id = t1.bill_services_id or :service_id is null)
 and t.end_date is null