// Copyright (c) 2021, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Webeaz Settings', {
	refresh: function(frm) {
    set_filters(frm);
	}
});

function set_filters(frm){
  frm.set_query('central_warehouse', () => {
    return {
        filters: {
            is_group: '1'
        }
    }
  });
  frm.set_query('default_warehouse_for_central_warehouse', () => {
    return {
        filters: {
            company: frm.doc.central_warehouse
        }
    }
  });
  frm.set_query('ptc_price_list', () => {
    return {
        filters: {
            selling: '1',
            buying: '0'
        }
    }
  });
  frm.set_query('company_buying_price_list', () => {
    return {
        filters: {
            buying: '1',
            selling: '0'
        }
    }
  });
  frm.set_query('ptf_price_list', () => {
    return {
        filters: {
            selling: '1',
            buying: '1'
        }
    }
  });
	frm.set_query('internal_supplier_avanza', () => {
    return {
        filters: {
            is_internal_supplier: '1'
        }
    }
  });
}
