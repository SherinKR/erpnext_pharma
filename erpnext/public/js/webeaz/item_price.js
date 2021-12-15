frappe.ui.form.on('Item Price',{
    rate_in_strip(frm){
      get_price_list_rate_based_on_rate_in_strip(frm)
    },
    validate: function(frm){
      get_price_list_rate_based_on_rate_in_strip(frm)
    },
    refresh: function(frm){
      frm.set_df_property('price_list_rate', 'read_only', 1)
    }
});
  
var get_price_list_rate_based_on_rate_in_strip = function(frm){
  if(frm.doc.rate_in_strip && frm.doc.item_code){
    frappe.call({
      "method": "erpnext.controllers.item_price.get_price_list_rate_based_on_rate_in_strip",
      "args": {
        'rate_in_strip': frm.doc.rate_in_strip,
        'item_code': frm.doc.item_code
      },
      callback: function(r){
        if(r.message){
          frm.set_value('price_list_rate', r.message.price_list_rate);
          // frm.set_df_property('price_list_rate', 'read_only', 1)

        }
      }
    });
  }
}