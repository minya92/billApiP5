/**
 *
 * @author lapsh
 * @name qGetStartPeriodFromService
 * @public 
 */ 
Select t.*
From bill_services_accounts t1
 Inner Join bill_operations t on t1.bill_services_accounts_id = t.bill_services_accounts
 Where :account_id = t1.account_id and t.operation_status = 4
 and t.operation_date = (Select max(t.operation_date)
        From bill_services_accounts t1
         Inner Join bill_operations t on t1.bill_services_accounts_id = t.bill_services_accounts
         Where :account_id = t1.account_id and t.operation_status = 4
         and to_char(t.operation_date, 'YYYY-MM-DD') > to_char(now(), 'YYYY-MM-DD')
)