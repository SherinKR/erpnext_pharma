from __future__ import unicode_literals
import frappe

def execute():
    frappe.enqueue(update_franchise_payment_request, queue='long')

def update_franchise_payment_request():
    franchise_payment_request_list = frappe.get_all("Franchise Payment Request")
    for franchise_payment_request in franchise_payment_request_list:
        franchise_payment_request_doc = frappe.get_doc("Franchise Payment Request", franchise_payment_request.name)
        for fpr_item in franchise_payment_request_doc.items:
            if int(fpr_item.purchase_amount) <= 0:
                print("Deleting "+ franchise_payment_request_doc.name )
                fpr_item.delete()
        franchise_payment_request_doc.save()
