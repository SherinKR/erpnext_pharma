var company,company_is_group,company_internal_supplier,company_external_supplier;
frappe.ui.form.on('Purchase Order', {
    onload: function(frm){
    setTimeout(() => {
        frm.remove_custom_button("Product Bundle",'Get Items From');
        frm.remove_custom_button("Supplier Quotation",'Get Items From');
        frm.remove_custom_button("Update Rate as per Last Purchase",'Tools');
        frm.remove_custom_button("Link to Material Request",'Tools');
        frm.remove_custom_button('Subscription', 'Create');
    },5);
    },
    refresh: function(frm) {
        set_supplier(frm);
        check_company(frm);
        frm.get_field("items").grid.set_multiple_add("item_code", "qty");
        setTimeout(() => {
            frm.remove_custom_button('Payment Request', 'Create');
        }, 10);
        if(frm.doc.docstatus == 0){
            frappe.call({
                "method": "frappe.client.get",
                "args": {
                    "doctype": "Company",
                    "filters": {"company_name": frm.doc.company }
                    },
                callback: function(r){
                    if(r && r.message ){
                        company_is_group =r.message.is_group;
                        if(!company_is_group){
                            set_new_medicine_button(frm);
                            set_product_availability_button(frm);
                        }
                    }
                    else{
                        return false;
                    }
                }
            });
        }
        check_company(frm);
    },
    order_type: function(frm){
        check_order_type(frm);
        check_company(frm);
    },
    company: function(frm){
		    check_company(frm);
    },
    search_item : function(frm){
      remove_empty_items(frm);
  		if(!frm.doc.supplier){
  			frappe.throw(__('Select Supplier before search'));
  		}
      else {
        search_item_button(frm);
      }
    }
});
var check_company = function(frm){
    frappe.call({
        "method": "frappe.client.get",
        "args": {
            "doctype": "Company",
            "filters": {"company_name": frm.doc.company }
            },
        callback: function(r){
            if(r){
                var company_is_group =r.message.is_group;
                if(!company_is_group){
                    set_item_filter(frm);
                    frm.set_df_property('order_type', 'read_only', false);
                    frm.refresh_field("order_type");
                }
                else {
                    set_item_filter_central(frm);
                    frm.set_df_property('order_type', 'read_only', true);
                    frm.set_value("order_type","External");
                    frm.refresh_field("order_type");
                }
            }
        }
    });
};
var set_item_filter = function(frm){
	frm.set_query("item_code", "items", function() {
        return {
            query: "erpnext.controllers.queries.item_query",
            filters: {'purchase_type': frm.doc.order_type, 'is_purchase_item':1}
        };
	});
};
var set_item_filter_central = function(frm){
	frm.set_query("item_code", "items", function() {
        return {
            query: "erpnext.controllers.queries.item_query",
            filters: {'purchase_type': "Internal", 'is_purchase_item':1}
        };
	});
};
var set_supplier = function(frm) {
    frappe.call({
        "method": "frappe.client.get",
        "args": {
            "doctype": "Company",
            "filters": {"company_name": frm.doc.company }
            },
        callback: function(r){
            if(r){
                company_is_group =r.message.is_group;
                company_external_supplier = r.message.external_supplier;
                company_internal_supplier = r.message.internal_supplier;
                check_order_type(frm);
            }
            else{
                return false;
            }
        }
    });
};

var set_new_medicine_button = function(frm) {
	var new_item=[];
	frm.add_custom_button(__('Get New Products'), function() {
    remove_empty_items(frm);
		frappe.call({
			"method": "erpnext.controllers.queries.get_new_medicines",
			"args": {
				"company": frm.doc.company, "purchase_type": frm.doc.order_type
			},
			callback: function(ret){
				if(ret && ret.message){
            if((ret.message.length)>0){
                new_items_popup(frm, ret.message);
            }
            else{
                frappe.msgprint(__('No new products found that you did not purchased yet.!'));
            }
				}
			}
		});
	});
};

function check_order_type(frm){
    if(!company_is_group){
        if(frm.doc.order_type=='Internal'){
            frm.set_value("supplier",company_internal_supplier);
        }
        if(frm.doc.order_type=='External'){
            frm.set_value("supplier",company_external_supplier);
        }
        frm.set_df_property('supplier', 'read_only', true);
    }
    else{
        frm.set_df_property('supplier', 'read_only', false);
    }
};

var new_items_popup = function(frm, new_items) {
    var d = new frappe.ui.Dialog({
        title:__("Products as per search"),
		    width: 900,
        fields:[
            {
                "fieldtype": "HTML",
                "fieldname": "items_html"
            }
        ],
        primary_action_label: 'Add Items',
        primary_action() {
            var opts = d.item_check_list.get_item();
            var me = d.item_check_list;
            var items = "";
            if(!opts.checked_items.length){
                return;
            }
            else{
                opts.checked_items.forEach((item, i) => {
                    // let item_table = frappe.model.add_child(frm.doc, 'Items', 'items');
                    // frappe.model.set_value(item_table.doctype, item_table.name, 'item_code', item);
                    let row = frm.add_child('items', {
                        item_code: item
                    });
                    frm.script_manager.trigger("item_code", row.doctype, row.name);
                    frm.refresh_field("items");
                });
                frm.refresh_field('items');
                frm.refresh_fields();
                frm.trigger("validate");
            }
            d.hide();
    }
    });
    d.show();
    d.get_primary_btn().attr('disabled', false);
    d.fields_dict.items_html.$wrapper.html("");
    d.$wrapper.find('.modal-content').css("width", "900px");
    d.$wrapper.find('.modal-content').css("margin-left", "-200px");
    var items_area = $('<div class="col-md-12 col-sm-12" style="min-height: 10px;">').appendTo(d.fields_dict.items_html.wrapper);
    d.item_check_list = new frappe.ItemsCheckList(items_area, frm, 0, d, new_items);
};

frappe.ItemsCheckList = Class.extend({
    init: function(wrapper, frm, disable, d, new_items) {
        var me = this;
        this.frm = frm;
        this.wrapper = wrapper;
        this.disable = disable;
        $(wrapper).html('<div class="help">' + __("Loading") + '...</div>');
        me.items = new_items;
        me.show_items(frm, d);
    },
    show_items: function(frm, d) {
        var me = this;
        var i;
        var table_row = '';
        $(this.wrapper).empty();
        var table_head = '';
        if(this.items){
            $.each(this.items, function(i, item) {
				var drug_content = item.drug_content ? item.drug_content : '';
                var item_check_field = repl('<div class="item" \
                data-item-id="%(item_id)s">\
                <input type="checkbox" class="box"> \
                </input>',
                {item_id: item.item_code});
                table_row += "<tr><td>"+item_check_field+"</td><td>"+__(item.item_name)+"</td><td>"+drug_content+"</td></tr>";
            });
        }
        var table_html = `
            <table widht="100%"><tr>
				<th></th>
                <th>Product</th>
                <th>Drug Content</th>
            </tr>
        `;
        if (table_row){
            table_html += table_row;
        }
        table_html += '</table>';
        $(me.wrapper).append(table_html);
    },
    show: function() {
        var me = this;
        // uncheck all items
        $(this.wrapper).find('input[type="checkbox"]')
            .each(function(i, checkbox) {
                checkbox.checked = false;
        });
    },
    get_item: function() {
        var checked_items = [];
        var unchecked_items = [];
        $(this.wrapper).find('[data-item-id]').each(function() {
            if($(this).find('input[type="checkbox"]:checked').length) {
                checked_items.push($(this).attr('data-item-id'));
            } else {
                unchecked_items.push($(this).attr('data-item-id'));
            }
        });
        return {
            checked_items: checked_items,
            unchecked_items: unchecked_items
        };
    }
});

frappe.ui.form.on('Purchase Order Item', {
  item_code: function(frm, cdt, cdn){
    var child = locals[cdt][cdn];
    if(child.item_code.charAt(0)=="E"){
        var p1=[];
        var y=child.item_code
        frappe.call({
            "method" : "frappe.client.get_list",
            "args" : {
                "doctype" : "Item",
                "filters" : {"item_code":y},
                "fields"  :["drug_content"]
            },
            callback:function(r){
                if(r){
                    console.log(r);
                    console.log(r.message[0]);
                    p1=r.message[0].drug_content
                    console.log("r1r1r1r1r1rr",p1);
                    frappe.call({
                        "method":"frappe.client.get_list",
                        "args":{
                            "doctype":"Item",
                            "filters":{"drug_content":p1,"purchase_type":"Internal"},
                            "fields":["item_name"]
                        },
                        callback:function(r1){
                                console.log(r1);
                                var neww=r1.message;
                                var neww2=[];
                                for( var i=0;i<neww.length;i++){
                                    console.log(neww[i].item_name)
                                    var neww1=neww[i].item_name;
                                    neww2.push(neww1)
                                }
                                frappe.msgprint({
                                    title:__('Notification'),
                                    indicator:'green',
                                    message:__("You have similar Product in Storegenrix:"+neww2)
                                })
                        }
                    })
                }
            }
        });
    }
    else{
        console.log(child.item_code);
        frappe.call({
            method: 'frappe.client.get',
            args: {
                'doctype': 'Item',
                'filters': {'item_code': child.item_code}
            },
            callback: function(r){
                if(r.message.superseded_from){
                frappe.msgprint({
                    title: __('Notification'),
                    indicator: 'green',
                    message: __('Item '+r.message.superseded_from+' is superseded by '+child.item_code)
                });
                }
            }
        });
    }
    }
});

var search_item_button = function(frm){
	let d = new frappe.ui.Dialog({
    title: 'Search Items',
    fields: [
        {
            label: 'ITEM DETAILS',
            fieldname: 'search_field',
            fieldtype: 'Data'
        },
        {
            label:"CONTENT",
            fieldname: 'drug_contents',
            fieldtype: 'MultiSelectList',
            get_data: function(txt) {
				return frappe.db.get_link_options('Drug Content',txt);
			}
        }
    ],
    primary_action_label: 'Search',
    primary_action(values) {
        console.log(values);
        d.hide();
		search_items(frm,values)
    }
	});
	d.show();
}

var search_items = function(frm, values) {
    if(values.search_field){
        frappe.call({
            "method": 'erpnext.accounts.doctype.sales_invoice.sales_invoice.check_superseded_item',
            "args": {
                    'item_name': values.search_field
            },
            callback: function(r){
                if(r && r.message){
                   frappe.msgprint({
                       title: __('Item Superseded'),
                       indicator: 'green',
                       message: __('Item '+ r.message.item_name +' is Superseded by '+ r.message.superseded_item_name )
                   });
                }
            }
       });
    }

	var new_item=[];
	frappe.call({
		"method": "erpnext.controllers.queries.search_item_contents",
		"args": {
			"filter_value": values.search_field,
			"drug_content": values.drug_contents,
            "purchase" : 1
		},
		callback: function(ret){
			if(ret && ret.message){
				new_items_popups(frm, ret.message);
			}
		}
	});
};

var new_items_popups = function(frm, new_items) {
    var d = new frappe.ui.Dialog({
        title:__("Search Items"),
				width: 1000,
        fields:[
            {
                "fieldtype": "HTML",
                "fieldname": "items_html"
            }
        ],
        primary_action_label: 'Add Items',
        primary_action() {
            var opts = d.item_check_list.get_item();
            var me = d.item_check_list;
            var items = "";
            if(!opts.checked_items.length){
                return;
            }
            else{
                opts.checked_items.forEach((item, i) => {
                    let row = frm.add_child('items', {
                        item_code: item
                    });
                    frm.script_manager.trigger("item_code", row.doctype, row.name);
                    frm.refresh_field("items");
                });
                frm.refresh_field('items');
                frm.refresh_fields();
                frm.trigger("validate");
            }
            d.hide();
    }
    });
    d.show();
    d.get_primary_btn().attr('disabled', false);
    d.fields_dict.items_html.$wrapper.html("");
		d.$wrapper.find('.modal-content').css("width", "800px");
        d.$wrapper.find('.modal-content').css("margin-left", "-100px");
    var items_area = $('<div class="col-md-12 col-sm-12" style="min-height: 10px;">').appendTo(d.fields_dict.items_html.wrapper);
    d.item_check_list = new frappe.ItemsCheckList(items_area, frm, 0, d, new_items);
};

frappe.ItemsCheckList = Class.extend({
    init: function(wrapper, frm, disable, d, new_items) {
        var me = this;
        this.frm = frm;
        this.wrapper = wrapper;
        this.disable = disable;
        $(wrapper).html('<div class="help">' + __("Loading") + '...</div>');
        me.items = new_items;
        me.show_items(frm, d);
    },
    show_items: function(frm, d) {
        var me = this;
        var i;
        var table_row = '';
        $(this.wrapper).empty();
        var table_head = '';
        if(this.items){
            $.each(this.items, function(i, item) {
								var drug_content = item.drug_content ? item.drug_content : '';
                var item_check_field = repl('<div class="item" \
                data-item-id="%(item_id)s">\
                <input type="checkbox" class="box"> \
                </input>',
                {item_id: item.item_code});
                table_row += "<tr><td>"+item_check_field+"</td><td>"+__(item.item_code)+"</td><td>"+__(item.item_name)+"</td><td>"+drug_content+"</td></tr>";
            });
        }
        var table_html = `
            <table width="100%">
                <tr>
				    <th width="5%"></th>
                    <th width="10%">Item Code</th>
					<th width="30%">Item Name</th>
                    <th width="55%">Contents</th>
                </tr>
        `;
        if (table_row){
            table_html += table_row;
        }
        table_html += '</table>';
        $(me.wrapper).append(table_html);
    },
    show: function() {
        var me = this;
        // uncheck all items
        $(this.wrapper).find('input[type="checkbox"]')
            .each(function(i, checkbox) {
                checkbox.checked = false;
        });
    },
    get_item: function() {
        var checked_items = [];
        var unchecked_items = [];
        $(this.wrapper).find('[data-item-id]').each(function() {
            if($(this).find('input[type="checkbox"]:checked').length) {
                checked_items.push($(this).attr('data-item-id'));
            } else {
                unchecked_items.push($(this).attr('data-item-id'));
            }
        });
        return {
            checked_items: checked_items,
            unchecked_items: unchecked_items
        };
    }
});

var set_product_availability_button = function(frm) {
	var new_item=[];
	frm.add_custom_button(__('Product Availability'), function() {
    remove_empty_items(frm);
    frappe.show_alert('Please wait Product Availability for '+frm.doc.company+' is processing.', 10);
		frappe.call({
			"method": "erpnext.controllers.queries.get_product_availability",
			"args": {
				"company": frm.doc.company
			},
			callback: function(ret){
        if(ret && ret.message){
            if((ret.message.length)>0){
                availabe_items_popup(frm, ret.message);
            }
            else{
                frappe.msgprint(__('No products found that you have purchased and out of stock. Use New products to order unpurchased items!'));
            }
        }
			}
		});
	});
};

function remove_empty_items(frm){
		var len = frm.doc.items.length;
		if(len>0){
			if(!frm.doc.items[len-1].item_code)
	    {
				frm.get_field("items").grid.grid_rows[len-1].remove();
	    }
		}
}

var availabe_items_popup = function(frm, new_items) {
    var d = new frappe.ui.Dialog({
        title:__("Products as per search"),
		width: 900,
        fields:[
            {
                "fieldtype": "HTML",
                "fieldname": "items_html"
            }
        ],
        primary_action_label: 'Add Items',
        primary_action() {
            var opts = d.item_check_list.get_item();
            var me = d.item_check_list;
            var items = "";
            if(!opts.checked_items.length){
                return;
            }
            else{
                opts.checked_items.forEach((item, i) => {
                    // let item_table = frappe.model.add_child(frm.doc, 'Items', 'items');
                    // frappe.model.set_value(item_table.doctype, item_table.name, 'item_code', item);
                    let row = frm.add_child('items', {
                        item_code: item
                    });
                    frm.script_manager.trigger("item_code", row.doctype, row.name);
                    frm.refresh_field("items");
                });
                frm.refresh_field('items');
                frm.refresh_fields();
                frm.trigger("validate");
            }
            d.hide();
    }
    });
    d.show();
    d.get_primary_btn().attr('disabled', false);
    d.fields_dict.items_html.$wrapper.html("");
    d.$wrapper.find('.modal-content').css("width", "900px");
    d.$wrapper.find('.modal-content').css("margin-left", "-200px");
    var items_area = $('<div class="col-md-12 col-sm-12" style="min-height: 10px;">').appendTo(d.fields_dict.items_html.wrapper);
    d.item_check_list = new frappe.ItemsCheckListAvailable(items_area, frm, 0, d, new_items);
};

frappe.ItemsCheckListAvailable = Class.extend({
    init: function(wrapper, frm, disable, d, new_items) {
        var me = this;
        this.frm = frm;
        this.wrapper = wrapper;
        this.disable = disable;
        $(wrapper).html('<div class="help">' + __("Loading") + '...</div>');
        me.items = new_items;
        me.show_items(frm, d);
    },
    show_items: function(frm, d) {
        var me = this;
        var i;
        var table_row = '';
        $(this.wrapper).empty();
        var table_head = '';
        if(this.items){
            $.each(this.items, function(i, item) {
				var drug_content = item.drug_content ? item.drug_content : '';
                var item_check_field = repl('<div class="item" \
                data-item-id="%(item_id)s">\
                <input type="checkbox" class="box"> \
                </input>',
                {item_id: item.item_code});
                table_row += "<tr><td>"+item_check_field+"</td><td>"+__(item.item_name)+"</td><td>"+drug_content+"</td></tr>";
            });
        }
        var table_html = `
            <table widht="100%"><tr>
				<th></th>
                <th>Product</th>
                <th>Drug Content</th>
            </tr>
        `;
        if (table_row){
            table_html += table_row;
        }
        table_html += '</table>';
        $(me.wrapper).append(table_html);
    },
    show: function() {
        var me = this;
        // uncheck all items
        $(this.wrapper).find('input[type="checkbox"]')
            .each(function(i, checkbox) {
                checkbox.checked = false;
        });
    },
    get_item: function() {
        var checked_items = [];
        var unchecked_items = [];
        $(this.wrapper).find('[data-item-id]').each(function() {
            if($(this).find('input[type="checkbox"]:checked').length) {
                checked_items.push($(this).attr('data-item-id'));
            } else {
                unchecked_items.push($(this).attr('data-item-id'));
            }
        });
        return {
            checked_items: checked_items,
            unchecked_items: unchecked_items
        };
    }
});
