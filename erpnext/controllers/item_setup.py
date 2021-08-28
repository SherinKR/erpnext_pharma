# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe
import erpnext
import json
from frappe.desk.reportview import get_match_cond, get_filters_cond
from frappe.utils import nowdate, getdate
from collections import defaultdict
from erpnext.stock.get_item_details import _get_item_tax_template
from frappe.utils import unique
from frappe import enqueue

@frappe.whitelist()
def update_item_defaults(flag, item_doc, company, warehouse, price_list, name_default, supplier):
    if flag:
        # query = """
        #     UPDATE
        #         `tabItem Default`
        #     SET
        #         default_warehouse= %(default_warehouse)s, default_price_list= %(default_price_list)s, default_supplier = %(supplier)s
        #     WHERE
        #         name = %(name_default)s and company = %(company)s
        # """
        # frappe.db.sql(query.format(), {'default_warehouse': warehouse, 'default_price_list': price_list, 'name_default':name_default, 'company':company, 'supplier':supplier })
        # frappe.db.commit()
        # print("exist")
        pass

    else:
        row = item_doc.append('item_defaults', {})
        row.default_warehouse = warehouse
        row.default_price_list = price_list
        row.parent = item_doc.item_code
        row.company = company
        row.default_supplier = supplier
        item_doc.save()
        flag = 1
        # print("added")

@frappe.whitelist()
def set_item_defaults(company, warehouse, price_list, supplier):
    for item in frappe.get_all("Item", filters={'disabled':0 }):
        if item:
            item_doc = frappe.get_doc("Item", item.name )
            flag = 0
            name_default = 0
            for item_default in item_doc.item_defaults:
                if item_default.company == company :
                    flag = 1
                    name_default = item_default.name
            update_item_defaults(flag, item_doc, company, warehouse, price_list, name_default, supplier)

@frappe.whitelist()
def update_item_taxes(flag_tax, name_tax, item_doc, tax_template):
    if flag_tax:
        # query = """
        #     UPDATE
        #         `tabItem Tax`
        #     SET
        #         item_tax_template= %(item_tax_template)s
        #     WHERE
        #         name = %(name_tax)s
        # """
        # frappe.db.sql(query.format(), {'item_tax_template': tax_template, 'name_tax':name_tax })
        # frappe.db.commit()
        pass
    else:
        if tax_template:
            row = item_doc.append('taxes', {})
            row.item_tax_template = tax_template
            item_doc.save()

@frappe.whitelist()
def set_tax_defaults(company, tax_template):
    for item in frappe.get_all("Item", filters={'disabled':0 }):
        if item:
            item_doc = frappe.get_doc("Item", item.name )
            item_tax_rate = item_doc.default_tax_rate
            flag_tax = 0
            name_tax = 0
            if item_tax_rate:
                for template in frappe.get_list("Item Tax Template", filters={'tax_rate': item_tax_rate , 'company': company }):
                    if template:
                        tax_template = template.name
                        for taxes in item_doc.taxes:
                            if taxes.item_tax_template == tax_template :
                                flag_tax = 1
                                name_tax = taxes.name
                        frappe.enqueue(update_item_taxes, flag_tax=flag_tax, name_tax=name_tax, item_doc=item_doc, tax_template=tax_template , is_async=True, queue="long")
                        # update_item_taxes(flag_tax, name_tax, item_doc, tax_template)
                    else:
                        frappe.msgprint( msg= "Item Tax Template not found", title='WARNING')

@frappe.whitelist()
def set_tax_defaults_from_item(item_code):
    for company in frappe.get_all("Company"):
        if company:
            company_doc = frappe.get_doc("Company", company.name )
            item_doc = frappe.get_doc("Item", item_code )
            item_tax_rate = item_doc.default_tax_rate
            flag_tax = 0
            name_tax = 0
            if item_tax_rate:
                for template in frappe.get_list("Item Tax Template", filters={'tax_rate': item_tax_rate , 'company': company.name }):
                    if template:
                        tax_template = template.name
                        for taxes in item_doc.taxes:
                            if taxes.item_tax_template == tax_template :
                                flag_tax = 1
                                name_tax = taxes.name
                        update_item_taxes(flag_tax, name_tax, item_doc, tax_template)
                    else:
                        frappe.msgprint( msg= "Item Tax Template not found", title='WARNING')

@frappe.whitelist()
def set_item_defaults_from_item(item_code):
    for company in frappe.get_all("Company"):
        if company:
            company_doc = frappe.get_doc("Company", company.name )
            item_doc = frappe.get_doc("Item", item_code )
            warehouse = company_doc.default_warehouse
            price_list = company_doc.default_price_list
            supplier = company_doc.default_supplier
            item_tax_rate = item_doc.default_tax_rate
            name_default = 0
            flag = 0
            for item_default in item_doc.item_defaults:
                if item_default.company == company.name :
                    flag = 1
                    name_default = item_default.name
            update_item_defaults(flag, item_doc, company.name, warehouse, price_list, name_default, supplier)
