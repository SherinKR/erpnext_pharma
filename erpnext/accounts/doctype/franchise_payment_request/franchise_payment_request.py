# Copyright (c) 2021, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc

class FranchisePaymentRequest(Document):
	def validate(self):
		total_purchase_amount = 0
		total_sales_amount = 0
		for item in self.items:
			total_purchase_amount = total_purchase_amount + item.purchase_amount
			total_sales_amount = total_sales_amount + item.sales_amount
		self.total_purchase_amount = total_purchase_amount
		self.total_sales_amount = total_sales_amount
		self.total_outstanding_amount = int(self.total_purchase_amount)
		if self.total_paid_amount and self.total_purchase_amount:
			self.total_outstanding_amount = int(self.total_purchase_amount) - int(self.total_paid_amount)
			if int(self.total_paid_amount) >= int(self.total_purchase_amount):
				self.status = "Paid"
				self.total_outstanding_amount = 0
				# frappe.db.set_value('Franchise Payment Request', self, { 'status': 'Paid' })

@frappe.whitelist()
def make_payment_entry(source_name, target_doc=None):
	if frappe.db.get_value("Webeaz Settings", None, "internal_supplier_avanza"):
		internal_supplier =  frappe.db.get_value("Webeaz Settings", None, "internal_supplier_avanza")
	else:
		internal_supplier = ""
		frappe.throw( title='Internal Supplier Missing!', msg='Set Default Internal Supplier in Webeaz Settings' )

	def set_missing_values(source, target):
		if source.total_paid_amount:
			paid_amount = source.total_paid_amount
		else:
			paid_amount = 0
		target.naming_series = "ACC-PAY-.YYYY.-"
		target.payment_type = "Pay"
		target.party_type =  "Supplier"
		target.party = internal_supplier
		target.party_name = frappe.db.get_value("Supplier", internal_supplier, 'supplier_name')
		target.paid_amount = int(source.total_purchase_amount)-paid_amount
		target.received_amount = int(source.total_purchase_amount)-paid_amount
		target.franchise_payment_request = source.name

	doclist = get_mapped_doc("Franchise Payment Request", source_name,{
		"Franchise Payment Request": {
			"doctype": "Payment Entry",
		},
	}, target_doc, set_missing_values)

	return doclist
