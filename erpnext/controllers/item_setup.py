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

@frappe.whitelist()
def update_items(flag1,flag2,item,company, warehouse, price_list, tax_template, name_default, name_tax, supplier):
    if flag1:
        # item_doc.item_defaults.remove(row)
        query = """
            UPDATE
                `tabItem Default`
            SET
                default_warehouse= %(default_warehouse)s, default_price_list= %(default_price_list)s, default_supplier = %(supplier)s
            WHERE
                name = %(name_default)s and company = %(company)s
        """
        frappe.db.sql(query.format(), {'default_warehouse': warehouse, 'default_price_list': price_list, 'name_default':name_default, 'company':company, 'supplier':supplier })
        frappe.db.commit()
        # frappe.msgprint( msg= "Case 1", title='Success')
    else:
        # frappe.msgprint( msg= "Case 2 start", title='Success')
        # query = """
        #     INSERT INTO
        #         `tabItem Default` (default_warehouse, default_price_list, parent, company)
        #     VALUES
        #         ( %(default_warehouse)s, %(default_price_list)s, %(parent)s, %(company)s)
        # """
        # frappe.db.sql(query.format(), {'default_warehouse': warehouse, 'default_price_list': price_list, 'parent':item.name, 'company':company })
        # frappe.db.commit()
        row = item.append('item_defaults', {})
        row.default_warehouse = warehouse
        row.default_price_list = price_list
        row.parent = item.item_code
        row.company = company
        row.default_supplier = supplier
        item.save()
        # frappe.msgprint( msg= "Case 2", title='Success')

    if flag2:
        # item_doc.item_defaults.remove(row)
        # frappe.msgprint( msg= "Case 3 start", title='Success')
        query = """
            UPDATE
                `tabItem Tax`
            SET
                item_tax_template= %(item_tax_template)s
            WHERE
                name = %(name_tax)s
        """
        frappe.db.sql(query.format(), {'item_tax_template': tax_template, 'name_tax':name_tax })
        frappe.db.commit()
        # frappe.msgprint( msg= "Case 3", title='Success')
    else:
        # frappe.msgprint( msg= "Case 4 start", title='Success')
        # query = """
        #     INSERT INTO
        #         `tabItem Tax` (item_tax_template, parent)
        #     VALUES
        #         ( %(item_tax_template)s, %(parent)s )
        # """
        # frappe.db.sql(query.format(), {'item_tax_template': tax_template, 'parent':item.name })
        # frappe.db.commit()
        row = item.append('taxes', {})
        row.item_tax_template = tax_template
        item.save()
        # frappe.msgprint( msg= "Case 4", title='Success')

@frappe.whitelist()
def set_item_defaults(company, warehouse, price_list, tax_template, supplier):
    for item in frappe.get_all("Item", filters={'disabled':0 }):
        if item:
            item_doc = frappe.get_doc("Item", item.name )
            item_tax_template = item_doc.default_tax_template
            if item_tax_template:
                for template in frappe.get_list("Item Tax Template", filters={'title': item_tax_template , 'company':company }):
                    if template:
                        tax_template = template.name
                    else:
                        frappe.msgprint( msg= "Item Tax Template not found", title='WARNING')
            flag1 = 0
            flag2 = 0
            name_default = 0
            name_tax = 0
            for item_default in item_doc.item_defaults:
                if item_default.company == company :
                    flag1 = 1
                    name_default = item_default.name
            for taxes in item_doc.taxes:
                if taxes.item_tax_template == tax_template :
                    flag2 = 1
                    name_tax = taxes.name
            frappe.enqueue(update_items, item=item_doc, flag1=flag1, flag2=flag2 ,company=company ,warehouse=warehouse ,price_list=price_list ,tax_template=tax_template , name_default=name_default, name_tax=name_tax, supplier=supplier, queue='short')
            # update_items(flag1,flag2,item_doc,company, warehouse, price_list, tax_template, name_default, name_tax)
    frappe.msgprint( msg= "Item defaults updated", title='Success')

@frappe.whitelist()
def set_defaults_in_item(item_code):
    for company in frappe.get_all("Company"):
        if company:
            company_doc = frappe.get_doc("Company", company.name )
            item_doc = frappe.get_doc("Item", item_code )
            warehouse = company_doc.default_warehouse
            price_list = company_doc.default_price_list
            tax_template = company_doc.default_tax_template
            supplier = company_doc.default_supplier
            item_tax_template = item_doc.default_tax_template
            print(item_doc)
            print(item_tax_template)
            if item_tax_template:
                for template in frappe.get_list("Item Tax Template", filters={'title': item_tax_template , 'company': company.name }):
                    if template:
                        tax_template = template.name
                    else:
                        frappe.msgprint( msg= "Item Tax Template not found", title='WARNING')
            flag1 = 0
            flag2 = 0
            name_default = 0
            name_tax = 0
            for item_default in item_doc.item_defaults:
                if item_default.company == company.name :
                    flag1 = 1
                    name_default = item_default.name
            for taxes in item_doc.taxes:
                if taxes.item_tax_template == tax_template :
                    flag2 = 1
                    name_tax = taxes.name
            print("Test")
            update_items(flag1,flag2,item_doc,company.name, warehouse, price_list, tax_template, name_default, name_tax, supplier)
