frappe.ui.form.on("Purchase Invoice",{
    onload:function(frm){
        if(frm.doc.is_return){
            frm.set_value("update_stock",1);
            frm.refresh_field("update_stock");
        }
        if(frm.doc.inter_company_invoice_reference){
		    frm.set_value('update_stock', 0);
		    frm.refresh_field('update_stock');
		}
        // var batches=[];;
        // var dates=[];
        // if(frm.doc.supplier && frm.doc.company && frm.doc.supplier!=="Internal Supplier SG"){
        //     frappe.call({
        //         "method":"frappe.client.get",
        //         "args":{
        //             "doctype":"Purchase Receipt",
        //             "filters":{"company":frm.doc.company,"supplier":frm.doc.supplier}
        //         },
        //         callback:function(r){
        //             if(r){
        //                 console.log(r);
        //                 console.log(r.message.items);
        //                 var j=0;
        //                 $.each(r.message.items, function(i, item) {
        //                     console.log("egfegerf");
        //                     console.log(j);
        //                     batches[j] = item.batch_no;
        //                     dates[j]=item.batch_expiry_date;
        //                     j=j+1;
        //                     console.log(item.batch_no);
        //                 });
        //                 var j=0;
        //                 console.log(batches);
        //                 $.each(frm.doc.items, function(i, item) {
        //                     item.batch_no=batches[j];
        //                     item.expiry_date=dates[j];
        //                     j=j+1;
        //                 });
        //                 frm.refresh_field("items");
        //                 frm.refresh();
                    
        //             }
        //             else{
        //                 return false;
        //             }
        //         }
        //     });
        // }
        // else{
        //     console.log("Intercompany Purchase Invoice");
        //     frm.set_value("update_stock",false);
        // }
    },
    is_return(frm){
        if(frm.doc.is_return){
            frm.set_value("update_stock",1);
            frm.refresh_field("update_stock");
        }
    },
    refresh(frm){
        if(frm.doc.is_return){
            frm.set_value("update_stock",1);
            frm.refresh_field("update_stock");
        }
        if(frm.doc.inter_company_invoice_reference){
		    frm.set_value('update_stock', 0);
		    frm.refresh_field('update_stock');
		}
    }
});