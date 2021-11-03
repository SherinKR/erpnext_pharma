from __future__ import unicode_literals
import frappe

def execute():
    frappe.enqueue(update_franchise_payments, queue='long')

def update_franchise_payments():
    fpr_list = frappe.get_all("Franchise Payment Request")
    for fpr in fpr_list:
        fpr_doc = frappe.get_doc("Franchise Payment Request", fpr.name)
        fpr_doc.save()
        frappe.db.commit()
    print("Franchise Payment Requests Updated")