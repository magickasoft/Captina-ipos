/*
    RCE 2016-05-07
    Rewrite of cart-handling elements
    Standardizes on global CartArray object as the container
 */

var CartArray = null,           // array that holds the items in the cart
    Free_Item_String = null;    // holds the string to display if an item is free


/*******************************************************************
 ******************      CartArray routines      ********************
 *******************************************************************/

function addItemToCartArray (new_item) {
    var i;

    // make sure that CartArray is initialized
    if (!CartArray || typeof CartArray != "object" || typeof CartArray.length == "undefined") {
        CartArray = [];
    }

    // remove the new item from the CartArray if present
    for (i=0; i<CartArray.length; i++) {
        if (CartArray[i].cat_id == new_item.cat_id) {
            CartArray.splice(i,1);
        }
    }

    // add item to Cart Array
    CartArray[CartArray.length] = new_item;
    // sort CartArray by Description
    CartArray.sort(function (a,b) {
        if (a.description < b.description) {
            return -1;
        }
        if (a.description > b.description) {
            return 1;
        }
        return 0;
    });
}


function cart_removeItemByCatId (cat_id) {
    if (typeof cat_id == 'object') {
        if (cat_id.currentTarget) {
            cat_id = cat_id.currentTarget.cat_id;
        } else {
            cat_id = cat_id.id;
        }
        var parts = cat_id.split('_');
        cat_id = parts[parts.length-1];
    }
    var i;
    for (i=0; i<CartArray.length; i++) {
        if (CartArray[i].cat_id == cat_id) {
            CartArray.splice(i,1);
            break;
        }
    }
}


function loadDefaultFreeItemString () {
    if (Free_Item_String === null) {
        var json = ajaxSynchronousGET("/cp/lz_getHTTPrequestData.php?REQ_TYPE=Misc_GetPref&pref=catalog_free_item_string");
        // wait
        Free_Item_String = json.result == 'FAIL' ? 'free' : json.result;    // FAIL means not found; go with 'free'
    }
    return Free_Item_String;
}


/********************************************************************
 ******************    Shopping Cart routines    ********************
 ********************************************************************/

function cart_displayShoppingCart () {
    // RCE 2016-05-07
    // displays all of the rows of the basic shopping cart (webstore, web POS)
    if (typeof free_str == 'undefined') {
        free_str = loadDefaultFreeItemString();
    }
    var i, row_data;

    // clear table
    clear_ShoppingCartRows();
    if (CartArray === null) {
        return;
    }
    // build new version
    for (i=0; i<CartArray.length; i++) {
        row_data = CartArray[i];
        display_ShoppingCartRow(row_data, free_str);
    }
    // show the totals
    calcAndShowShoppingCartTotal();
}


function calcAndShowShoppingCartTotal () {
    // this routine is purely for calculation
    //  It calls displayShoppingCartTotalsTable() to do the DOM parts
    CouponIndex = -1;   // assume no coupon

    var totals = calculateCartTotals(),
        cpn = totals.coupon_details,
        outstr = 0,
        order_total = 0,
        zip = getFieldValue("ship_postal"),
        ship_method = getFieldValue('ship_method'),
        cart_type = gEBID('ship_method').tagName.toLowerCase() == "select" ? 'normal' : 'special',
        salestax_rate,
        salestax,
        salestax_bundle,
        ship_state = getFieldValue('ship_state_echo'),
        calcs = new Object(),
        i;

    // do we need to calculate freight?
    if (beingShipped()
        && !cp_.isEmpty(zip)
        && (
            totals.weight != Last_cart_weight
            || totals.bottles != Last_cart_bottles
            || zip != Last_cart_zip
            || ship_method != Last_cart_speed
        )
    ) {
        if (!CheckZIP('ship_postal',false)) {
            if (gEBID('payment_tab') !== null) {
                showStoreTab('payment');
            }
            return false;
        }
        FreightCharge = calculateShipping(ship_method,totals.weight,zip,totals.bottles);
    } else
    if (ship_method == "taken" || ship_method == "pickup" || ship_method == 'delivery') {
        FreightCharge = 0;
    }
    Last_cart_weight = totals.weight;
    Last_cart_bottles = totals.bottles;
    Last_cart_zip = zip;

    // calculate sales tax
    if (ship_state === null) {
        ship_state = getFieldValue("ship_state");
    }
    salestax_bundle = calcSalesTax(ship_state,
        (ship_method == 'taken' || ship_method == 'pickup' ? USE_HQ_STATE : zip),
        (totals.taxable-cpn.tax_disc),
        parseFloat(FreightCharge) * (1-cpn.frt_disc/100)
    );
    // XXX RCE 2014-09-27 -- the freight discount is a bug if it is a percent
    salestax = salestax_bundle.salestax;
    salestax_rate = salestax_bundle.rate;

    // Now calculate the grand total & store everything
    if (FreightCharge == -1) {
        order_total = 0;
        outstr = 0;
    } else
    if (cpn.frt_disc < 0) {
        // this is a fixed-rate freight amount
        order_total = totals.bucks - cpn.prod_disc + salestax + parseFloat(FreightCharge) - (parseFloat(FreightCharge) + cpn.frt_disc);
    } else
    {
        order_total = totals.bucks - cpn.prod_disc + salestax + parseFloat(FreightCharge) * (1-cpn.frt_disc/100);
        outstr = order_total.toFixed(2);
    }
    setFieldValue('amt_goods',totals.bucks.toFixed(2));
    setFieldValue('amt_taxable',totals.taxable.toFixed(2));
    setFieldValue('amt_salestax',salestax.toFixed(2));
    setFieldValue('amt_disc_goods',cpn.prod_disc.toFixed(2));
    setFieldValue('amt_disc_goods_taxable',totals.taxable_discount.toFixed(2));

    var amt_disc_freight = 0;
    if (cp_.isEmpty(zip) || FreightCharge == -1) {
        setFieldValue('amt_freight',0);
    } else {
        setFieldValue('amt_freight',FreightCharge);
        if (cpn.frt_disc < 0) {
            amt_disc_freight = -(FreightCharge+cpn.frt_disc);
        } else {
            amt_disc_freight = -FreightCharge * cpn.frt_disc / 100;
        }
        amt_disc_freight = -amt_disc_freight;   // XXX RCE 2014-09-27 -- kludge for testing
    }
    setFieldValue('amt_disc_freight',amt_disc_freight.toFixed(2));
    
    calcs.totals                    = totals;
    calcs.cpn                       = cpn;
    calcs.cart_type                 = cart_type;
    calcs.amt_disc_freight          = amt_disc_freight;
    calcs.salestax                  = salestax;
    calcs.salestax_bundle           = salestax_bundle;
    calcs.subt_at_products          = totals.bucks;
    calcs.subt_at_taxable_products  = totals.taxable;
    calcs.subt_at_coupon            = calcs.subt_at_products - cpn.prod_disc;
    calcs.subt_at_taxable_coupon    = totals.taxable - cpn.tax_disc;
    calcs.subt_at_freight           = calcs.subt_at_coupon + FreightCharge - Math.abs(amt_disc_freight);
    calcs.subt_at_taxable_freight   = totals.taxable - cpn.tax_disc + FreightCharge - Math.abs(amt_disc_freight);
    calcs.grandTotal                = totals.bucks - cpn.prod_disc + FreightCharge - Math.abs(amt_disc_freight) + salestax;

    display_ShoppingCartTotalsTable(calcs);

    document.getElementById("amt_total").value = calcs.grandTotal.toFixed(2);
    if (cart_type == 'normal') {
        i = CartArray.length;
        setFieldValue('num_items_in_cart',(typeof i == 'undefined' || i === 0 ? "(empty)" : i == 1 ? "(1 item)" : "("+i+" items)"));

        // setup date-of-birth fields
        setElementClassName('bill_dob_row',(totals.has_wine && WineBirthdateRequired==1 ? '' : 'hidden_row'));
        setElementClassName('ship_dob_row',(beingShipped() && totals.has_wine && WineBirthdateRequired==1 ? '' : 'hidden_row'));
    }

    if (totals.has_wine == true && beingShipped()) {
        noWineStateCheck();
    }

    if (totals.has_futures == true) {
        if (totals.has_non_futures == true) {
            LZ_alert("The cart has both Futures and other items in it; your order may only contain one or the other.<p>Please correct this.");
            showStoreTab('cart');
            return;
        }
        if (getSelectedRadioValue('terms') !== 'cc') {
            showStoreTab('payment');
            LZ_alert("Because the cart contains one or more Futures, payment must be made by credit card.<p>Please correct this.",'terms');
            setFieldValue('terms','cc');
            return;
        }
        if (totals.future_date_conflict == true) {
            showStoreTab('cart');
            LZ_alert("You have multiple futures in your cart, but they have different release dates:"+
                "<br /><small>"+totals.future_release_dates.join(" / ")+"</small>"+
                "<p>All futures in an order must have the same release Year and Month.<p>Please correct this.");
            return;
        }
        setFieldValue('ship_hold','futures');
        setFieldValue('ship_hold_date',totals.future_release_dates[0].substr(0,10));
    } else {
        var ship_hold = gEBID('ship_hold');
        if (ship_hold) {
            if (getFieldValue(ship_hold) == 'futures') {
                setFieldValue(ship_hold, 'none');
            }
            if (ship_hold.tagName == 'SELECT') {
                setElementStyle('ship_hold_date_div','display','none');
            //    LZ_advisory('There are no futures in the cart. Perhaps you wanted to set a "date" hold?','ship_hold');
            }
        }
    }
}


/********************************************************************
 ***************    Manage Orders Cart routines    ******************
 ********************************************************************/

function cart_displayManageOrdersCart (confirmed) {
    // RCE 2016-05-07
    // displays the rows of the Manage Order cart
    var i, row_data;
    
    if (typeof confirmed == 'undefined' || confirmed === null) {
        confirmed = getFieldValue('order_confirmed') == '1';
    }

    // clear table
    clear_ManageOrdersCartRows();
    if (CartArray !== null) {
        // build new version
        for (i=0; i<CartArray.length; i++) {
            row_data = CartArray[i];
            display_ManageOrdersCartRow(row_data, confirmed);
        }
    }
    // display totals
    showManageOrdersCartTotal();
}


function showManageOrdersCartTotal () {
    if (LoadingOrderForEditing == true) {
        return; // not ready yet
    }
    // this function handles the display of everything below the line items table

    var amt_goods_total = 0,
        amt_goods_taxable = 0,
        amt_disc_total = 0,
        amt_disc_taxable = 0,
        subtotal,
        subtotal_taxable,
        base_amt, row, i,
        use_line_total = false;

    for (i=0; i<CartArray.length; i++) {
        row = CartArray[i];
        base_amt = row.qty*row.base_price_ea;
        if (use_line_total) {
            base_amt = getFieldValue('item_amt_'+row.cat_id,true);
            CartArray[i].amount = base_amt;
            row.amount = base_amt;
        }
        amt_goods_total += base_amt;
        if (row.taxable == '1') {
            amt_goods_taxable += base_amt;
        }
        if (row.amount != base_amt) {
            amt_disc_total += base_amt - row.amount;
            if (row.taxable == '1') {
                amt_disc_taxable += base_amt - row.amount;
            }
        }
    }
    if (getFieldValue('disc_coupon_id') === '0' && amt_disc_total === 0) {
        amt_disc_total = getFieldValue(amt_disc_goods,true);
    }
    setFieldValue('amt_goods',amt_goods_total.toFixed(2));
    setFieldValue('amt_goods_taxable',amt_goods_taxable.toFixed(2));
    subtotal = amt_goods_total;
    subtotal_taxable = amt_goods_taxable;
    setFieldValue('amt_disc_goods',amt_disc_total.toFixed(2));
    setFieldValue('amt_disc_goods_taxable',amt_disc_taxable.toFixed(2));
    subtotal -= amt_disc_total;
    subtotal_taxable -= amt_disc_taxable;
    setFieldValue('amt_subtotal1',subtotal.toFixed(2));
    setFieldValue('amt_subtotal1_taxable',subtotal_taxable.toFixed(2));
    // now deal with Taxable shipping
    if (LastSalestaxData && LastSalestaxData.tax_shipping && LastSalestaxData.tax_shipping == '1') {
        setFieldValue('amt_freight_taxable',getFieldValue('amt_freight',true));
        setFieldValue('amt_disc_freight_taxable',getFieldValue('amt_disc_freight',true));
    } else {
        setFieldValue('amt_freight_taxable','');
        setFieldValue('amt_disc_freight_taxable','');
    }
    // now *pull* the freight amounts, then the freight discount amounts
    subtotal += getFieldValue('amt_freight',true);
    subtotal_taxable += getFieldValue('amt_freight_taxable',true);
    subtotal -= getFieldValue('amt_disc_freight',true);
    subtotal_taxable -= getFieldValue('amt_disc_freight_taxable',true);

    setFieldValue('amt_subtotal2',subtotal.toFixed(2));
    setFieldValue('amt_taxable',subtotal_taxable.toFixed(2));
    // flag sales tax if out of sync
    var st_amt = Math.round(getFieldValue('amt_taxable',true) * getFieldValue('taxrate_full',true))/100,
        st_diff = Math.abs(st_amt - getFieldValue('amt_salestax',true)),
        amt = Math.round(getFieldValue('amt_taxable',true) * getFieldValue('taxrate_full',true))/100,
        amt_fld = document.getElementById('amt_salestax');
    if (st_diff > 0.011) {
        amt_fld.style.color = 'red';
        amt_fld.style.cursor = 'help';
        amt_fld.title = 'The sales tax amount is not consistent with the taxable subtotal and the sales tax rate; '
            +'click the "recalculate" icon if you want to update the sales tax amount.';
    } else {
        amt_fld.style.color = '';
        amt_fld.title = '';
        amt_fld.style.cursor = '';
    }
    subtotal += getFieldValue('amt_salestax',true);
    setFieldValue('amt_total',subtotal.toFixed(2));
    var balance = CommaFormatted(subtotal - getFieldValue('amt_paid',true),true,false,2);
    setFieldValue('order_balance',balance);

    // no return value
}



/**************************************************************
 *************    Club Wizard Cart routines    ****************
 **************************************************************/

function cart_displayClubWizardCart () {
    // clear table
    var subtotal = 0,
        discount = 0,
        cart_total,
        taxable = 0,
        data, i;
    
    clear_ClubWizardCartRows();

    for (i=0; i<CartArray.length; i++) {
        data = CartArray[i];
        display_ClubWizardCartRow(data);
        subtotal += data.qty * data.base_price_ea;
        if (data.taxable == '1') {
            taxable += data.qty * data.base_price_ea;
        }
    }

    // calculate discounts (note that actual, shipment-specific discounts are calculated during order creation)
    var goods_disc_rate = parseFloat(ClubJSON.shipment_goods_disc)/100,
        goods_discount = (-1 * subtotal * goods_disc_rate),
        disc_str = 'discount';
    cart_total = subtotal + goods_discount;
    if (ClubJSON.club_fixed_price == '1') {
        // make sure that the max price isn't exceeded; apply a discount if it is
        var fp_disc = ClubJSON.club_fixed_price_amt - cart_total;
        if (cart_total > 0 && fp_disc < goods_discount) {
            goods_disc_rate = -fp_disc / cart_total;
            goods_discount = fp_disc;
        }
    } else {
        disc_str = ClubJSON.goods_discount_desc;
    }
    if (cart_total < 0) {
        cart_total = 0;
    }
    taxable = taxable * (1-goods_disc_rate);

    display_ClubWizardCartTotals (subtotal, disc_str, goods_discount, cart_total, taxable);

}


function display_ClubWizardCartTotals (subtotal, disc_str, discount, cart_total, taxable) {
    setFieldValue('cart_subtotal',CommaFormatted(subtotal.toString(),true,false,2));
    setFieldValue('goods_discount_desc',disc_str);
    setFieldValue('goods_disc',CommaFormatted(discount.toString(),true,false,2));
    setFieldValue('cart_total',CommaFormatted(cart_total.toString(),true,false,2));
    setFieldValue('taxable_total',CommaFormatted(taxable.toString(),true,false,2));
}



/**************************************************************
 ***************    My Club Cart routines    ******************
 **************************************************************/


function cart_displayMyClubCart () {
    var i, total = 0, taxable = 0, salestax = 0;
    
    clear_MyClubCartRows();
    for (i=0; i<CartArray.length; i++) {
        tbody = display_MyClubCartRow(CartArray[i]);
        total += CartArray[i].amount;
        if (CartArray[i].taxable == '1') {
            taxable += CartArray[i].amount;
        }
    }

    if (taxable > 0) {
        var tax_bndl = calcSalesTax(getFieldValue('ship_state'),getFieldValue('ship_postal'),taxable,0);
        salestax = tax_bndl.salestax;
    }

    display_MyClubCartTotals(total,salestax);
}


function display_MyClubCartTotals (total,salestax) {
    var tfoot = gEBID('itemsTable').tFoot;
    tfoot.innerHTML = '';
    if (salestax > 0) {
        tfoot.appendChild(create_MyClubTotalsRow('Subtotal:',total,'sum_line'));
        tfoot.appendChild(create_MyClubTotalsRow('Salestax:',salestax,''));
    }
    tfoot.appendChild(create_MyClubTotalsRow('Total:',total+salestax,'sum_line'));
}
function create_MyClubTotalsRow(label,amount, amt_class) {
    var tr = document.createElement('tr'),
        td = document.createElement('td');
    tr.className = 'sumTR';
    // label
    td.className = 'num_cell subtotal';
    td.colSpan = '3';
    td.appendChild(document.createTextNode(label));
    tr.appendChild(td);
    // amount
    td = document.createElement('td');
    td.className = 'num_cell subtotal subtotal_amt' + amt_class;
    td.appendChild(document.createTextNode(CommaFormatted(amount,true,true,2)));
    tr.appendChild(td);

    return tr;
}


