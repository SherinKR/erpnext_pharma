frappe.ui.form.on('Item', {
	onload(frm) {
	    var cn= frappe.defaults.get_user_default("Company");
        frappe.call({
        "method" : "frappe.client.get_list",
        "args" : {
            "doctype" : "Warehouse",
            "filters" : {"company" : cn }
        },
        callback: function(r){
            if(r){
            console.log(r.message);
            }
            else{
                return false;
            }
        }
        });
    
        frm.set_query('superseded_item', () => {
        	return {
                filters: {
                    purchase_type:"Internal"
                }
        	};
		});

		var company = frappe.defaults.get_user_default("Company");
		if(frm.is_new()){
			frappe.db.get_value('Company', company, 'is_group', function(r) {
				if(r && r.is_group != 1){
                    console.log("testtt 1");
					frm.set_value('purchase_type', 'External');
					frm.set_df_property('purchase_type', 'read_only', true);
                    frm.set_value('superseded_by_sg', false);
                    frm.set_df_property('disabled', 'read_only', true);
                    frm.set_df_property('superseded_by_sg', 'hidden', true);
				}
				else{
                    console.log("testtt 2");
                    frm.set_value('purchase_type', 'Internal');
                    frm.set_df_property('superseded_by_sg', 'hidden', false);
				}
			});
		}
		check_items(frm);

	},
	refresh(frm){
		check_items(frm);
        var company = frappe.defaults.get_user_default("Company");
		frm.add_custom_button('Add Reorder', () => {
		   add_reorder(frm, company);
		});
		frm.add_custom_button(__('Set Item Defaults'), function() {
			frappe.call({
				"method": "erpnext.controllers.item_setup.set_item_defaults_from_item",
				"args": {
					"item_code": frm.doc.item_code
				},
				callback: function(r){
					console.log(r);
					frm.reload_doc();
					frappe.msgprint(__('Item defaults succesfully updated'));
				}
			});
        });
        frm.add_custom_button(__('Set Tax Defaults'), function() {
            frappe.call({
                "method": "erpnext.controllers.item_setup.set_tax_defaults_from_item",
                "args": {
                    "item_code": frm.doc.item_code
                },
                callback: function(r){
                    console.log(r);
                    frm.reload_doc();
                    frappe.msgprint(__('Item defaults succesfully updated'));
                }
            });
        });

	},
	purchase_type: function(frm){
	  if(frm.doc.purchase_type == 'Internal'){
	        frm.set_value('naming_series', 'IP-')
	    }
	    else if(frm.doc.purchase_type == 'External'){
	        frm.set_value('naming_series', 'EP-')
	    }
	},
	item_group: function(frm){
	    if(frm.doc.item_group){
	        frappe.db.get_value('Item Group', frm.doc.item_group, 'has_batch_no', function(ret){
	           frm.set_value('has_batch_no', ret.has_batch_no)
	        });
	    }
	}
});

var check_items = function(frm){
	var company = frappe.defaults.get_user_default("Company");
	frappe.db.get_value('Company', company, 'is_group', function(r) {
		if(r && r.is_group != 1){
			frm.set_df_property('disabled', 'read_only', true);
			if(!frm.is_new()){
				set_item_readonly(frm);
			}
		}
		else{
			frm.set_df_property('disabled', 'read_only', false);
		}
	});
};

frappe.ui.form.on('Item Drug Content', {
	drug_content(frm) {
		set_drug_content_data(frm);
	}
});

var set_drug_content_data = function(frm){
  if(frm.doc.item_drug_content){
    var drug_content = '';
    frm.doc.item_drug_content.forEach(function(item, i){
        if(i===0){
            drug_content += item.drug_content;
        }
        else{
            drug_content += ', '+item.drug_content;
        }
    });
    frm.set_value('drug_content', drug_content);
  }
};

function set_item_readonly(frm){
  frm.set_df_property('disabled', 'read_only', true);
  frm.set_df_property('item_name', 'read_only', true);
  frm.set_df_property('allow_alternative_item', 'read_only', true);
  frm.set_df_property('item_group', 'read_only', true);
  frm.set_df_property('gst_hsn_code', 'read_only', true);
  frm.set_df_property('is_nil_exempt', 'read_only', true);
  frm.set_df_property('is_non_gst', 'read_only', true);
  frm.set_df_property('stock_uom', 'read_only', true);
  frm.set_df_property('include_item_in_manufacturing', 'read_only', true);
  frm.set_df_property('valuation_rate', 'read_only', true);
  frm.set_df_property('superseded_by_sg', 'read_only', true);
  frm.set_df_property('superseded_item', 'read_only', true);
  frm.set_df_property('over_delivery_receipt_allowance', 'read_only', true);
  frm.set_df_property('over_billing_allowance', 'read_only', true);
  frm.set_df_property('manufacturer', 'read_only', true);
  frm.set_df_property('brand', 'read_only', true);
  frm.set_df_property('uoms', 'read_only', true);
  frm.set_df_property('prescription_drug_class', 'read_only', true);
  frm.set_df_property('item_drug_content', 'read_only', true);
  frm.set_df_property('item_packing_type', 'read_only', true);
  frm.set_df_property('description', 'read_only', true);
  frm.set_df_property('barcodes', 'read_only', true);
  frm.set_df_property('shelf_life_in_days', 'read_only', true);
  frm.set_df_property('end_of_life', 'read_only', true);
  frm.set_df_property('default_material_request_type', 'read_only', true);
  frm.set_df_property('warranty_period', 'read_only', true);
  frm.set_df_property('weight_per_unit', 'read_only', true);
  frm.set_df_property('weight_uom', 'read_only', true);
  frm.set_df_property('has_batch_no', 'read_only', true);
  frm.set_df_property('create_new_batch', 'read_only', true);
  frm.set_df_property('batch_number_series', 'read_only', true);
  frm.set_df_property('has_expiry_date', 'read_only', true);
  frm.set_df_property('retain_sample', 'read_only', true);
  frm.set_df_property('sample_quantity', 'read_only', true);
  frm.set_df_property('has_serial_no', 'read_only', true);
  frm.set_df_property('serial_no_series', 'read_only', true);
  frm.set_df_property('item_defaults', 'read_only', true);
  frm.set_df_property('has_variants', 'read_only', true);
  frm.set_df_property('variant_based_on', 'read_only', true);
  frm.set_df_property('attributes', 'read_only', true);
  frm.set_df_property('is_purchase_item', 'read_only', true);
  frm.set_df_property('purchase_uom', 'read_only', true);
  frm.set_df_property('min_order_qty', 'read_only', true);
  frm.set_df_property('sales_uom', 'read_only', true);
  frm.set_df_property('max_discount', 'read_only', true);
  frm.set_df_property('is_sales_item', 'read_only', true);
  frm.set_df_property('taxes', 'read_only', true);
  frm.set_df_property('reorder_levels', 'read_only', true);
}

function add_reorder(frm, company){
  console.log(company);
  let d = new frappe.ui.Dialog({
    title: 'Reorder Details',
    fields: [
      {
        label: 'Request for',
        fieldname: 'warehouse',
        fieldtype: 'Link',
        options: 'Warehouse',
        filters: { 'company' : company }
      },
      {
        label: 'Re-order Level',
        fieldname: 'warehouse_reorder_level',
        fieldtype: 'Float'
      },
      {
        label: 'Re-order Qty',
        fieldname: 'warehouse_reorder_qty',
        fieldtype: 'Float'
      }
    ],
    primary_action_label: 'Add Reorder',
    primary_action(values) {
      var flag = 0;
      for(var i=0; i<frm.doc.reorder_levels.length ; i++){
        if(values.warehouse==frm.doc.reorder_levels[i].warehouse){
            flag = 1;
            frm.doc.reorder_levels[i].warehouse_reorder_level = values.warehouse_reorder_level;
            frm.doc.reorder_levels[i].warehouse_reorder_qty = values.warehouse_reorder_qty;
            frm.refresh();
            frm.save();
        }
      }
      if(flag==0){
        let row = frm.add_child('reorder_levels', {
          warehouse: values.warehouse
        });
        row.warehouse_group = values.warehouse;
        row.warehouse_reorder_level = values.warehouse_reorder_level;
        row.warehouse_reorder_qty = values.warehouse_reorder_qty;
        row.material_request_type = 'Purchase';
        frm.refresh_field("reorder_levels");
        frm.refresh();
        frm.save();
      }
      d.hide();
    }
  });
  d.show();
}
