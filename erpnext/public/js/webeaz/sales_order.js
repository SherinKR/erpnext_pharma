frappe.ui.form.on('Sales Order', {
	onload(frm) {
	    setTimeout(() => {
	        frm.remove_custom_button("Pick List",'Create');
	        frm.remove_custom_button("Work Order",'Create');
	        frm.remove_custom_button("Request for Raw Materials",'Create');
	        frm.remove_custom_button("Project",'Create');
	        frm.remove_custom_button("Project",'Create');
	        frm.remove_custom_button("Subscription",'Create');
	        
	    },5);
		if(frm.doc.workflow_state!='Demand Request Approved'){
		    frm.remove_custom_button('Sales Invoice','Create');
        }
        if(frm.doc.inter_company_order_reference){
            frm.set_value('po_no', frm.doc.inter_company_order_reference);
            frm.refresh_field('po_no');
            frm.set_value('order_type',"Sales");
            var c=frm.doc.company;
            frappe.model.get_value('Company', {'company_name': c}, 'default_warehouse',
            function(d) {
                console.log(d);
                frm.set_value("set_warehouse",d.default_warehouse);
            });
        }
	},
	workflow_state(frm) {
		if(frm.doc.workflow_state!='Demand Request Approved'){
		    frm.remove_custom_button('Sales Invoice','Create');
        }
	},
	refresh(frm){
	    if(frm.doc.inter_company_order_reference){
            frm.set_value('po_no', frm.doc.inter_company_order_reference);
            frm.refresh_field('po_no');
        }
        setTimeout(() => {
	        frm.remove_custom_button("Pick List",'Create');
	        frm.remove_custom_button("Work Order",'Create');
	        frm.remove_custom_button("Request for Raw Materials",'Create');
	        frm.remove_custom_button("Project",'Create');
	        frm.remove_custom_button("Project",'Create');
	        frm.remove_custom_button("Subscription",'Create');
	        
	    },5);
	}
});