/**
 *
 * @author Алексей
 * @name qMetrikaStat
 * @public 
 */ 
Select * 
From mtk_shots t1
 Where (:p_label = t1.mtk_label or :p_label is null)
 and (:p_start < t1.shot_time or :p_start is null)
 and (:p_end >= t1.shot_time or :p_end is null)