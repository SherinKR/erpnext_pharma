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
	}
});