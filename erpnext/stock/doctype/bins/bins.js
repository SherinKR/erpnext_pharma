// Copyright (c) 2021, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt
frappe.ui.form.on('Bins', {
	refresh: function(frm) {
		if(frm.doc.company){
			frm.set_query('rack_name', () => {
    		return {
	        filters: {
	            company: frm.doc.company
	        }
    		}
			});
		}
	}
});

