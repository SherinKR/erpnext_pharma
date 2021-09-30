frappe.ui.form.on('Purchase Receipt', {
    onload: function(frm){
        setTimeout(() => {
            frm.remove_custom_button("Retention Stock Entry",'Create');
            frm.remove_custom_button("Subscription",'Create');
            frm.remove_custom_button("Purchase Return",'Create');
            frm.remove_custom_button("Asset","View");
            frm.remove_custom_button("Asset Movement","View");
        },5);
    },
    fetch_batches: function(frm){
        fetch_batches(frm);
    },
    supplier:function(frm){
        if(frm.doc.supplier!="Internal Supplier SG"){
            frm.set_df_property("fetch_batches","hidden",true);
        }
        else{
            frm.set_df_property("fetch_batches","hidden",false);
        }
    }
});
function fetch_batches(frm){
    console.log( frm.doc.purchase_invoice_reference);
    var batches =[];
    frappe.call({
        "method" : "frappe.client.get",
        "args" : {
            "doctype" : "Purchase Invoice",
            "filters" : {"name": frm.doc.purchase_invoice_reference}
        },
        callback: function(r){
            if(r){
                var j=0;
                $.each(r.message.items, function(i, item) {
                    batches[j] = item.batch_no; j=j+1;
                });
                var j=0;
                // console.log(batches);
                // console.log(batches[0]);
                $.each(frm.doc.items, function(i, item) {
                    // console.log("dsvfdsgvef");
                    item.batch_no=batches[j];
                    // console.log(batches[j]);
                    j=j+1;
                });
                frm.refresh_field("items");
                frm.refresh();  
            }
            else{
                return false;
             }
        }
    });

}