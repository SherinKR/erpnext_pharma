frappe.ui.form.on('Company', {
	refresh: function(frm) {
		frm.add_custom_button(__('Set Item Defaults'), function() {
			frappe.msgprint(__('Item defaults updation started'));
			frappe.call({
				"method": "erpnext.controllers.item_setup.set_item_defaults",
				"args": {
					"company": frm.doc.company_name,
					"warehouse": frm.doc.default_warehouse,
					"price_list": frm.doc.default_price_list,
					"supplier": frm.doc.default_supplier
				},
				callback: function(r){
					console.log(r);
						frappe.msgprint(__('Item defaults succesfully updated'));
				}
			});
		});

		frm.add_custom_button(__('Set Tax Defaults'), function() {
			frappe.msgprint(__('Tax defaults updation started'));
			frappe.call({
				"method": "erpnext.controllers.item_setup.set_tax_defaults",
				"args": {
					"company": frm.doc.company_name,
					"warehouse": frm.doc.default_warehouse,
					"price_list": frm.doc.default_price_list,
					"tax_template": frm.doc.default_tax_template,
					"supplier": frm.doc.default_supplier
				},
				callback: function(r){
					console.log(r);
						frappe.msgprint(__('Tax defaults succesfully updated'));
				}
			});
		});
		if(frm.doc.is_group){
			frm.add_custom_button(__('Set Missing Item Price'), function() {
				frappe.msgprint(__('Item Price updation started'));
				frappe.call({
					"method": "erpnext.controllers.patches.create_item_price_without_batch",
					"args": {
						"price_list": "Price To Franchaisee - (PTF)"
					},
					callback: function(r){
						console.log(r);
					}
				});
			});
		}
	}
});
