/**
 * @author Work
 * @name qServiceList
 * @writable bill_services
 * @public
 */ 
Select * 
From bill_services t1
 Left Join bill_cost t on t1.bill_services_id = t.service_id
 Where (:service_id = t1.bill_services_id or :service_id is null)
 and t.end_date is null
 and (
        (:deleted = true and t1.deleted = true) or
        (:deleted = false and (t1.deleted = false or t1.deleted is null or :service_id is not null))
    ) 