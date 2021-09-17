# Copyright (c) 2013, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from frappe.model.document import Document
import frappe
from frappe import _

def execute(filters=None):
	columns, data = get_columns(), get_data(filters)
	return columns, data

def get_columns():
	print("get_columns")
	return[
		_("Item Name") + ":Data:200",
		_("Batch") + ":Link/Batch:150",
		_("Expiry") + ":Date:100",
		_("Content") + ":Data:200",
		_("Current Stock") + ":Float:100",
		_("Purchase Qty") + ":Float:100",
		_("Free Qty") + ":Float:100",
		_("Purchase Return") + ":Float:100",
		_("Sales Qty") + ":Float:100",
		_("Sales Return") + ":Float:100",
		_("Company Buying") + ":Currency:150",
		_("PTF") + ":Currency:100",
		_("PTC") + ":Currency:100",
		_("MRP") + ":Currency:100",
		_("GST") + ":Float:100",
		_("UOM") + ":Link/UOM:100",
		_("Is Purchase") + ":Check:100",
		_("Is Sales") + ":Check:100",
		_("Superseeded By") + ":Link/Item:100"
	]

def get_data(filters=None):
	data=[]
	if 'item' in filters:
		print(filters['item'])
		batch_list=frappe.get_list("Batch", filters={'item':filters['item']})
	else:
		batch_list=frappe.get_list("Batch")

	sales_invoice_list = frappe.get_list("Sales Invoice")
	purchase_order_list = frappe.get_list("Purchase Order")
	item_code = ""
	item_name = ""
	batch = ""
	expiry = ""
	content = ""
	current_stock = 0
	purchase_qty, free_qty, purchase_return = 0,0,0
	sale_qty, sale_return = 0,0
	company_buying, ptf, ptc, mrp, gst = 0,0,0,0,0
	uom = ""
	is_purchase, is_sales = 0,0
	superseeded_by = ""
	for b in batch_list:
		batch, item_code, item_name, expiry, current_stock = frappe.db.get_value('Batch', b.name, ['name', 'item', 'item_name', 'expiry_date', 'batch_qty'])
		uom, content, is_purchase, is_sales, superseeded_by, gst  = frappe.db.get_value('Item', item_code, ['stock_uom','drug_content', 'is_purchase_item', 'is_sales_item', 'superseded_item', 'default_tax_rate'])
		ptf = frappe.db.get_value('Item Price', {'price_list': 'Price To Franchaisee - (PTF)', 'item_code':item_code, 'batch_no':batch }, 'price_list_rate')
		ptc = frappe.db.get_value('Item Price', {'price_list': 'Price To Customer - (PTC)', 'item_code':item_code, 'batch_no':batch }, 'price_list_rate')
		company_buying = frappe.db.get_value('Item Price', {'price_list': 'Company Buying', 'item_code':item_code, 'batch_no':batch }, 'price_list_rate')
		si_details = get_sales_qty(batch)
		# print(si_details)
		if si_details:
			for si_detail in si_details:
				if si_detail.stock_qty>0:
					sale_qty+= si_detail.stock_qty
				else:
					sale_return+= si_detail.stock_qty
				mrp = si_detail.mrp

		pr_details = get_sales_qty(batch)
		# print(pr_details)
		if pr_details:
			for pr_detail in pr_details:
				if pr_detail.free:
					free_qty+= pr_detail.stock_qty
				else:
					purchase_qty+= pr_detail.stock_qty

		row = [
			item_name,
			batch,
			expiry,
			content,
			current_stock,
			purchase_qty,
			free_qty,
			purchase_return,
			sale_qty,
			sale_return,
			company_buying,
			ptf,
			ptc,
			mrp,
			gst,
			uom,
			is_purchase,
			is_sales,
			superseeded_by
		]
		data.append(row)

	return data

@frappe.whitelist()
def get_sales_qty(batch_no):
	query = """
		select
			si.item_code, si.stock_qty, si.mrp, si.batch_no, si.parent
		from
			`tabSales Invoice Item` si
		where
			si.batch_no=%(batch_no)s
	"""
	return frappe.db.sql(query.format(), {'batch_no': batch_no }, as_dict=True)

@frappe.whitelist()
def get_purchase_qty(batch_no):
	query = """
		select
			pri.item_code, pri.stock_qty, pri.free, pri.batch_no, pri.parent
		from
			`tabPurchase Receipt Item` pri
		where
			pri.batch_no=%(batch_no)s
	"""
	return frappe.db.sql(query.format(), {'batch_no': batch_no }, as_dict=True)
