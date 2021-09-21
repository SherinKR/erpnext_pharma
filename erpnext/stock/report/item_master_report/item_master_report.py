# Copyright (c) 2013, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from frappe.model.document import Document
from erpnext.stock.doctype.batch.batch import get_batch_qty
import frappe
from frappe import _

def execute(filters=None):
	columns, data = get_columns(), get_data(filters)
	return columns, data

def get_columns():
	print("get_columns")
	return[
		_("Item") + ":Link/Item:100",
		_("Item Name") + ":Data:200",
		_("Manufacturer") + ":Link/Manufacturer:150",
		_("Batch") + ":Link/Batch:150",
		_("Expiry") + ":Date:100",
		_("Content") + ":Data:200",
		_("Current Stock") + ":Float:130",
		_("Purchase Qty") + ":Float:120",
		_("Free Qty") + ":Float:100",
		_("Purchase Return") + ":Float:120",
		_("Sales Qty") + ":Float:100",
		_("Sales Return") + ":Float:180",
		_("Miscellaneous Issue") + ":Float:200",
		_("Miscellaneous Receipt") + ":Float:200",
		_("Company Buying") + ":Currency:150",
		_("PTF") + ":Currency:100",
		_("PTC") + ":Currency:100",
		_("MRP") + ":Currency:100",
		_("GST") + ":Float:100",
		_("UOM") + ":Link/UOM:100",
		_("Qty Per Pack") + ":Float:150",
		_("Rack") + ":Link/Bins:130",
		_("Is Purchase") + ":Check:100",
		_("Is Sales") + ":Check:100",
		_("Superseeded By") + ":Link/Item:160"
	]

def get_data(filters=None):
	company = filters['company']
	warehouse_list = frappe.get_list("Warehouse", filters={'company':company})
	data=[]
	if 'item' in filters:
		print(filters['item'])
		batch_list=frappe.get_list("Batch", filters={'item':filters['item']})
	else:
		batch_list=frappe.get_list("Batch")
	
	item_code = ""
	manufacturer = ""
	item_name = ""
	batch = ""
	expiry = ""
	content = ""
	current_stock = 0
	purchase_qty, free_qty, purchase_return = 0,0,0
	sale_qty, sale_return = 0,0
	material_receipt,material_issue = 0,0
	company_buying, ptf, ptc, mrp, gst = 0,0,0,0,0
	uom = ""
	qty_per_pack = 1
	rack = ""
	is_purchase, is_sales = 0,0
	superseeded_by = ""
	for b in batch_list:
		batch, item_code, item_name, expiry, current_stock = frappe.db.get_value('Batch', b.name, ['name', 'item', 'item_name', 'expiry_date', 'batch_qty'])
		uom, content, is_purchase, is_sales, superseeded_by, gst, manufacturer  = frappe.db.get_value('Item', item_code, ['stock_uom','drug_content', 'is_purchase_item', 'is_sales_item', 'superseded_item', 'default_tax_rate', 'manufacturer'])
		ptf = frappe.db.get_value('Item Price', {'price_list': 'Price To Franchaisee - (PTF)', 'item_code':item_code, 'batch_no':batch }, 'price_list_rate')
		ptc = frappe.db.get_value('Item Price', {'price_list': 'Price To Customer - (PTC)', 'item_code':item_code, 'batch_no':batch }, 'price_list_rate')
		company_buying = frappe.db.get_value('Item Price', {'price_list': 'Company Buying', 'item_code':item_code, 'batch_no':batch }, 'price_list_rate')
		
		batch_wise_list = get_batch_qty(batch)
		warehouse_stock=0
		for warehouse_item in warehouse_list:
			for batch_item in batch_wise_list:
				if(batch_item['warehouse'] == warehouse_item['name']):
					warehouse_stock = warehouse_stock+int(batch_item['qty'])
		current_stock = warehouse_stock
		warehouse_stock=0
		si_details = get_sales_qty(batch,company)
		if frappe.db.exists({ 'doctype': 'Bins', 'item_code': item_code, 'company':company}):
			rack = frappe.db.get_value('Bins', {'item_code': item_code, 'company':company}, ['name'])

		# print(si_details)
		if si_details:
			for si_detail in si_details:
				if si_detail.stock_qty>0:
					sale_qty+= si_detail.stock_qty
				else:
					sale_return+= si_detail.stock_qty
				if si_detail.mrp and si_detail.conversion_factor:
					mrp = float(si_detail.mrp)/float(si_detail.conversion_factor)
					qty_per_pack = 1

		pr_details = get_purchase_qty(batch,company)
		# print(pr_details)
		if pr_details:
			for pr_detail in pr_details:
				if pr_detail.free:
					free_qty+= pr_detail.stock_qty
				else:
					purchase_qty+= pr_detail.stock_qty

		purchase_return_details = get_purchase_return_qty(batch,company)
		if purchase_return_details:
			for purchase_return_detail in purchase_return_details:
				if purchase_return_detail.stock_qty<0:
					purchase_return += purchase_return_detail.stock_qty

		material_receipt_details = get_stock_entry_qty(batch, "Material Receipt", company)
		if material_receipt_details:
			for material_receipt_detail in material_receipt_details:
				if material_receipt_detail.transfer_qty:
					material_receipt += material_receipt_detail.transfer_qty
		material_issue_details = get_stock_entry_qty(batch, "Material Issue", company)
		if material_issue_details:
			for material_issue_detail in material_issue_details:
				if material_issue_detail.transfer_qty:
					material_issue += material_issue_detail.transfer_qty
		row = [
			item_code,
			item_name,
			manufacturer,
			batch,
			expiry,
			content,
			current_stock,
			purchase_qty,
			free_qty,
			purchase_return,
			sale_qty,
			sale_return,
			material_issue,
			material_receipt,
			company_buying,
			ptf,
			ptc,
			mrp,
			gst,
			uom,
			qty_per_pack,
			rack,
			is_purchase,
			is_sales,
			superseeded_by
		]
		data.append(row)
		item_code = ""
		manufacturer = ""
		item_name = ""
		batch = ""
		expiry = ""
		content = ""
		current_stock = 0
		purchase_qty, free_qty, purchase_return = 0,0,0
		sale_qty, sale_return = 0,0
		material_receipt,material_issue = 0,0
		company_buying, ptf, ptc, mrp, gst = 0,0,0,0,0
		uom = ""
		qty_per_pack = 1
		rack = ""
		is_purchase, is_sales = 0,0
		superseeded_by = ""

	return data

@frappe.whitelist()
def get_sales_qty(batch_no, company):
	query = """
		select
			sii.item_code, sii.stock_qty, sii.mrp, sii.batch_no, sii.parent, sii.conversion_factor
		from
			`tabSales Invoice Item` sii
		where
			sii.batch_no=%(batch_no)s and sii.parent IN
			(SELECT si.name FROM `tabSales Invoice` as si where si.company = %(company)s)
	"""
	return frappe.db.sql(query.format(), {'batch_no': batch_no , 'company':company}, as_dict=True)

@frappe.whitelist()
def get_purchase_qty(batch_no, company):
	query = """
		select
			pri.item_code, pri.stock_qty, pri.free, pri.batch_no, pri.parent
		from
			`tabPurchase Receipt Item` pri
		where
			pri.batch_no=%(batch_no)s and pri.parent IN
			(SELECT pr.name FROM `tabPurchase Receipt` as pr where pr.company = %(company)s)
	"""
	return frappe.db.sql(query.format(), {'batch_no': batch_no, 'company':company}, as_dict=True)

@frappe.whitelist()
def get_purchase_return_qty(batch_no, company):
	query = """
		select
			pii.item_code, pii.stock_qty, pii.batch_no, pii.parent
		from
			`tabPurchase Invoice Item` pii
		where
			pii.batch_no=%(batch_no)s and pii.parent IN
			(SELECT pi.name FROM `tabPurchase Invoice` as pi where pi.company = %(company)s)
	"""
	return frappe.db.sql(query.format(), {'batch_no': batch_no, 'company':company }, as_dict=True)

@frappe.whitelist()
def get_bin_details(item_code,batch,company):
	query = """
		select
			bi.item_code, bi.batch_qty, bi.batch
		from
			`tabBin Items` bi
		where
			bi.batch=%(batch)s and bi.item_code=%(item_code)s and bi.company=%(company)s
	"""
	return frappe.db.sql(query.format(), {'batch': batch, 'item_code': item_code, 'company':company }, as_dict=True)

@frappe.whitelist()
def get_stock_entry_qty(batch_no, purpose, company):
	query = """
		select
			sed.item_code, sed.transfer_qty, sed.batch_no, sed.parent
		from
			`tabStock Entry Detail` sed
		where
			sed.batch_no=%(batch_no)s and sed.parent IN
			(SELECT se.name FROM `tabStock Entry` as se where ( se.company = %(company)s and se.purpose = %(purpose)s))
	"""
	return frappe.db.sql(query.format(), {'batch_no': batch_no, 'company':company, 'purpose':purpose }, as_dict=True)