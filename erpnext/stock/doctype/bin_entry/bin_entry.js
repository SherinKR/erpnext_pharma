// Copyright (c) 2021, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Bin Entry', {
	refresh: function(frm) {
    var me = this;
		frm.set_query('bin', 'items', function(doc, cdt, cdn) {
			var d = locals[cdt][cdn];
			if(d.item_code){
				console.log("test1")
				return {
					"filters": {
						"item_code": d.item_code,
						"company": frappe.defaults.get_user_default("Company")
					}
				};
			}
		});
		frm.set_query('batch', 'items', function(doc, cdt, cdn) {
			var d = locals[cdt][cdn];
			if(d.item_code){
				console.log("test1")
				return {
					"filters": {
						"item": d.item_code
					}
				};
			}
		});
	}
});

