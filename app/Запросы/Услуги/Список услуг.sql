/**
 * @author Work
 * @name qServiceList
 * @writable bill_services
 */ 
Select * 
From bill_services t1
 Left Join bill_cost t on t1.bill_services_id = t.service_id
 Where (:service_id = t1.bill_services_id or :service_id is null)
 and t.end_date is null
 and (t1.deleted is null or t1.deleted = false or :deleted = true)