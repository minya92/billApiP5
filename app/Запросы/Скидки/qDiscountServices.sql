/**
 * 
 * @author lapsh
 * @name qServiceDiscount
 * @public
 */
Select * from disc_services t1
where :service_id = t1.service_id
or :discount_id = t1.discount_id