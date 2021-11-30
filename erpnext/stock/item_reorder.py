from __future__ import unicode_literals
import frappe
import erpnext
import json
import math
from frappe.utils import flt, nowdate, add_days, cint
from frappe import _

def auto_item_reorder():
    today = frappe.utils.today()
    from_date = frappe.utils.add_days(today,-15)
    item_list = []
    proccessed_po_list = []
    si_qty_list = {}
    supply_qty_list = {}
    available_qty_list = {}
    reorder_qty_list = {}
    warehouse = "Stores - AVZ"

    if frappe.defaults.get_user_default("Company"):
        company_name = frappe.defaults.get_user_default("Company")
    else:
        # company_name = frappe.db.get_value('User Permission', {'user':frappe.session.user,'allow': 'Company'}, ['for_value'])
        company_name = frappe.sys_defaults.company
    if(today[8:]=='15' or today[8:]=='30'):
        for so in frappe.get_list("Sales Order", filters={"transaction_date": ["between",  (from_date, today)], "company":company_name, "is_internal_customer":1, "workflow_state": "Demand Request Approved"}):
            if so:
                so_doc = frappe.get_doc("Sales Order", so.name)
                proccessed_po_list.append(so_doc.po_no)

        for po in frappe.get_list("Purchase Order", filters={"transaction_date": ["between",  (from_date, today)], "represents_company":company_name}):
            if po.name not in proccessed_po_list:
                po_doc = frappe.get_doc("Purchase Order", po.name)
                for item in po_doc.items:
                    if item.item_code in supply_qty_list.keys():
                        qty = supply_qty_list[item.item_code]+item.stock_qty
                    else:
                        qty = item.stock_qty
                    supply_qty_list.update({ item.item_code : qty })
                    if(item.item_code not in  item_list):
                        item_list.append(item.item_code)

        for si in frappe.get_list("Sales Invoice", filters={"posting_date": ["between",  (from_date, today)], "company":company_name}):
            si_doc = frappe.get_doc("Sales Invoice", si.name)
            if si_doc.set_warehouse:
                warehouse = si_doc.set_warehouse
            # print(warehouse)
            for item in si_doc.items:
                if item.item_code in si_qty_list.keys():
                    qty = si_qty_list[item.item_code]+item.stock_qty
                else:
                    qty = item.stock_qty
                si_qty_list.update({ item.item_code : qty })
                if(item.item_code not in  item_list):
                    item_list.append(item.item_code)

        for item in item_list:
            print(item)
            if item in supply_qty_list.keys():
                supply_qty = supply_qty_list[item]
            else:
                supply_qty = 0
            if item in si_qty_list.keys():
                si_qty = si_qty_list[item]
            else:
                si_qty = 0

            if frappe.db.exists({ 'doctype': 'Bin', "warehouse": warehouse, "item_code": item }):
                proj_qty,stock_uom = frappe.db.get_value('Bin', {"warehouse": warehouse, "item_code": item}, ['projected_qty', 'stock_uom'])
                if stock_uom:
                    available_qty_list.update({ item : proj_qty - supply_qty })
                    new_qty = math.ceil((si_qty*1.5) - available_qty_list[item])
                    reorder_qty_list.update({ item : new_qty })
                    print(item+" si qty = "+ str(si_qty))
                    print(item+" supply qty = "+ str(supply_qty))
                    print(item+" available qty = "+ str(available_qty_list[item]))
                    print(item+" order qty = "+ str(reorder_qty_list[item]))
            print(reorder_qty_list)
        createMaterialRequest(item_list,reorder_qty_list,warehouse,company_name)

def createMaterialRequest(item_list,reorder_qty_list,warehouse,company_name):
    has_items = 0
    mr = frappe.new_doc("Material Request")
    mr.update({
        "company": company_name,
        "transaction_date": frappe.utils.getdate(),
        "material_request_type": "Purchase",
        "set_warehouse" : warehouse,
        "schedule_date" : frappe.utils.getdate(),
        "naming_series": "MAT-MR-.YYYY.-"
    })
    for d in item_list:
        if d in reorder_qty_list.keys():
            has_items = 1
            # print("in loop")
            item = frappe.get_doc("Item", d)
            uom = item.stock_uom
            conversion_factor = 1.0
            # uom = item.purchase_uom or item.stock_uom
            # if uom != item.stock_uom:
            #     conversion_factor = frappe.db.get_value("UOM Conversion Detail",
            #         {'parent': d, 'uom': uom}, 'conversion_factor') or 1.0
            if round((reorder_qty_list[d] / conversion_factor),0)>0:
                mr.append("items", {
                    "doctype": "Material Request Item",
                    "item_code": d,
                    "schedule_date": frappe.utils.getdate(),
                    "qty": round((reorder_qty_list[d] / conversion_factor),0),
                    "uom": uom,
                    "stock_uom": item.stock_uom,
                    "warehouse": warehouse,
                    "item_name": item.item_name,
                    "description": item.description,
                    "item_group": item.item_group,
                    "brand": item.brand,
                })
    if has_items:
        print("before_save")
        mr.flags.ignore_mandatory = True
        mr.save(ignore_permissions=True)
        mr.reload()
        mr.submit()
        print("after_save")
        print(mr)
    else:
        frappe.db.rollback()
        print("rollback")
