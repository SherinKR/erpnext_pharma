from __future__ import unicode_literals
import frappe

def execute():
    frappe.enqueue(update_franchise_payment_request, queue='long')
        
def update_franchise_payment_request():
    franchise_payment_request_list = frappe.get_all("Franchise Payment Request")
    for franchise_payment_request in franchise_payment_request_list:
        franchise_payment_request_doc = frappe.get_doc("Franchise Payment Request", franchise_payment_request.name)
        for fpr_item in franchise_payment_request_doc.items:
            sales_invoice_doc = frappe.get_doc("Sales Invoice", fpr_item.sales_invoice)
            purchase_rate = 0
            if sales_invoice_doc.docstatus==1:
                for item in sales_invoice_doc.items:
                    if item.item_code[:2]=="IP":
                        item_price = frappe.db.get_value('Item Price', {'item_code': item.item_code, 'batch_no':item.batch_no , 'price_list':'Price To Franchaisee - (PTF)'}, ['price_list_rate'])
                        if item_price:
                            purchase_rate = purchase_rate + (float(item_price)*item.stock_qty)
                        else:
                            item_price = 0
                            print(fpr_item.sales_invoice+" has Item without purchase rate "+item.item_code)
            if purchase_rate:
                fpr_item.purchase_amount = purchase_rate
        franchise_payment_request_doc.save()

        # if purchase_invoice_doc.farmer_agreement_reference and not purchase_invoice_doc.farmer_name:
        #     farmer,farmer_name = frappe.db.get_value("Farmer Agreement", purchase_invoice_doc.farmer_agreement_reference, ['farmer', 'farmer_name'])
        #     frappe.db.set_value("Purchase Invoice", purchase_invoice.name, 'farmer', farmer)
        #     frappe.db.set_value("Purchase Invoice", purchase_invoice.name, 'farmer_name', farmer_name)
        #     frappe.db.commit()
        #     print("Purchase Invoice "+ purchase_invoice.name+ " updated with farmer and farmer name")