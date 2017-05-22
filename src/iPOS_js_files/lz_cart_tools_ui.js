/**
 * Created by rce on 5/19/16.
 */


function add_ItemToShoppingCartFromDOM () {
    // 2016-05-07 RCE -- adds a normal shopping item to the CartArray, pulling the information from DOM fields

    // make sure everything is kosher
    if (getFieldValue('require_accept_terms') == '1' &&
        getFieldValue('is_club') == '1' &&
        getFieldValue('accept_terms_cbx') != '1'
    ) {
        LZ_advisory("Please check the box accepting the club terms.",'accept_terms_cbx');
        return false;
    }
    // todo: look for item in array already; remove if necessary

    var new_item = [];

    // now build the new element from the DOM
    new_item.cat_id 				= getFieldValue('cat_id');
    new_item.price  				= getFieldValue('item_price',true);
    new_item.base_price_ea          = getFieldValue('base_price_ea',true);
    new_item.qty					= getFieldValue('qty_0',true);
    new_item.amount					= getFieldValue('amt_0',true);
    new_item.ship_weight 			= getFieldValue('ship_weight');
    new_item.min_ship_speed 		= getFieldValue('min_ship_speed');
    new_item.taxable 				= getFieldValue('taxable');
    new_item.has_wine		 		= getFieldValue('has_wine');
    new_item.is_club 				= getFieldValue('is_club');
    new_item.is_disc		 		= getFieldValue('is_disc');
    new_item.no_discount            = getFieldValue('no_discount');
    new_item.free_ok				= getFieldValue('free_ok');
    new_item.num_bottles		 	= getFieldValue('num_bottles');
    new_item.description		 	= getFieldValue('item_description');    // XXX <-- change item_description to description
    new_item.catalog_num		 	= getFieldValue('catalog_num');
    new_item.sku_type				= getFieldValue('sku_type');
    new_item.cat_size_id			= getFieldValue('cat_size_id');
    new_item.image_src 				= getFieldElement('item_image','src');
    new_item.msg 					= getFieldValue('extra_info_msg');
    new_item.cluster_id             = getFieldValue('item_cluster');
    if (!new_item.cluster_id) {
        new_item.cluster_id         = getFieldValue('cluster_id');
    }
    new_item.require_accept_terms	= getFieldValue('require_accept_terms');
    new_item.inventory_type			= getFieldValue('inventory_type');
    new_item.future_release_date	= getFieldValue('future_release_date');
    // housekeeping
    if (new_item.is_disc == '1') {
        new_item.base_price_ea = Math.abs(new_item.amount);
    }
    if (parseFloat(new_item.amount) > 99999) {
        LZ_alert('Sorry, but the maximum amount for an individual item is $99,999. Please change the quantity ordered to reflect that limit.');
        return false;
    }

    addItemToCartArray(new_item);

    var anchor = gEBID('item_add_btn');
    if (!anchor) {
        anchor = gEBID('add_to_cart_btn');
    }
    LZ_advisory(new_item.description + ' added to cart',anchor,1200,'ok');

    closeItemDetails(); // no impact if not open

    if (window.customCartFunction !== undefined) {
        customCartFunction(new_item);
    } else {
        setFieldValue('fast_list_filter','');
        process_fast_list_filter();
    }
    setCartCookie();

    cart_displayShoppingCart(); // something to update
}


function add_cart_item_to_table (item_arr,free_str) {
    LZ_alert("call to add_cart_item_to_table; shouldn't happen; cat_id="+item_arr.cat_id);
    return false;
    /*
     if (typeof free_str == 'undefined' && parseFloat(item_arr.base_price_ea)===0 && item_arr.free_ok=='1' ) {
     if (Free_Item_String === null) {
     var json = ajaxSynchronousGET(/lz_getHTTPrequestData.php?REQ_TYPE=Misc_GetPref&pref=catalog_free_item_string);
     // wait
     Free_Item_String = json.result == 'FAIL' ? 'free' : json.result;    // FAIL means not found; go with 'free'
     }
     free_str = Free_Item_String;
     }

     var td, el, img, fld, val,
     tr = document.createElement("tr"),
     tbody = document.getElementById("itemsTable").tBodies[0];
     tr.id = 'row_'+item_arr.cat_id;

     td = document.createElement("td");
     td.className = 'num_cell qty';
     if (item_arr.is_disc != '1') {  // don't display anything if it's a discount
     td.appendChild (document.createTextNode(item_arr.qty != 0 ? item_arr.qty : '-'));
     }
     tr.appendChild(td);

     td = document.createElement("td");
     el = document.createElement('span');
     el.appendChild(document.createTextNode(item_arr.description));
     el.style.textDecoration = 'underline';
     el.ontouchstart = showItemDetails;
     el.onmousedown = showItemDetails;
     el.id = 'cel_'+item_arr.cat_id;
     td.appendChild (el);
     if (!cp_.isEmpty(item_arr.msg)) {
     td.appendChild(document.createElement("br"));
     td.appendChild(document.createTextNode('('+item_arr.msg+')'));
     }
     tr.appendChild(td);

     td = document.createElement("td");
     td.className = 'num_cell amt';
     if (item_arr.is_disc != '1'){
     td.appendChild (document.createTextNode((parseFloat(item_arr.base_price_ea)===0 && item_arr.free_ok=='1' ? free_str : item_arr.base_price_ea)));
     }
     tr.appendChild(td);

     td = document.createElement("td");
     td.className = 'num_cell subtotal';
     td.appendChild (document.createTextNode(CommaFormatted((item_arr.qty*item_arr.base_price_ea*(item_arr.is_disc == '1' ? -1 : 1)),false,true)));
     tr.appendChild(td);

     td = document.createElement("td");
     td.className = 'flag_taxable';
     td.appendChild (document.createTextNode((item_arr.taxable == 1 ? 'T' : '')));
     tr.appendChild(td);

     td = document.createElement("td");
     td.className = 'td_delete_gif';
     td.id = "cat_"+item_arr.cat_id;
     td.onclick = remove_item_from_cart;
     img = document.createElement("img");
     img.src = "lz_img/btn_delete_x(red).gif";
     td.appendChild(img);
     tr.appendChild(td);

     tbody.appendChild(tr);

     // added 2015-05-16 RCE to load fastPOS too
     fld = document.getElementById('fast_qty_'+item_arr.cat_id);
     if (fld) {
     // we've got a winner -- set the values
     setFieldValue('fast_qty_'+item_arr.cat_id,item_arr.qty);
     setFieldValue('fast_qty_echo_'+item_arr.cat_id,item_arr.qty);
     setFieldValue('fast_extra_info_'+item_arr.cat_id,item_arr.msg);
     setFieldValue('fast_price_'+item_arr.cat_id,item_arr.base_price_ea);
     // also set the className for the containing row
     fld = document.getElementById('cat_'+item_arr.cat_id);
     fld.className= fld.className.replace(' active','') + ' active';
     }
     */
}


function addFastPOSitemToCartArray (caller) {
    if (caller.currentTarget) {
        caller = caller.currentTarget;
    }

    document.getElementById('fast_list_filter').focus();

    var msg, new_item = [],
        fld = document.getElementById(caller.id);

    new_item.cat_id = fld.id.replace('fast_qty_','');
    new_item.base_price_ea = null;
    if (document.getElementById('fast_price_'+new_item.cat_id)) {
        new_item.price = getFieldValue('fast_price_'+new_item.cat_id,true);
        new_item.base_price_ea = getFieldValue('fast_base_price_ea_'+new_item.cat_id,true);
    } else {
        new_item.price = fld.getAttribute('price');
    }
    if (new_item.base_price_ea === null) {
        new_item.base_price_ea = fld.getAttribute('base_price_ea');
    }
    new_item.qty					= getFieldValue(caller,true);
    new_item.amount					= parseFloat(new_item.base_price_ea) * parseInt(new_item.qty);
    new_item.ship_weight 			= fld.getAttribute('ship_weight');
    new_item.min_ship_speed 		= fld.getAttribute('min_ship_speed');
    new_item.taxable 				= fld.getAttribute('taxable');
    new_item.has_wine		 		= fld.getAttribute('has_wine');
    new_item.is_club 				= fld.getAttribute('is_club');
    new_item.is_disc		 		= fld.getAttribute('is_disc');
    new_item.no_discount            = fld.getAttribute('no_discount');
    new_item.free_ok				= fld.getAttribute('free_ok');
    new_item.num_bottles		 	= fld.getAttribute('num_bottles');
    new_item.description		 	= fld.getAttribute('description');
    new_item.catalog_num		 	= fld.getAttribute('catalog_num');
    new_item.cluster				= fld.getAttribute('cluster_name');
    new_item.cluster_id             = fld.getAttribute('cluster_id');
    if (!new_item.cluster_id) {
        new_item.cluster_id         = fld.getAttribute('cluster_id');
    }
    new_item.require_accept_terms	= fld.getAttribute('require_accept_terms');
    new_item.inventory_type			= fld.getAttribute('inventory_type');
    new_item.future_release_date	= fld.getAttribute('future_release_date');
    new_item.sku_type				= fld.getAttribute('sku_type');
    new_item.cat_size_id			= fld.getAttribute('cat_size_id');

    if (new_item.is_disc == '1') {
        new_item.amount = new_item.price;
        new_item.base_price_ea = Math.abs(new_item.amount);
    }

    if (document.getElementById('fast_extra_info_'+new_item.cat_id)) {
        new_item.msg = getFieldValue('fast_extra_info_'+cat_id);
    } else {
        new_item.msg = '';
    }

    if (parseFloat(new_item.amount) > 99999) {
        LZ_alert('Sorry, but the maximum amount for an individual item is $99,999. Please change the quantity ordered to reflect that limit.');
        return false;
    }

    caller.parentNode.parentNode.className = caller.parentNode.parentNode.className.replace(' active','');

    // see if this is a club-only item, and if the Coupon applies to club members
    if (fld.getAttribute('club_only') == '1' && (!Coupon || !Coupon.disc_who || Coupon.disc_who != 'clubs')) {
        LZ_advisory('Sorry, but this item is only available to club members. It has been removed from the cart','fast_list_filter',5000,'error');
        setFieldValue(caller,'0');
    }
    else
    {
        if (isEmpty(new_item.qty)) {
            msg = ' removed from cart';
        } else {
            msg = ' added to cart';
            caller.parentNode.parentNode.className += ' active';
            addItemToCartArray(new_item);
        }

        LZ_advisory(new_item.description + msg, 'fast_list_filter', 600, 'ok');
    }

    cart_displayShoppingCart();
    setFieldValue('fast_list_filter','');
    process_fast_list_filter();
    setCartCookie();
    setTimeout(function () {
            document.getElementById('fast_list_filter').focus();
        },
        1500
    );
}


function cart_AddCartInfoToDOMforPOST () {
    var fld, i, cat_id,
        extra_info = [],
        cartFields = gEBID('cart_fields');
    cartFields.innerHTML = "";
    fld = document.createElement('input');
    fld.type = 'hidden';
    fld.name = 'cart_length';
    fld.value = CartArray.length;
    cartFields.appendChild(fld);
    for (i=0; i<CartArray.length; i++) {
        cartFields.appendChild(createHiddenCartField('cat_id',i));
        cartFields.appendChild(createHiddenCartField('qty',i));
        cartFields.appendChild(createHiddenCartField('price',i));
        cartFields.appendChild(createHiddenCartField('base_price_ea',i));
        cartFields.appendChild(createHiddenCartField('amount',i));
        cartFields.appendChild(createHiddenCartField('description',i));
        cartFields.appendChild(createHiddenCartField('catalog_num',i));
        cartFields.appendChild(createHiddenCartField('cat_size_id',i));
        cartFields.appendChild(createHiddenCartField('msg',i));
        if (!cp_.isEmpty(CartArray[i].msg)) {
            extra_info[extra_info.length] = CartArray[i].catalog_num + ': ' + CartArray[i].msg;
        }
    }
    if (extra_info.length > 0) {
        // XXX RCE -- need to rethink this
        document.getElementById('special_instructions').value += ' {' + extra_info.join('; ') + '}';
    }
    // enable disabled fields so POST will pick them up
    var elements = getFormElements('order_form');
    for (i=0; i<elements.length; i++) {
        elements[i].disabled = false;
    }
}


function cart_removeItemByDomId (caller,call_cart_displayShoppingCart) {

    if (caller && caller.currentTarget) {
        var fld = caller.currentTarget;
    } else
    if (caller && caller.id) {
        fld = caller;
    } else
    if (this) {
        fld = this;
    } else {
        return;
    }
    if (call_cart_displayShoppingCart === undefined) {
        call_cart_displayShoppingCart = true;
    }

    if (fld && fld.id) {
        var cat_id = fld.id.substring(4);
        cart_removeItemByCatId(cat_id);
        if (call_cart_displayShoppingCart) {
            cart_displayShoppingCart();
        }
    }
}


function cart_removeManageOrdersCartItem(caller) {
    // the caller.id is of the form "row_"+cat_id
    if (caller && caller.currentTarget) {
        caller = caller.currentTarget;
    }
    cart_removeItemByCatId(caller.id.replace('row_',''));
    cart_displayManageOrdersCart();
    setDirtyBit();

}


function createHiddenCartField (name,offset) {
    var fld = document.createElement('input');
    fld.type = 'hidden';
    fld.name = name+'_'+offset;
    fld.value = CartArray[offset][name];
    return fld;
}


function clear_ShoppingCartRows () {
    var tbody = gEBID('itemsTable').tBodies[0];
    tbody.innerHTML = '';
}


function display_ShoppingCartRow (row_data, free_str) {
    var td, el, img, fld,
        tbody = gEBID('itemsTable').tBodies[0],
        tr = document.createElement("tr");
    tr.id = 'row_'+row_data.cat_id;

    td = document.createElement("td");
    td.className = 'num_cell qty';
    if (row_data.is_disc != '1') {  // don't display anything if it's a discount
        td.appendChild (document.createTextNode(row_data.qty != 0 ? row_data.qty : '-'));
    }
    tr.appendChild(td);

    td = document.createElement("td");
    el = document.createElement('span');
    el.appendChild(document.createTextNode(row_data.description));
    el.style.textDecoration = 'underline';
    el.ontouchstart = showItemDetails;
    el.onmousedown = showItemDetails;
    el.id = 'cel_'+row_data.cat_id;
    td.appendChild (el);
    if (!cp_.isEmpty(row_data.msg)) {
        td.appendChild(document.createElement("br"));
        td.appendChild(document.createTextNode('('+row_data.msg+')'));
    }
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = 'num_cell amt';
    if (row_data.is_disc != '1'){
        td.appendChild (document.createTextNode((parseFloat(row_data.base_price_ea)===0 && row_data.free_ok=='1' ? free_str : row_data.base_price_ea)));
    }
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = 'num_cell subtotal';
    td.appendChild (document.createTextNode(CommaFormatted((row_data.qty*row_data.base_price_ea*(row_data.is_disc == '1' ? -1 : 1)),false,true)));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = 'flag_taxable';
    td.appendChild (document.createTextNode((row_data.taxable == 1 ? 'T' : '')));
    tr.appendChild(td);

    td = document.createElement("td");
    td.className = 'td_delete_gif';
    td.id = "cat_"+row_data.cat_id;
    td.onclick = cart_removeItemByDomId;
    img = document.createElement("img");
    img.src = "lz_img/btn_delete_x(red).gif";
    td.appendChild(img);
    tr.appendChild(td);

    tbody.appendChild(tr);

    // added 2015-05-16 RCE to load fastPOS too
    fld = document.getElementById('fast_qty_'+row_data.cat_id);
    if (fld) {
        // we've got a winner -- set the values
        setFieldValue('fast_qty_'+row_data.cat_id,row_data.qty);
        setFieldValue('fast_qty_echo_'+row_data.cat_id,row_data.qty);
        setFieldValue('fast_extra_info_'+row_data.cat_id,row_data.msg);
        setFieldValue('fast_price_'+row_data.cat_id,row_data.base_price_ea);
        // also set the className for the containing row
        fld = document.getElementById('cat_'+row_data.cat_id);
        fld.className= fld.className.replace(' active','') + ' active';
    }
}


function display_ShoppingCartTotalsTable (calcs) {
    //
    // display the footer section of the table
    //
    var tFoot = document.getElementById('itemsTable').tFoot,
        i, len = tFoot.rows.length,
        show_tax_row = calcs.salestax > 0 && calcs.totals.bucks != calcs.totals.taxable;

    for (i=0; i<len; i++) {
        tFoot.deleteRow(0);
    }
    var tr, td, span;
    tr = document.createElement("tr");
    tr.className = 'sumTR';
    td = document.createElement("td");
    td.className = 'num_cell subtotal';
    td.colSpan = '3';
    td.appendChild(document.createTextNode("Product Total:"));

    if (show_tax_row) {
        span = document.createElement('span');
        span.className = 'taxable_sub';
        span.appendChild(document.createTextNode('taxable portion:'));
        td.appendChild(span);
    }
    tr.appendChild(td);
    td = document.createElement("td");
    td.className = 'num_cell subtotal subtotal_amt';
    td.appendChild(document.createTextNode(CommaFormatted(calcs.subt_at_products.toFixed(2),true,true)));
    if (show_tax_row) {
        span = document.createElement('span');
        span.className = 'taxable_sub';
        span.appendChild(document.createTextNode(CommaFormatted(calcs.subt_at_taxable_products.toFixed(2),true,true)));
        td.appendChild(span);
    }

    tr.appendChild(td);
    tFoot.appendChild(tr);

    // handle discount(s) on product
    if (calcs.cpn.prod_disc > 0) {
        // 2013-08-12 RCE -- added concept of taxable discount vs non-taxable discount
        tr = document.createElement("tr");
        tr.className = 'sumTR';
        td = document.createElement("td");
        td.className = 'num_cell';
        td.colSpan = '3';
        td.appendChild(document.createTextNode((typeof StoreDiscountPromptStr == 'string' ? StoreDiscountPromptStr : "Product Discount")+':'));
        tr.appendChild(td);
        td = document.createElement("td");
        td.className = 'num_cell';
        td.appendChild(document.createTextNode(CommaFormatted(-calcs.cpn.prod_disc.toFixed(2),true,true)));
        tr.appendChild(td);
        tFoot.appendChild(tr);

        tr = document.createElement("tr");
        tr.className = 'sumTR';
        td = document.createElement("td");
        td.className = 'num_cell subtotal';
        td.colSpan = '3';
        td.appendChild(document.createTextNode("Subtotal:"));
        if (show_tax_row) {
            span = document.createElement('span');
            span.className = 'taxable_sub';
            span.appendChild(document.createTextNode('taxable portion'));
            td.appendChild(span);
        }
        tr.appendChild(td);
        td = document.createElement("td");
        td.className = 'num_cell subtotal subtotal_amt';
        td.appendChild(document.createTextNode(CommaFormatted(calcs.subt_at_coupon.toFixed(2),true,true)));
        if (show_tax_row) {
            span = document.createElement('span');
            span.className = 'taxable_sub';
            span.appendChild(document.createTextNode(CommaFormatted(calcs.subt_at_taxable_coupon.toFixed(2),true,true)));
            td.appendChild(span);
        }
        tr.appendChild(td);
        tFoot.appendChild(tr);

    }

    /* 2013-08-12 RCE -- gift certificates deprecated (at least for a while)
     var gc_balance = document.getElementById('gc_balance').value;
     if (!cp_.isEmpty(gc_balance) && parseFloat(gc_balance) !== 0) {
     var useable_gc_val = Math.min(grandTotal,gc_balance);
     tr = document.createElement("tr");
     tr.className = 'sumTR';
     td = document.createElement("td");
     td.className = 'num_cell';
     td.colSpan = '3';
     td.appendChild(document.createTextNode("Gift certificate:"));
     if (gc_balance != useable_gc_val) {
     td.appendChild(document.createElement('br'));
     var span = document.createElement("span");
     span.style.fontSize = '8px';;
     span.appendChild(document.createTextNode("("+CommaFormatted(useable_gc_val,true,true)+" of "+CommaFormatted(gc_balance,true,true)+" applied)"));
     td.appendChild(span);
     }
     tr.appendChild(td);
     td = document.createElement("td");
     td.className = 'num_cell';
     td.appendChild(document.createTextNode(CommaFormatted(-useable_gc_val.toFixed(2),true,true)));
     tr.appendChild(td);
     tFoot.appendChild(tr);

     subtotal -= useable_gc_val;
     tr = document.createElement("tr");
     tr.className = 'sumTR';
     td = document.createElement("td");
     td.className = 'num_cell';
     td.colSpan = '3';
     td.appendChild(document.createTextNode("Subtotal:"));
     tr.appendChild(td);
     td = document.createElement("td");
     td.className = 'num_cell';
     td.appendChild(document.createTextNode(CommaFormatted(subtotal.toFixed(2),true,true)));
     tr.appendChild(td);
     tFoot.appendChild(tr);

     grandTotal -= useable_gc_val;
     }
     */

    if (CartArray.length > 0) {
        if (beingShipped() && FreightCharge === 0 && (calcs.totals.weight+calcs.totals.bottles > 0) && cp_.isEmpty(getFieldValue('ship_postal'))) {
            if (calcs.subt_at_coupon > 0) {
                tr = document.createElement("tr");
                tr.className = 'sumTR';
                td = document.createElement("td");
                td.className = 'num_cell alert';
                td.colSpan = '4';
                td.appendChild(document.createTextNode("Please set Ship-to Zip on the Checkout tab to calculate shipping and tax"));
                tr.appendChild(td);
                tFoot.appendChild(tr);
            }
        } else
        if (calcs.cart_type == 'normal' && FreightCharge > 0) {
            tr = document.createElement("tr");
            tr.className = 'sumTR';
            td = document.createElement("td");
            td.className = 'num_cell';
            td.colSpan = '3';
            td.appendChild(document.createTextNode(getSelectedOptionInfo('ship_method','text')+" Shipping:"));
            if (calcs.amt_disc_freight !== 0) {
                td.appendChild(document.createElement('br'));
                td.appendChild(document.createTextNode('ShippingDiscount:'));
            }
            tr.appendChild(td);
            td = document.createElement("td");
            td.className = 'num_cell';
            td.appendChild(document.createTextNode(CommaFormatted(FreightCharge.toFixed(2),true,true)));
            if (calcs.amt_disc_freight !== 0) {
                td.appendChild(document.createElement('br'));
                td.appendChild(document.createTextNode(CommaFormatted(calcs.amt_disc_freight.toFixed(2),true,true)));
            }
            tr.appendChild(td);
            if (LastSalestaxData.tax_shipping == 1){
                td = document.createElement('td');
                td.className = 'flag_taxable';
                td.appendChild(document.createTextNode('T'));
                if (calcs.amt_disc_freight !== 0) {
                    td.appendChild(document.createElement('br'));
                    td.appendChild(document.createTextNode('T'));
                }
                tr.appendChild(td);
            }
            tFoot.appendChild(tr);
        }

        // time for a subtotal to clarify things, if it has changed from the last one
        if (FreightCharge > 0) {
            tr = document.createElement("tr");
            tr.className = 'sumTR';
            td = document.createElement("td");
            td.className = 'num_cell subtotal';
            td.colSpan = '3';
            show_tax_row = LastSalestaxData.tax_shipping == '1';
            td.appendChild(document.createTextNode("Subtotal:"));
            if (show_tax_row) {
                span = document.createElement('span');
                span.className = 'taxable_sub';
                span.appendChild(document.createTextNode('taxable portion:'));
                td.appendChild(span);
            }
            tr.appendChild(td);
            td = document.createElement("td");
            td.className = 'num_cell subtotal subtotal_amt';
            td.appendChild(document.createTextNode(CommaFormatted(calcs.subt_at_freight.toFixed(2),true,true)));
            if (show_tax_row) {
                span = document.createElement('span');
                span.className = 'taxable_sub';
                span.appendChild(document.createTextNode(CommaFormatted(calcs.subt_at_taxable_freight.toFixed(2),true,true)));
                td.appendChild(span);
            }
            tr.appendChild(td);
            tFoot.appendChild(tr);
        }


        // handle sales tax
        if (calcs.salestax > 0) {
            tr = document.createElement("tr");
            tr.className = 'sumTR';
            td = document.createElement("td");
            td.className = 'num_cell';
            td.colSpan = '3';
            td.appendChild(document.createTextNode((calcs.salestax_bundle.taxrate_type == 'flat_rate' ? "State Tax" : "Sales Tax")+" ("+calcs.salestax_bundle.rate+"%):"));
            tr.appendChild(td);
            td = document.createElement("td");
            td.className = 'num_cell';
            td.appendChild(document.createTextNode(CommaFormatted(calcs.salestax,true,true)));
            tr.appendChild(td);
            tFoot.appendChild(tr);
        }

        tr = document.createElement("tr");
        tr.className = 'sumTR';
        td = document.createElement("td");
        td.className = 'num_cell subtotal';
        td.style.fontWeight = 'bold';
        td.colSpan = '3';
        td.appendChild(document.createTextNode("Total Order:"));
        tr.appendChild(td);
        td = document.createElement("td");
        td.className = 'num_cell subtotal subtotal_amt';
        td.style.fontWeight = 'bold';
        td.appendChild(document.createTextNode(CommaFormatted(calcs.grandTotal.toFixed(2),true,true)));
        tr.appendChild(td);
        tFoot.appendChild(tr);
    } else {
        tr = document.createElement("tr");
        tr.className = 'sumTR';
        td = document.createElement("td");
        td.className = 'num_cell';
        td.style.paddingBottom = '20px';
        td.colSpan = '3';
        td.appendChild(document.createTextNode("There are no items in your cart yet"));
        tr.appendChild(td);
        tFoot.appendChild(tr);
    }

}


function clear_ManageOrdersCartRows () {
    var tbody = gEBID('ODT_line_items');
    tbody.innerHTML = '';
}


function display_ManageOrdersCartRow (row_data, confirmed) {
    var is_wizard = (document.getElementById('wizard_tab_div') !== null),
        td, fld, img, el, disable_fld, i, x,
        cat_id = row_data.cat_id,
        tbody = tbody = gEBID('ODT_line_items'),
        tr = document.createElement("div"),
        is_disc = row_data.is_disc == '1';
    tr.id = 'cat_id_'+cat_id;

    // description column
    td = document.createElement("div");
    td.className = "editDescCol";
    td.id = 'item_desc_'+cat_id;
    td.appendChild (document.createTextNode(row_data.description));
    if (row_data.inventory_type == 'assembly' || row_data.inventory_type == 'future') {
        el = document.createElement('div');
        el.className = 'lz_assembly_details_icon';
        el.title = row_data.inventory_type + ' item; click for details';
        el.onclick = function () { showAssemblyDetails(row_data.cat_id); };
        td.appendChild(el);
    }
    // handle size info
    fld = document.createElement('select');
    fld.id = 'cat_size_id_'+cat_id;
    fld.className = 'lz_dropdown cat_size';
    fld.options[0] = new Option('choose...','0');
    fld.onchange = function () {
        setDirtyBit();
        closeCatSelect(cat_id);
    };
    fld.selectedIndex = 0;
    x = 'choose...';
    if (row_data.sku_type == 'other_group') {
        for (i=0; i<row_data.cat_sizes.length; i++) {
            if (row_data.cat_sizes[i].retired == '1') {
                row_data.cat_sizes[i].size_str += ' (retired)';
            } else
            if (row_data.cat_sizes[i].active != '1') {
                row_data.cat_sizes[i].size_str += ' (inactive)';
            }
            fld.options[fld.options.length] = new Option(row_data.cat_sizes[i].size_str,row_data.cat_sizes[i].cat_size_id);
            if (row_data.cat_sizes[i].cat_size_id == row_data.cat_size_id) {
                fld.selectedIndex = i+1;
                x = row_data.cat_sizes[i].size_str;
            }
        }
        td.appendChild(fld);
        el = document.createElement('div');
        el.id = 'cat_size_text_'+cat_id;
        el.className = 'cat_size_text';
        el.title = "click to set color/style/size";
        el.innerHTML = x;
        el.onclick = selectCatSize;
        td.appendChild(el);
    }
    tr.appendChild (td);

    // quantity column; this stores extra info as well
    td = document.createElement("div");
    td.className = "editQtyCol";
    fld = document.createElement("input");
    fld.type = "text";
    fld.id = "item_qty_"+cat_id;
    fld.name = "item_qty_group";	// added 2012-08-27 by RCE to make gathering line items easier
    fld.className = "fld_qty"; // + (confirmed ? " disabled" : "");
    fld.ship_weight = row_data.ship_weight;
    fld.num_bottles = row_data.num_bottles;
    fld.taxable = row_data.taxable;
    fld.is_gift_cert = row_data.is_gift_cert;
    fld.has_wine = row_data.has_wine;
    fld.is_disc = row_data.is_disc;
    fld.is_club = row_data.is_club;
    fld.no_discount = row_data.no_discount;
    fld.inventory_type = row_data.inventory_type;
    fld.future_release_date = row_data.future_release_date;
    fld.cluster = (typeof row_data.cluster_id != 'undefined' ? row_data.cluster_id : row_data.cluster);
    fld.cluster_id = fld.cluster;
    fld.onchange = (is_wizard ? recalc_wizard_line : recalc_line);
    if (is_disc) {
        fld.disabled = true;
        fld.value = '1';
    } else {
        fld.value = row_data.qty;
        fld.disabled = confirmed;
    }
    td.appendChild (fld);
    if (!confirmed) {
        img = document.createElement("img");
        img.id = "row_"+cat_id;
        img.src = "lz_img/btn_delete_x(red).gif";
        img.onclick = cart_removeManageOrdersCartItem;
        td.appendChild(img);
    }
    tr.appendChild (td);

    // list price column
    td = document.createElement("div");
    td.className = "editListCol"; // + (confirmed ? " disabled" : "");
    disable_fld = confirmed || parseInt(getFieldValue('disc_coupon_id'),10) > 0;
    fld = document.createElement("input");
    fld.type = "text";
    fld.id = "item_base_price_ea_"+cat_id;
    fld.className = "fld_list";
    fld.disabled = disable_fld;
    fld.onchange = recalc_line;
    if (is_disc) {
        fld.value = parseFloat(row_data.amount).toFixed(AmtFixedDecimals);
    } else {
        fld.value = (Math.abs(row_data.base_price_ea) * (row_data.is_disc == '1' ? -1 : 1)).toFixed(AmtFixedDecimals);
    }
    td.appendChild (fld);

    td.appendChild(document.createTextNode(' ⋮'));
    fld = document.createElement("input");
    fld.type = "text";
    fld.id = "item_price_"+cat_id;
    fld.className = "fld_net" + (disable_fld ? " disabled" : "");
    fld.onchange = recalc_line;
    fld.disabled = disable_fld;
    fld.value = parseFloat(row_data.price).toFixed(AmtFixedDecimals);
    td.appendChild (fld);

    if (!confirmed && disable_fld) {
        el = document.createElement('div');
        el.className = 'disabled_price_overlay';
        el.onclick = function () {
            showCouponAdvisory('item_desc_'+cat_id);
        };
        td.appendChild(el);
    }

    tr.appendChild (td);
    /*
     // net price column
     td = document.createElement("div");
     td.className = "editNetCol"; // + (confirmed ? " disabled" : "");
     fld = document.createElement("input");
     fld.type = "text";
     fld.id = "item_price_"+cat_id;
     disable_fld = confirmed || getFieldValue('disc_coupon_id') > 0;
     fld.className = "fld_net" + (disable_fld ? " disabled" : "");
     fld.onchange = recalc_line;
     fld.disabled = disable_fld;
     fld.value = row_data.price;
     td.appendChild (fld);
     tr.appendChild (td);
     */
    td = document.createElement("td");
    td.className = "editAmtCol"; // + (confirmed ? " disabled" : "");
    fld = document.createElement("input");
    fld.type = "text";
    fld.id = "item_amt_"+cat_id;
    fld.className = "fld_amt"; // + (confirmed ? " disabled" : "");
    fld.onchange = recalc_line;
    if (!confirmed && is_disc) {
        fld.disabled = false;
    } else {
        fld.disabled = disable_fld;
    }
    if (is_disc) {
        fld.value = parseFloat(row_data.amount).toFixed(2);
    } else {
        fld.value = (Math.abs(row_data.base_price_ea) * row_data.qty).toFixed(2);
    }
    td.appendChild (fld);
    tr.appendChild (td);

    td = document.createElement("td");
    td.className = 'editTaxCol';
    td.appendChild (document.createTextNode(row_data.taxable == '1' ? 'T' : ''));
    tr.appendChild (td);

    tbody.appendChild(tr);
}


function clear_ClubWizardCartRows () {
    var tbody = gEBID('ODT_line_items');
    tbody.innerHTML = '';
}


function display_ClubWizardCartRow (data) {
    var tbody = gEBID('ODT_line_items'),
        tr = document.createElement('div'),
        td, el;

    // description
    td = document.createElement('div');
    td.className = 'editDescCol';
    td.appendChild(document.createTextNode(data.description));
    tr.appendChild(td);
    // qty
    td = document.createElement('div');
    td.className = 'editQtyCol';
    el = document.createElement('input');
    el.type = 'text';
    el.id = 'item_qty_'+data.cat_id;
    el.name = 'item_qty_group';
    el.className = 'fld_qty';
    el.value = data.qty;
    el.onchange = recalc_wizard_line;
    td.appendChild(el);
    tr.appendChild(td);
    // price
    td = document.createElement('div');
    td.className = 'editListCol';
    el = document.createElement('input');
    el.type = 'text';
    el.className = 'fld_list';
    el.id = 'item_base_price_ea_'+data.cat_id;
    el.value = CommaFormatted(data.base_price_ea.toString(),true,false,3);
    td.appendChild(el);
    tr.appendChild(td);
    // total
    td = document.createElement('div');
    td.className = 'editAmtCol';
    el = document.createElement('input');
    el.type = 'text';
    el.className = 'fld_amt';
    el.id = 'item_amt_'+data.cat_id;
    el.value = CommaFormatted(data.amount.toString(),true,false,2);
    td.appendChild(el);
    tr.appendChild(td);
    // taxable
    td = document.createElement('div');
    td.className = 'editTaxCol';
    td.appendChild(document.createTextNode(data.taxable == '1' ? 'T' : ''));
    tr.appendChild(td);

    tbody.appendChild(tr);

}


function clear_MyClubCartRows () {
    var tbody = gEBID('itemsTable').tBodies[0];
    tbody.innerHTML = '';
}


function display_MyClubCartRow (data) {
    var tbody = gEBID('itemsTable').tBodies[0],
        tr, td, el, val;

    tr = document.createElement('tr');
    // qty
    td = document.createElement('td');
    td.className = 'num_cell qty';
    val = (data.qty > 0 ? data.qty : '--');
    td.appendChild(document.createTextNode(val));
    tr.appendChild(td);
    // description
    td = document.createElement('td');
    td.className = 'num_cell desc';
    td.appendChild(document.createTextNode(data.description));
    tr.appendChild(td);
    // price
    td = document.createElement('td');
    td.className = 'num_cell amt';
    val = (data.base_price_ea > 0 ? CommaFormatted(data.base_price_ea,true,true,2) : 'no charge to join');
    td.appendChild(document.createTextNode(val));
    tr.appendChild(td);
    // total
    td = document.createElement('td');
    td.className = 'num_cell subtotal';
    td.appendChild(document.createTextNode(CommaFormatted(data.amount,true,true,2)));
    tr.appendChild(td);
    // taxable
    td = document.createElement('td');
    td.className = 'flag_taxable';
    td.appendChild(document.createTextNode(data.amount == '1' ? 'T' : ''));
    tr.appendChild(td);
    // delete gif
    td = document.createElement('td');
    td.className = 'td_delete_gif';
    el = document.createElement('img');
    el.id = 'cat_'+data.cat_id;
    el.onclick = cart_removeItemByCatId;
    el.src = 'lz_img/btn_delete_x(red).gif';
    el.title = 'click to remove club from cart';
    td.appendChild(el);
    tr.appendChild(td);

    tbody.appendChild(tr);

}


