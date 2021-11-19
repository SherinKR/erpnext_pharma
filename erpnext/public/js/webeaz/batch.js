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