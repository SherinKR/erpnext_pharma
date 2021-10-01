frappe.ui.form.on('Payment Entry', {
	onload(frm) {
		if(frm.doc.party_type){
		    frm.refresh_field("party_type");
		    frm.refresh_field("party");
		    frm.refresh_field("received_amount");
		    frm.refresh_field("paid_amount");
		    frm.refresh_field("get_outstanding_invoice");
		}
	},
	refresh(frm) {
		if(frm.doc.party_type){
		    frm.refresh_field("party_type");
		    frm.refresh_field("party");
		    frm.refresh_field("received_amount");
		    frm.refresh_field("paid_amount");
		    frm.refresh_field("get_outstanding_invoice");
		}
	}
});