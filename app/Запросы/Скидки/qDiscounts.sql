/**
 * 
 * @author lapsh
 * @name qDiscounts
 * @public
 * @writable disc_discounts
 */ 
Select * 
From disc_discounts t1
 Where :disc_discounts_id = t1.disc_discounts_id or :disc_discounts_id is null