/**
 * @manual
 * @author Work
 * @name qListPlannedOperations
 */ 
Select * 
From bill_operations t1
 Where (to_char(t1.operation_date, 'YY:MM:DD') = to_char(now(), 'YY:MM:DD')
    or to_char(:pDate, 'YY:MM:DD') = to_char(t1.operation_date, 'YY:MM:DD')
)
 and operation_status = 4