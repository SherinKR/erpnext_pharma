# -*- coding: utf-8 -*-
# Copyright (c) 2021, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class BinEntry(Document):
	def validate(self):
		# frappe.throw( msg= str(new_qty)+'test True'+str(d.quantity), title='test')
		pass
	def on_submit(self):
		for d in self.items:
			bin_doc = frappe.get_doc('Bins',d.bin)
			bin_item = bin_doc.append('items')
			if frappe.db.exists({ 'doctype': 'Bin Items','parent': d.bin, 'batch': d.batch, 'item_code': d.item_code }):
				tab_name, new_qty = frappe.db.get_value('Bin Items', {'parent': d.bin, 'batch': d.batch, 'item_code':d.item_code}, ['name','batch_qty'])
				new_qty = new_qty + d.quantity
				frappe.db.set_value('Bin Items', tab_name, { 'batch_qty': new_qty })
				frappe.db.commit()
			else:
				bin_item.bin = d.bin
				bin_item.rack = d.rack
				bin_item.shelf = d.shelf
				bin_item.room = d.room
				bin_item.item_code = d.item_code
				bin_item.item_name = d.item_name
				bin_item.batch = d.batch
				bin_item.batch_qty = d.quantity
				bin_item.company = bin_doc.company
				bin_doc.save()
			frappe.db.set_value('Bins', d.bin, { 'bin_qty': bin_doc.bin_qty+d.quantity })
			frappe.db.commit()
		if self.reference_document and self.reference_document_type:
			update_status(self.reference_document,self.reference_document_type)
def update_status(reference_document,reference_document_type):
	if reference_document_type=="Stock Entry":
		if frappe.db.exists('Stock Entry',reference_document):
			frappe.db.set_value('Stock Entry', reference_document, 'bin_entry_done', 1)
			frappe.db.commit()
	if reference_document_type=="Purchase Receipt":
		if frappe.db.exists('Purchase Receipt',reference_document):
			frappe.db.set_value('Purchase Receipt', reference_document, 'bin_entry_done', 1)
			frappe.db.commit()