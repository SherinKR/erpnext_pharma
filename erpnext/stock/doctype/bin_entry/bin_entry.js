// Copyright (c) 2021, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Bin Entry', {
	refresh: function(frm) {
		set_filter(frm);
		console.log("refresh");
	},
	onload: function(frm) {
		set_filter(frm);
		console.log("onload");
	}
});

function set_filter(frm){
    frm.set_query('bin', 'items', function(doc, cdt, cdn) {
        var d = locals[cdt][cdn];
        console.log("in set query bin");
        var item_code = d.item_code
        var batch = d.batch
        var bin = ""
        if(item_code && batch){
            console.log("before call");
            frappe.call({
                "method": "erpnext.controllers.queries.get_bin_name",
                "args": {
                    "company" : frm.doc.company,
                    "item_code" : item_code,
                    "batch" : batch
                },
                async: false,
                callback: function(r){
                    // console.log(r);
                    if (r && r.message) {
                        console.log("callback if");
                        console.log(r.message[0].name)
                        bin = r.message[0].name
                        return {
                            "filters": {
                                "name": r.message[0].name,
                                "company": frm.doc.company
                            }
                        };
                    }
                    else {
                        console.log("callback else");
                        return {
                            "filters": {
                                "company": frm.doc.company
                            }
                        };
                    }
                }
            });
            if(bin){
				return {
					"filters": {
						"name": bin,
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

