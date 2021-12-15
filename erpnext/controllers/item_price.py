import frappe

@frappe.whitelist()
def get_price_list_rate_based_on_rate_in_strip(rate_in_strip, item_code):
    item_doc = frappe.get_doc("Item", item_code)
    if(len(item_doc.uoms)>1 and rate_in_strip):
        lastElement = item_doc.uoms[len(item_doc.uoms)-1]
        conversion_factor = lastElement.conversion_factor
        if not conversion_factor:
            conversion_factor=1
            # print(item_doc.name+" Updated Succesfully with coversion_factor = 1")
        return { 'price_list_rate': float(rate_in_strip)/float(conversion_factor) }
    else:
        return {  'price_list_rate': float(rate_in_strip) }
    

@frappe.whitelist()
def item_price_on_validate(doc, method):
    # print("on validate")
    item_doc = frappe.get_doc("Item", doc.item_code)
    if(len(item_doc.uoms)>1 and doc.rate_in_strip):
        lastElement = item_doc.uoms[len(item_doc.uoms)-1]
        conversion_factor = lastElement.conversion_factor
        if not conversion_factor:
            conversion_factor=1
            # print(item_doc.name+" Updated Succesfully with coversion_factor = 1")
        doc.price_list_rate = float(doc.rate_in_strip)/float(conversion_factor)
    else:
        doc.price_list_rate = float(doc.rate_in_strip)
    frappe.db.commit()

@frappe.whitelist()
def get_item_conversion_factor(item_code, mrp_in_strip):
    item_doc = frappe.get_doc("Item", item_code)
    if(len(item_doc.uoms)>1 and mrp_in_strip):
        lastElement = item_doc.uoms[len(item_doc.uoms)-1]
        conversion_factor = lastElement.conversion_factor
        if not conversion_factor:
            conversion_factor=1
            # print(item_doc.name+" Updated Succesfully with coversion_factor = 1")
        return { 'mrp': float(mrp_in_strip)/float(conversion_factor) }
    else:
        return {  'mrp': float(mrp_in_strip) }