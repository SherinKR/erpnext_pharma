// Copyright (c) 2021, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Bin Entry', {
	refresh: function(frm) {
		set_filters(frm);
	},
	onload: function(frm) {
		set_filters(frm);
	}
});

function set_filters(frm){
	frm.set_query('bin', 'items', function(doc, cdt, cdn) {
		var d = locals[cdt][cdn];
		if(d.item_code){
			return {
				"filters": {
					"item_code": d.item_code,
					"company": frm.doc.company
				}
			};
		}
		else{
			return {
				"filters": {
					"company": frm.doc.company
				}
			};
		}
	});
	frm.set_query('batch', 'items', function(doc, cdt, cdn) {
		var d = locals[cdt][cdn];
		if(d.item_code){
			return {
				"filters": {
					"item": d.item_code
				}
			};
		}
	});
}

