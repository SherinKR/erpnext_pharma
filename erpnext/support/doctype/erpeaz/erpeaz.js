// Copyright (c) 2021, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('ERPEaz', {
    onload(frm){
        frm.set_value("date", frappe.datetime.now_datetime());
        frm.set_value("raised_from",frappe.session.user);
    }
});
