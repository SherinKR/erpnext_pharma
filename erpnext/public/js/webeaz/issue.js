frappe.ui.form.on('Issue',{
    onload(frm){
        if(!(frappe.user.has_role('System Manager'))){
            cur_frm.toggle_display('status',false);
        }        
    }
});