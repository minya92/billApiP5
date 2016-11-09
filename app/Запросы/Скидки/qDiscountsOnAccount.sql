/**
 *
 * @author lapsh
 * @name qDiscountsOnAccount
 * @public 
 */ 
Select t1.discount_id, t3.discount_type
From disc_tktypes t1
 Inner Join tk_card t on t1.tk_type = t.card_type
 Inner Join disc_services t2 on t1.discount_id = t2.discount_id
 Inner Join disc_discounts t3 on t2.discount_id = t3.disc_discounts_id
 Where :account_id = t.account_id
 Group by t1.discount_id, t3.discount_type