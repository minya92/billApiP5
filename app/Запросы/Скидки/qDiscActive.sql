/**
 * 
 * @author lapsh
 * @name qDiscActive
 * @public
 * @writable disc_active
 */ 
Select t1.*, t.disc_rules_id, t.rule_amount, t.discount_natural, t.discount_percent  
From disc_active t1
 Inner Join disc_rules t on t1.active_rule = t.disc_rules_id
 Where (:account_id = t1.account_id or :account_id is null)
 and (:discount_id = t1.discount_id or :discount_id is null)
 and end_date is null