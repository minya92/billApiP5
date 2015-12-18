/**
 * @author minya92
 * @name qCloseCostService
 * @manual
 */ 

UPDATE bill_cost
SET end_date = now() 
WHERE
:service_id = service_id and end_date is null
