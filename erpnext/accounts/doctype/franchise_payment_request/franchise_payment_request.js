// Copyright (c) 2021, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Franchise Payment Request', {
	refresh: function(frm) {
    frm.add_custom_button(__('Payment Entry'), cur_frm.cscript['Payment Entry'], __('Create'));
	}
});

cur_frm.cscript['Payment Entry'] = function() {
	frappe.model.open_mapped_doc({
		method: "erpnext.accounts.doctype.franchise_payment_request.franchise_payment_request.make_payment_entry",
		frm: cur_frm,
	})
};
