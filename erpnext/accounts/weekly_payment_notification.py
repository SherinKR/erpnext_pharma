def get_total_payment_status(child_company_list, date_count):
    for company in child_company_list:
        total_paid_amount=0
        total_purchase_amount=0
        today = frappe.utils.today()
        from_date = frappe.utils.add_days(today,-30)
        frappe.msgprint(title='Test', msg=frappe.utils.get_weekday()+" "+company.name)
        for fpr in frappe.get_list("Franchise Payment Request", filters={"transaction_date": ["between",  (from_date, today)], "status":'Unpaid', "company": company.name }):
            if fpr:
                fpr_doc = frappe.get_doc("Franchise Payment Request", fpr.name)
                if fpr_doc.paid_amount :
                    total_paid_amount=fpr_doc.paid_amount + total_paid_amount
                if fpr_doc.purchase_amount :
                    total_purchase_amount=fpr_doc.purchase_amount + total_purchase_amount
        balance = total_purchase_amount-total_paid_amount
        if(balance):
            pndoc = frappe.get_doc({
                'doctype': 'Payment Notification',
                'title': 'New Notification'
            })
            pndoc.company_name = company.name
            pndoc.date = today
            pndoc.due_date = frappe.utils.add_days(today, date_count)
            pndoc.day = frappe.utils.get_weekday()
            pndoc.amount = balance
            weekdays =	{ 0 : 'Sunday', 1: 'Monday', 2:'Tuesday', 3 : 'Wednesday', 4 : 'Thursday', 5: 'Friday', 6: 'Saturday' }
            if weekdays[1]==frappe.utils.get_weekday():
                message = "Please clear the payment dues amount INR "+ str(balance) +" to central office before wedenesday ( "+frappe.utils.add_days(today, date_count)+" )"
            if weekdays[2]==frappe.utils.get_weekday():
                message = "Please clear the payment dues amount INR "+ str(balance) +" to central office before wedenesday ( "+frappe.utils.add_days(today, date_count)+" )"
            if weekdays[3]==frappe.utils.get_weekday():
                message = "Please clear the payment INR "+ str(balance) +" by today. If not software access will be blocked from tomorow ( "+frappe.utils.add_days(today, date_count)+" )"
            if weekdays[4]==frappe.utils.get_weekday():
                message = "Access blocked by admin"
                frappe.db.set_value('Company', company.name, 'block_user_access', 1)
            pndoc.message = message
            pndoc.insert()

child_company_list = frappe.db.get_list("Company",{'is_group':0})
weekdays =	{ 0 : 'Sunday', 1: 'Monday', 2:'Tuesday', 3 : 'Wednesday', 4 : 'Thursday', 5: 'Friday', 6: 'Saturday' }
if weekdays[1]==frappe.utils.get_weekday():
    date_count = 2
    get_total_payment_status(child_company_list, date_count)

if weekdays[2]==frappe.utils.get_weekday():
    date_count = 1
    get_total_payment_status(child_company_list, date_count)

if weekdays[3]==frappe.utils.get_weekday():
    date_count = 1
    get_total_payment_status(child_company_list, date_count)

if weekdays[4]==frappe.utils.get_weekday():
    date_count = 0
    get_total_payment_status(child_company_list, date_count)
