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
	},
	refresh(frm){
		hide_dashbord(frm);
	}
});

function hide_dashbord(frm){
	if(frappe.defaults.get_user_default("Company")){
		var company=frappe.defaults.get_user_default("Company")
		frappe.db.get_value('Company', company, 'is_group', function(r) {
			if(r && r.is_group != 1){
				console.log("Franchise");
				frm.dashboard.hide()
			}
		});
	}
}