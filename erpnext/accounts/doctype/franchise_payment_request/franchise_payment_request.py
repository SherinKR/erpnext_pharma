# Copyright (c) 2021, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc

class FranchisePaymentRequest(Document):
	pass

@frappe.whitelist()
def make_payment_entry(source_name, target_doc=None):
	def set_missing_values(source, target):
		target.naming_series = "ACC-PAY-.YYYY.-"
		target.payment_type = "Pay"
		target.party_type =  "Supplier"
		target.party = "Internal Supplier SG"
		target.party_name = "Internal Supplier SG"
		target.paid_amount = source.purchase_amount
		target.received_amount = source.purchase_amount 
		target.franchise_payment_request = source.name

	doclist = get_mapped_doc("Franchise Payment Request", source_name,{
		"Franchise Payment Request": {
			"doctype": "Payment Entry",
		},
	}, target_doc, set_missing_values)

	return doclist
