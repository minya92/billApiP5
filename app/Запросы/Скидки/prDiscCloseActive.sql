/**
 * 
 * @author lapsh
 * @name prDiscCloseActive
 * @public
 */ 
Update 
disc_active
 set end_date = now()
 Where :account_id = account_id
 and :discount_id = discount_id
 and end_date is null