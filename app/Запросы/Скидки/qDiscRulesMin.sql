/**
 *
 * @author lapsh
 * @name qDiscRulesMin
 * @public 
 */ 
Select * 
From disc_rules t
 Where :discount_id = t.discount_id
 and t.rule_amount = (        
        Select min(t1.rule_amount) as rule_amount
        From disc_rules t1
         Where :discount_id = t1.discount_id)