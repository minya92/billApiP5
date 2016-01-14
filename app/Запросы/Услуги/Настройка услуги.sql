/**
 * 
 * @author Work
 * @name qServiceSetting
 */
Select * from bill_cost t
 Where :service_id = t.service_id
 and t.end_date is null