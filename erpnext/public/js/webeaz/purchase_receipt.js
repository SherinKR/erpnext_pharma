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
      frappe.db.get_single_value("Webeaz Settings", "internal_supplier_avanza").then( internal_supplier_avanza=>{
  			if(internal_supplier_avanza){
          if(frm.doc.supplier==internal_supplier_avanza){
              frm.set_df_property("fetch_batches","hidden",false);
          }
          else{
              frm.set_df_property("fetch_batches","hidden",true);
          }
  			}
  			else{
  				frappe.throw(__('Set Internal Supplier in Webeaz Settings!'));
  			}
  		});
    }
});

function fetch_batches(frm){
    var batches =[];
    var rates =[];
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
                    batches[j] = item.batch_no;
                    rates[j] = item.rate;
                    j=j+1;
                });
                var j=0;
                $.each(frm.doc.items, function(i, item) {
                    item.batch_no=batches[j];
                    item.rate = rates[j]
                    item.price_list_rate = rates[j]
                    item.base_rate = rates[j]
                    item.base_price_list_rate = rates[j]
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
