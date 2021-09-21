// Copyright (c) 2016, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Item Master Report"] = {
	"filters": [
		{
			fieldname:"item",
			label:__("Item"),
			fieldtype:"Link",
			options:"Item"
		},
		{
			fieldname:"company",
			label:__("Company"),
			fieldtype:"Link",
			options:"Company"
		}
	],
	
	columns = [
		{
			fieldname:"item_name",
			label:__("Item Name"),
			fieldtype:"Data"
		},
		{
			fieldname:"batch",
			label:__("Batch"),
			fieldtype:"Link",
			options:"Batch"
		},
		{
			fieldname:"expiry",
			label:__("Expiry"),
			fieldtype:"Date"
		},
		{
			fieldname:"content",
			label:__("Content"),
			fieldtype:"Data"
		},
		{
			fieldname:"current_stock",
			label:__("Current Stock"),
			fieldtype:"Float"
		},
		{
			fieldname:"purchase_qty",
			label:__("Purchase Qty"),
			fieldtype:"Float"
		},
		{
			fieldname:"free_qty",
			label:__("Free Qty"),
			fieldtype:"Float"
		},
		{
			fieldname:"purchase_return",
			label:__("Purchase Return"),
			fieldtype:"Float"
		},
		{
			fieldname:"sales_qty",
			label:__("Sales Qty"),
			fieldtype:"Float"
		},
		{
			fieldname:"sales_return",
			label:__("Sales Return"),
			fieldtype:"Float"
		},
		{
			fieldname: "material_issue",
			fieldtype: "Float",
			label: "Miscellaneous Issue"
		},
		{
			fieldname: "material_receipt",
			fieldtype: "Float",
			label: "Miscellaneous Receipt"
		},
		{
			fieldname:"company_buying",
			label:__("Company Buying"),
			fieldtype:"Currency"
		},
		{
			fieldname:"ptf",
			label:__("PTF"),
			fieldtype:"Currency"
		},
		{
			fieldname:"ptc",
			label:__("PTC"),
			fieldtype:"Currency"
		},
		{
			fieldname:"mrp",
			label:__("MRP"),
			fieldtype:"Currency"
		},
		{
			fieldname:"gst",
			label:__("GST"),
			fieldtype:"Float"
		},
		{
			fieldname:"uom",
			label:__("UOM"),
			fieldtype:"Link",
			options:"UOM"
		},
		{
			fieldname:"is_purchase",
			label:__("Is Purchase"),
			fieldtype:"Check"
		},
		{
			fieldname:"is_sales",
			label:__("Is Sales"),
			fieldtype:"Check"
		},
		{
			fieldname:"superseeded_by",
			label:__("Superseeded By"),
			fieldtype:"Link",
			options:"Item"
		},
		{
			fieldname:"qty_per_pack",
			label:__("Qty Per Pack"),
			fieldtype:"Float"
		},
		{
			fieldname:"rack",
			label:__("Rack"),
			fieldtype:"Link",
			options:"Bins"
		}

	]
	
};
