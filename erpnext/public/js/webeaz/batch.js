frappe.ui.form.on('Batch', {
	batch_name(frm) {
		if(frm.doc.batch_name && frm.doc.item){
		    frm.set_value('batch_id', frm.doc.batch_name+"-"+frm.doc.item);
		    frm.refresh_field('batch_id');
		}
	},
	validate(frm){
	    if(frm.doc.batch_name && frm.doc.item){
		    frm.set_value('batch_id', frm.doc.batch_name+"-"+frm.doc.item);
		    frm.refresh_field('batch_id');
			get_mrp_based_on_mrp_in_strip(frm);
		}
	},
	item(frm){
	    if(frm.doc.batch_name && frm.doc.item){
		    frm.set_value('batch_id', frm.doc.batch_name+"-"+frm.doc.item);
		    frm.refresh_field('batch_id');
		}
	},
	onload(frm){
		hide_dashbord(frm);
		// calculate_batch_qty(frm);
	},
	refresh(frm){
		hide_dashbord(frm);
		calculate_batch_qty(frm);
	},
	mrp_in_strip(frm){
		get_mrp_based_on_mrp_in_strip(frm);
	}

});

function hide_dashbord(frm){
	if(frappe.defaults.get_user_default("Company")){
		var company=frappe.defaults.get_user_default("Company")
		frappe.db.get_value('Company', company, 'is_group', function(r) {
			if(r && r.is_group != 1){
				frm.dashboard.hide()
			}
		});
	}
}

function calculate_batch_qty(frm){
	if(!frm.is_new()){
		console.log("inside")
		if(frappe.defaults.get_user_default("Company")){
			var company=frappe.defaults.get_user_default("Company")
			frappe.db.get_value('Company', company, 'is_group', function(r) {
				if(r && r.is_group != 1){
					frappe.call({
						method: 'erpnext.stock.doctype.batch.batch.get_batch_qty_with_company',
						args: {company: company,batch_no: frm.doc.name},
						callback: function(r) {
							if(r && r.message){
								frm.set_value("franchise_batch_qty", r.message);
								frm.set_df_property('franchise_batch_qty', 'hidden', 0);
								frm.set_df_property('batch_qty', 'hidden', 1);
								frm.save()
							}
						}
					});
				}
			});
		}
		else{
			frappe.msgprint({
				title: __('Session missing!'),
				indicator: 'red',
				message: __('Set Company in session')
			});
		}
	}
}

function get_mrp_based_on_mrp_in_strip(frm){
	console.log('sdfghj');
	if(frm.doc.mrp_in_strip && frm.doc.item){
		frappe.call({
		  "method": "erpnext.controllers.item_price.get_item_conversion_factor",
		  "args": {
			'mrp_in_strip': frm.doc.mrp_in_strip,
			'item_code': frm.doc.item
		  },
		  callback: function(r){
			console.log(r.message);
			if(r.message){
			  frm.set_value('mrp', r.message.mrp);
			  // frm.set_df_property('price_list_rate', 'read_only', 1)
	
			}
		  }
		});
	  }
}