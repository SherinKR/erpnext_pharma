import frappe
import erpnext
from frappe import enqueue
from frappe import publish_progress
from frappe.utils import dateutils
from frappe.utils import getdate
from pymysql.converters import conversions

@frappe.whitelist()
def create_item_price_without_batch(price_list):
    if price_list=="Price To Franchaisee - (PTF)":
        item_price_list = frappe.get_list("Item Price", filters={'price_list': price_list})
        count = 0
        # frappe.msgprint('Item Price updation started')
        for item_price in item_price_list:
            frappe.publish_progress(count*100/len(item_price_list), title = ("Creating Item Prices..."))
            item_price_doc = frappe.get_doc("Item Price", item_price.name)
            if not frappe.db.exists({"doctype":"Item Price", 'item_code':item_price_doc.item_code ,'price_list': price_list, 'batch_no':""}):
                new_item_price_doc = frappe.new_doc('Item Price')
                new_item_price_doc.price_list = price_list
                new_item_price_doc.item_code = item_price_doc.item_code
                new_item_price_doc.price_list_rate = item_price_doc.price_list_rate
                new_item_price_doc.insert()
                frappe.db.commit()
            count = count+1
        frappe.msgprint("Item Price Updation Completed")
        count = 0

@frappe.whitelist()
def update_item_price_from_button(price_list):
    frappe.msgprint("Enqueeddd")
    # publish_progress(percent=10, title="Reading the file")
    # frappe.show_progress('Loading..', 70, 100, 'Please wait')
    # frappe.publish_realtime("ocr_progress_bar", {"progress": [5, 10], "reload": 1}, user=frappe.session.user)
    # frappe.enqueue(create_item_price_without_batch,price_list=price_list, is_async=True, queue="short")
    # create_item_price_without_batch(price_list)
    # for i in range(1,100):
    #     print(i)
    #     frappe.publish_progress(i, title="Updating Variants...")


@frappe.whitelist()
def update_franchise_payment_request_to_new(transaction_date,company):
    franchise_payment_request_list = frappe.get_list("Franchise Payment Request", filters={'transaction_date': getdate(transaction_date), 'company':company})
    if len(franchise_payment_request_list)>1:
        new_fpr = frappe.new_doc('Franchise Payment Request')
        new_fpr.company = company
        new_fpr.transaction_date = getdate(transaction_date)
        new_fpr.total_purchase_amount = 0
        new_fpr.total_sales_amount = 0
        for franchise_payment_request in franchise_payment_request_list:
            sum = 0
            print(franchise_payment_request.name)
            franchise_payment_request_doc = frappe.get_doc("Franchise Payment Request", franchise_payment_request.name)
            sales_invoice_doc = frappe.get_doc("Sales Invoice", franchise_payment_request_doc.reference_document)
            for item in sales_invoice_doc.items:
                item_price = frappe.db.get_value('Item Price', {'item_code': item.item_code, 'price_list':'Price To Franchaisee - (PTF)'}, ['price_list_rate'])
                sum = sum + (int(item_price)*item.stock_qty)
            new_fpr.weekday = franchise_payment_request_doc.weekday
            new_fpr.notification_date = franchise_payment_request_doc.notification_date
            fpr_item = new_fpr.append('items')
            fpr_item.sales_invoice = sales_invoice_doc.name
            fpr_item.posting_date = sales_invoice_doc.posting_date
            fpr_item.sales_amount = sales_invoice_doc.outstanding_amount
            fpr_item.purchase_amount = sum
            new_fpr.total_purchase_amount = sum + new_fpr.total_purchase_amount
            new_fpr.total_sales_amount = sales_invoice_doc.outstanding_amount + new_fpr.total_sales_amount
            new_fpr.save()
            franchise_payment_request_doc.delete()
            frappe.db.commit()

@frappe.whitelist()
def update_franchise_payment_request():
    franchise_payment_request_list = frappe.get_list("Franchise Payment Request")
    for franchise_payment_request in franchise_payment_request_list:
        print(franchise_payment_request.name)
        franchise_payment_request_doc = frappe.get_doc("Franchise Payment Request", franchise_payment_request.name)
        for item in franchise_payment_request_doc.items:
            sum = 0
            sales_invoice_doc = frappe.get_doc("Sales Invoice", item.sales_invoice)
            for si_item in sales_invoice_doc.items:
                item_price = frappe.db.get_value('Item Price', {'item_code': si_item.item_code, 'price_list':'Price To Franchaisee - (PTF)'}, ['price_list_rate'])
                sum = sum + (int(item_price)*si_item.stock_qty)
            item.purchase_amount = sum
        franchise_payment_request_doc.save()
        frappe.db.commit()

@frappe.whitelist()
def asign_item_to_bin_from_sales_invoice(sales_invoice):
    sales_invoice_doc = frappe.get_doc("Sales Invoice", sales_invoice)
    for item in sales_invoice_doc.bin_details:
        print(item.item_code)
        bin_doc = frappe.get_doc("Bins",item.bin)
        tab_name = frappe.db.get_value('Bin Items', {'parent': item.bin ,'batch': item.batch , 'item_code': item.item_code }, ['name'])
        batch_qty = 0
        if frappe.db.get_value('Bin Items', {'parent': item.bin ,'batch': item.batch , 'item_code': item.item_code }, ['batch_qty']):
            batch_qty = frappe.db.get_value('Bin Items', {'parent': item.bin ,'batch': item.batch , 'item_code': item.item_code }, ['batch_qty'])
        frappe.db.set_value('Bins', item.bin, { 'bin_qty': bin_doc.bin_qty + item.quantity })
        frappe.db.set_value('Bin Items', tab_name, { 'batch_qty': batch_qty + item.quantity })
        frappe.db.commit()

@frappe.whitelist()
def update_bin_items_with_company():
    bin_list = frappe.get_list("Bins")
    for bin in bin_list:
        bin_doc = frappe.get_doc("Bins", bin.name)
        for bin_item in bin_doc.items:
            bin_item.company = bin_doc.company
        bin_doc.save()
        frappe.db.commit()
    print("Updated Succesfully")

@frappe.whitelist()
def update_mrp_to_stock_uom():
    batch_list = frappe.get_list("Batch")
    for batch in batch_list:
        batch_doc = frappe.get_doc("Batch", batch.name)
        item_doc = frappe.get_doc("Item", batch_doc.item)
        if batch_doc.posa_btach_price:
            batch_price = batch_doc.posa_btach_price
        else:
            batch_price = 0
        if(len(item_doc.uoms)>1 and batch_price):
            lastElement = item_doc.uoms[len(item_doc.uoms)-1]
            conversion_factor = lastElement.conversion_factor
            if not conversion_factor:
                conversion_factor=1
                print(batch.name+" Updated Succesfully with coversion_factor = 1")
            frappe.db.set_value("Batch", batch.name, 'mrp', batch_price/conversion_factor)
        else:
            frappe.db.set_value("Batch", batch.name, 'mrp', batch_price)
        frappe.db.commit()
    print("All Updated Succesfully")