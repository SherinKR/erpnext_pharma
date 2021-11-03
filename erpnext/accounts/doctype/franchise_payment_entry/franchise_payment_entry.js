var total_sales_amount=0,total_purchase_amount=0,total_paid_amount=0,total_allocated_amount=0;
frappe.ui.form.on('Franchise Payment Entry', {
    get_items(frm) {
      frm.clear_table("items");
      frm.refresh_fields();
      frappe.call({
        "method": "frappe.client.get_list",
        "args": {
            "doctype": "Franchise Payment Request",
            "filters": { "status":"Unpaid", "company": frm.doc.company,"transaction_date" : [">=",  (frm.doc.from_date)] , "transaction_date" : ["<=",  (frm.doc.to_date)]}
        },
        callback: function(r){
          if(r && r.message && r.message.length > 0){
              for(var i=0; i< r.message.length; i++){
                  let row = frm.add_child('items',{
                      doc_name: r.message[i].name
                  });
                  frm.script_manager.trigger("doc_name", row.doctype, row.name);
                  frm.refresh_field("items");
              }
              find_totals(frm);
              frm.save();
              frm.refresh_field('items');
              frm.refresh_fields();
              frm.trigger("validate");
          }
        }
      });
    },
    get_total(frm){
      find_totals(frm);
    },
    refresh(frm){
      frappe.db.get_value("Payment Entry", {'franchise_payment_entry': frm.doc.name } , 'name', function(payment_entry) {
        if(!payment_entry.name){
          frm.add_custom_button(__('Payment Entry'), cur_frm.cscript['Payment Entry'], __('Create'));
        }
        else{
          frm.disable_save();
          // frm.refresh()
        }
      });
    },
    after_save(frm){
      find_totals(frm);
    }
});
function find_totals(frm){
  total_sales_amount=0;
  total_purchase_amount=0;
  total_paid_amount=0;
  total_allocated_amount=0;
  $.each(frm.doc.items || [], function(i, item) {
      total_sales_amount = total_sales_amount+ item.sales_amount;
      total_purchase_amount = total_purchase_amount+ item.purchase_amount;
      total_paid_amount = total_paid_amount+ item.paid_amount;
      total_allocated_amount = total_allocated_amount + item.allocated_amount
  });
  frm.set_value('total_sales_amount',total_sales_amount);
  frm.refresh_field('total_sales_amount');
  frm.set_value('total_purchase_amount',total_purchase_amount);
  frm.refresh_field('total_purchase_amount');
  frm.set_value('total_paid_amount',total_paid_amount);
  frm.refresh_field('total_paid_amount');
  frm.set_value('total_allocated_amount',total_allocated_amount);
  frm.refresh_field('total_allocated_amount');
}
cur_frm.cscript['Payment Entry'] = function() {
	frappe.model.open_mapped_doc({
		method: "erpnext.accounts.doctype.franchise_payment_entry.franchise_payment_entry.make_payment_entry",
		frm: cur_frm,
	})
};
