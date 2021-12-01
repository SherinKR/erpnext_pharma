from __future__ import unicode_literals
import frappe

def execute():
    frappe.enqueue(update_franchise_payment_request, queue='long')

def update_franchise_payment_request():
    if frappe.db.get_value("Webeaz Settings", None, "ptf_price_list"):
        ptf_price_list =  frappe.db.get_value("Webeaz Settings", None, "ptf_price_list")
    else:
        ptf_price_list = ""
		frappe.throw( title='Pricelist Missing!', msg='Set Price To Franchise Price List in Webeaz Settings' )
        
    franchise_payment_request_list = frappe.get_all("Franchise Payment Request")
    for franchise_payment_request in franchise_payment_request_list:
        franchise_payment_request_doc = frappe.get_doc("Franchise Payment Request", franchise_payment_request.name)
        for fpr_item in franchise_payment_request_doc.items:
            sales_invoice_doc = frappe.get_doc("Sales Invoice", fpr_item.sales_invoice)
            purchase_rate = 0
            amount = 0
            tax_percentage = 0
            if sales_invoice_doc.docstatus==1:
                for item in sales_invoice_doc.items:
                    if item.item_code[:2]=="IP":
                        tax_percentage = float(item.tax_percentage)
                        item_price = frappe.db.get_value('Item Price', {'item_code': item.item_code, 'batch_no':item.batch_no , 'price_list': ptf_price_list }, ['price_list_rate'])
                        if item_price:
                            amount = float(item_price)*item.stock_qty
                            amount = float(amount) + (float(amount/100))*tax_percentage
                            purchase_rate = purchase_rate + amount
                        else:
                            item_price = 0
                            print(fpr_item.sales_invoice+" has Item without purchase rate "+item.item_code)
            if purchase_rate:
                fpr_item.purchase_amount = purchase_rate
        franchise_payment_request_doc.save()
