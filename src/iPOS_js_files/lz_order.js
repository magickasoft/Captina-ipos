//
// Javascript functions for the DaVero order form.
//
//

var Coupon = [];
var FreightCharge = 0,
	QTY_ALERT_SHOWN = false,
	TOTAL_ITEM_QTY=0, QTY_AlERT_SHOWN=false,
	CustFields = ["vip_id","bill_email","bill_name","bill_addr1","bill_addr2","bill_city","bill_postal","bill_phone","bill_dob",
		"ship_name","ship_addr1","ship_addr2","ship_city","ship_postal","ship_phone","cc_num","bill_state","ship_state","ship_dob",
		"cc_exp_mo","cc_exp_yr"],
	RequiredFields = ['bill_name','bill_addr1','bill_postal','bill_city','bill_email','bill_phone',
		'ship_name','ship_addr1','ship_postal','ship_city','ship_phone'],
	MayBeBlankIfPrepaid = ['bill_addr1','bill_city','bill_postal','bill_phone','ship_addr1','ship_city','ship_postal','ship_phone'],
// vars to hold prior state so we don't do AjAX calls when not required
	Last_cart_zip = 0,
	Last_cart_weight = 0,
	Last_cart_bottles = 0,
	Last_cart_speed = 0,
	ShipZipHasChanged = true;	// 2015-04-01 RCE -- this is used to determine whether to look for UPS store info or not
	

/**
 *
 * @returns {boolean}
 */
//var ShippingMethods = ['ground','3_day','2_day','next_day'];	// ship_method choices that are actually shipping
function beingShipped() {
	var method = getFieldValue('ship_method');
	return ShippingMethods.indexOf(method) != -1;
}

function beingTaken() {
	var method = getFieldValue('ship_method');
	return method == 'taken';
}

function beingTakenOrPickedUp() {
	var method = getFieldValue('ship_method');
	return (method == 'taken' || method == 'pickup');
}

function prepaidSale (terms) {
	return (terms == 'prepaid' || terms == 'cash' || terms == 'check');
}

/******************************/
var LastSalestaxData = new Object;
LastSalestaxData.zipcode = 0;

function calcSalesTax (state, zipcode, taxable_goods, shipping) {
	var ret = new Object;
	if (!cp_.isEmpty(zipcode) && zipcode.length == 10 && zipcode.search("-") != -1) {
		zipcode = zipcode.substr(0,5);
	}
	if (cp_.isEmpty(zipcode) || (zipcode.length != 5 && zipcode != USE_HQ_STATE) || !customerIsTaxable()) {
		ret.salestax = 0;
		ret.rate = 0;
		return ret;
	}
	if (zipcode != LastSalestaxData.zipcode) {
		LastSalestaxData.zipcode = zipcode;
		ShipZipHasChanged = true;
		var store_id = getFieldValue('store_id'),
			use_store_rate = (beingTakenOrPickedUp() ? 1 : 0),      // added 2015-02-15 RCE -- needed for determining if local
		    url = "/cp/lz_getHTTPrequestData.php?REQ_TYPE=Misc_Action&SUB_TYPE=Misc_GetSalestaxInfo&zipcode="+zipcode+
			"&state="+state+"&store_id="+store_id+"&use_store_rate="+use_store_rate,
            json = ajaxSynchronousGET(url);
		if (json.result == 'FAIL') {
			LZ_alert("Sorry, but there was an error calculating the sales tax rates for this order.");
			ret.rate = -1;
			return ret;
		}
		// good to go; now store and calculate
		var i, flds = ['taxrate_type','taxrate_state','taxrate_county','taxrate_city','taxrate_special'];
		for (i=0; i<flds.length; i++) {
			setFieldValue(flds[i],json[flds[i]]);
			LastSalestaxData[flds[i]] = json[flds[i]];
		}
		LastSalestaxData.rate = parseFloat(json.rate);
		LastSalestaxData.tax_shipping = json.tax_shipping;
        LastSalestaxData.taxrate_type = json.taxrate_type;
		setFieldValue('frt_taxable',json.tax_shipping);
		setFieldValue('taxrate',json.rate);
		// TODO: add handling for special wine taxation case
		// deal with UPS Stores data

	}
	// now we have our tax data, so calculate away
	ret.salestax = parseFloat(((taxable_goods + (LastSalestaxData.tax_shipping == '1' ? Math.max(shipping,0) : 0)) * LastSalestaxData.rate / 100).toFixed(2));
	ret.rate = LastSalestaxData.rate;
	ret.taxrate_type = LastSalestaxData.taxrate_type;

	return ret;
}


function calcTaxForState (state, taxable) {
	var i, salestax_rate, salestax = 0;
	if (customerIsTaxable()) for (i=0; i<SalesTaxesJSON.length; i++) {
		if (state == SalesTaxesJSON[i].abbr) {
			salestax_rate = SalesTaxesJSON[i].tax_rate;
			salestax = parseFloat((taxable * salestax_rate / 100).toFixed(2));	// percentage
			break;
		}
	}
	return salestax;
}


function customerIsTaxable () {
	var tax_exempt = document.getElementById('tax_exempt');
	if (!tax_exempt || parseInt(tax_exempt.value,10) === 0) {
		return true;
	}
	return false;
}

/******************************/
function calculateShipping (speed,weight,zip,bottles,cartArray) {
	if (weight+bottles === 0 || cp_.isEmpty(zip)) {
		// nothing to ship, or nowhere to ship it? Bail.
		SetUPSstoreOptions(null);
		return 0;
	}
	// XXX RCE -- look at this
	if (typeof CartArray == 'undefined') {
        alert ("CartArray undefined in calculateShipping");
        return 0;
	}
	var cart_string,
		params,
		ship_hold = getFieldValue('ship_hold'),
		ship_country = getFieldValue('ship_country'),
		ship_method = getFieldValue('ship_method'),
		url = "/cp/lz_getHTTPrequestData.php",
		json;
	if (ship_country === null) {
		ship_country = 'US';
	}
	if (ship_hold !== null && ship_hold == 'date') {
		return 0;
	}
	if (/^\d{5}(-\d{4})?$/.test(zip) === false && ship_country == 'US') {
		// foreign zip but country not set
		LZ_alert('<p>"'+zip+'" is not a US zipcode.</p><p>Please select the appropriate country.</p>','ship_country');
		return -1;
	}
	LZ_waiting("Calculating shipping...");

	FreightCharge = -1;
	cart_string = JSON.stringify(CartArray);
	//AjaxObj.onreadystatechange = calculateFreight;
	params = "REQ_TYPE=Shipping_Action&SUB_TYPE=Shipping_GetRates"+
		"&WT="+weight+"&ZIP="+zip+
		"&SPEED="+speed+"&BOTTLES="+bottles+
		"&COUNTRY="+ship_country+
		"&UPS_STORES="+(ShipZipHasChanged ? 'Y' : 'N')+
		"&CART_ARRAY="+cart_string;
	// next step won't execute until a response comes back
	json = ajaxSynchronousPOST(url,params);
	LZ_close_waiting();

	if (json.result == "Failure") {
		LZ_alert("Sorry, but there was a problem calculating the shipping charges:"+
			"<p style='border: 2px solid #07334C;font-size: 13px;font-weight: bold;line-height: 1.5em;margin: 7px 15px;padding: 4px 10px;text-align: left;'>" +
			json.error+"</p>"+
			"<p style='text-align: left;'>Please check the shipping address and zip code to be sure they are correct."+
			"<br />If you believe you have gotten this in error, please call us at "+ORDER_PHONE+" with your order.<br />Thanks, and sorry for the inconvenience.</p>",
			'ship_method','','wide_alert');
		return -1;
	}
	if (typeof json.rate == 'undefined') {
		LZ_alert('<p>Sorry, but shipping charges could not be calculated.<p>We will calculate them for you after we receive your order and get back to you.');
		return -1;
	}
	if (typeof json.ups_options != 'undefined' && ShipZipHasChanged) {
		SetUPSstoreOptions(json.ups_options);
	}
	ShipZipHasChanged = false;
	if (json.ship_method != speed) {
		if (ship_method !== null) {
			setFieldValue('ship_method',json.ship_method);
			LZ_alert("Note: "+speed+" shipping is not available to this destination at this time; your shipping has been set to "+json.ship_meth+" and charges have been calculated accordingly.");
		}
	}
	if (json.ship_method == 'groundTC') {
		setFieldValue('ship_hold','heat');
		setFieldValue('ship_hold_date',json.ship_hold_date);
	}
	// 2016-04-22 RCE -- double-counting: return (HandlingCharge !== undefined ? HandlingCharge : 0) +parseFloat(json.rate);
	return parseFloat(json.rate);
}


function checkDOB (field) {
	var val = getFieldValue(field);
	if (!checkDate(field)) {
		showStoreTab('payment');
		return false;
	}
	if (val > LegalAgeDate) {
		LZ_alert('<p>Sorry, but the law requires that both buyer and recipient be over 21 in order to ship wine."+' +
			'<p>Please either remove the wine from your cart or make sure that both parties are over 21.',field);
		showStoreTab('payment');
		return false;
	}
	return true;
}


var poboxPattern = /(p\.?\s?o\.?\s?b\.?(ox)?(\s|[0-9])|post\soffice)/i; // from http://forrst.com/posts/Regular_Expression_to_identify_a_PO_Box-uG6
function checkShipAddr (field) {
	var fieldVal = getFieldValue(field),   // works with either string or object as parameter
		hasPO = poboxPattern.test(fieldVal);
	if (!POBoxOK && hasPO /*field.value.search(/box/i) != -1*/ ) {
		LZ_alert("Note: This appears to be a PO box, and we cannot ship to a PO Box. Please be sure to provide a physical address for delivery.",field);
		return false;
	}
	return true;
}


function noWineStateCheck (state_fld) {
	if (typeof state_fld == 'undefined') {
		state_fld = 'ship_state';
	}
	var state = getFieldValue(state_fld);
	for (var i=0; i<NoWineStates.length; i++) {
		if (NoWineStates[i].abbr == state) {
			LZ_alert("<p>Sorry, but local laws do not allow us to ship wine to "+NoWineStates[i].name+
				".<p>Please either remove the wine from your order, or select a different shipping address.",state_fld,'','error');
			return false;
		}
	}
	return true;
}


function setCompany () {
	var comp_id = getFieldValue("comp_id"),
        reqData = new Object();
	reqData.url = "/cp/lz_getHTTPrequestData.php/?REQ_TYPE=Company_GetCompanyRecord&COMP_ID="+comp_id;
    reqData.method = 'GET';
	if (comp_id == "0") {
		LZ_advisory("Please choose a valid company",'bill_company');
		return false;
	}
	ajaxRequest(reqData,setCompany_ajaxReturn);
}
function setCompany_ajaxReturn (ajax) {
	var setCompanyFields = ["bill_company","bill_name","co_type","distrib_id","distributor","bill_addr1","bill_addr2","bill_city","bill_state","bill_postal","bill_phone","bill_email",
			"ship_company","ship_name","ship_addr1","ship_addr2","ship_city","ship_state","ship_postal","ship_phone",
			"sales_rep","terms","cc_num","cc_exp_mo","cc_exp_yr","store_id","tax_exempt"],
		i,
		json = parseAjaxReturn(ajax);

	for (i=0; i<setCompanyFields.length; i++) {
		setFieldValue(setCompanyFields[i],json[setCompanyFields[i]]);
	}
	setFieldValue('ship_method',json.ship_default);
	setFieldValue('bill_state_echo',json.bill_state);
	setFieldValue('bill_city_echo',json.bill_city);
	setFieldValue('ship_state_echo',json.ship_state);
	setFieldValue('ship_city_echo',json.ship_city);
	// for calls from lz_manage_orders.js
	if (setOrderTypeFields) {
		setOrderTypeFields();
		changeTerms();
	}
}


function setPrice () {
	var qty = parseInt(getFieldValue("qty_0"),10),
		cat_id = getFieldValue('cat_id'),
		disc_flag = getFieldValue('is_disc') == '1' ? -1 : 1,
		item_price = getFieldValue('item_price',true),
		accept_terms_div = gEBID('accept_terms_div');

	setElementStyle('item_savings','display','none');
	if (qty === 0 || cat_id === 0) {
		setFieldValue('amt_0',"0.00");
		return;
	}
	if (item_price === null) {
		item_price = getFieldValue('itemPrice',true);
	}
	var price_each = Math.abs(parseFloat(item_price)),
		amt = qty * price_each * disc_flag,
		x = amt.toString(),
		y = CommaFormatted(x,true,false);
	setFieldValue('amt_0',y);

	if (accept_terms_div) {
		getFld('itemDetailsDivExtras', 'item_extras').style.display = accept_terms_div.style.display;	// show if checkbox shown; otherwise don't
		setElementStyle('amt_0','textDecoration','none');
	}
}


function btnPlusMinus (which) {
	var val = getFieldValue('qty_0',true);
	switch (which) {
		case 'plus':
			val++;
			break;
		case 6:
			val += 6;
			break;
		case 'zero':
			val = 0;
			break;
		default:
			val--;
	}
	if (val < 0) val = 0;
	setFieldValue('qty0',val);
	setPrice();
}


function ZipLookupAfterFn () {
	if (typeof updateTotal == 'function') {
		updateTotal();
	} else {
		cart_displayShoppingCart();
	}
}


function showTotal () {
	// replaced by calcAndShowShoppingCartTotal()
	LZ_alert('call to showTotal should not happen -- should call cart_displayShoppingCart');
	return false;
	/*
	 CouponIndex = -1;   // assume no coupon

	 var totals = calculateCartTotals(),
	 cpn = totals.coupon_details,
	 grandTotal,
	 outstr = 0,
	 order_total = 0,
	 zip = getFieldValue("ship_postal"),
	 ship_method = getFieldValue('ship_method'),
	 cart_type = gEBID('ship_method').tagName.toLowerCase() == "select" ? 'normal' : 'special',
	 salestax_rate,
	 salestax,
	 taxable_total = 0,
	 salestax_bundle,
	 ship_state = getFieldValue('ship_state_echo');

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

	 grandTotal = displayTotalsTable(totals,cpn,cart_type, amt_disc_freight);

	 document.getElementById("amt_total").value = grandTotal.toFixed(2);
	 if (cart_type == 'normal') {
	 i = CartArray.length;
	 setFieldValue('num_items_in_cart',(typeof i == 'undefined' || i === 0 ? "(empty)" : i == 1 ? "(1 item)" : "("+i+" items)"));

	 // setup date-of-birth fields
	 setElementClassName('bill_dob_row',(totals.has_wine && WineBirthdateRequired==1 ? '' : 'hidden_row'));
	 setElementClassName('ship_dob_row',(beingShipped() && totals.has_wine && WineBirthdateRequired==1 ? '' : 'hidden_row'));
	 }

	 if (totals.has_wine && beingShipped()) {
	 noWineStateCheck();
	 }

	 if (totals.has_futures) {
	 if (totals.has_non_futures) {
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
	 LZ_advisory('There are no futures in the cart. Perhaps you wanted to set a "date" hold?','ship_hold');
	 }
	 }
	 }
	 */
}

/*
 function displayTotalsTable (totals, cpn, cart_type, amt_disc_freight) {
 //
 // display the footer section of the table
 //
 var grandTotal = totals.bucks,
 subtotal = grandTotal,
 tFoot = document.getElementById('itemsTable').tFoot,
 i, len = tFoot.rows.length,
 show_tax_row;
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
 show_tax_row = salestax > 0 && totals.bucks != totals.taxable;
 if (show_tax_row) {
 span = document.createElement('span');
 span.className = 'taxable_sub';
 span.appendChild(document.createTextNode('taxable portion:'));
 td.appendChild(span);
 }
 tr.appendChild(td);
 td = document.createElement("td");
 td.className = 'num_cell subtotal subtotal_amt';
 td.appendChild(document.createTextNode(CommaFormatted(subtotal.toFixed(2),true,true)));
 if (show_tax_row) {
 span = document.createElement('span');
 span.className = 'taxable_sub';
 span.appendChild(document.createTextNode(CommaFormatted(totals.taxable.toFixed(2),true,true)));
 td.appendChild(span);
 }

 tr.appendChild(td);
 tFoot.appendChild(tr);

 // handle discount(s) on product
 if (cpn.prod_disc > 0) {
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
 td.appendChild(document.createTextNode(CommaFormatted(-cpn.prod_disc.toFixed(2),true,true)));
 tr.appendChild(td);
 tFoot.appendChild(tr);

 subtotal -= cpn.prod_disc;
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
 td.appendChild(document.createTextNode(CommaFormatted(subtotal.toFixed(2),true,true)));
 if (show_tax_row) {
 span = document.createElement('span');
 span.className = 'taxable_sub';
 span.appendChild(document.createTextNode(CommaFormatted((totals.taxable-cpn.tax_disc).toFixed(2),true,true)));
 td.appendChild(span);
 }
 tr.appendChild(td);
 tFoot.appendChild(tr);

 grandTotal -= cpn.prod_disc;
 }

 // 2013-08-12 RCE -- gift certificates deprecated (at least for a while)
 if (0) {
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
 }

 if (CartArray.length > 0) {
 if (beingShipped() && FreightCharge === 0 && (totals.weight+totals.bottles > 0) && cp_.isEmpty(getFieldValue('ship_postal'))) {
 if (subtotal > 0) {
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
 if (cart_type == 'normal' && FreightCharge > 0) {
 tr = document.createElement("tr");
 tr.className = 'sumTR';
 td = document.createElement("td");
 td.className = 'num_cell';
 td.colSpan = '3';
 td.appendChild(document.createTextNode(getSelectedOptionInfo('ship_method','text')+" Shipping:"));
 if (amt_disc_freight !== 0) {
 td.appendChild(document.createElement('br'));
 td.appendChild(document.createTextNode('ShippingDiscount:'));
 }
 tr.appendChild(td);
 td = document.createElement("td");
 td.className = 'num_cell';
 td.appendChild(document.createTextNode(CommaFormatted(FreightCharge.toFixed(2),true,true)));
 if (amt_disc_freight !== 0) {
 td.appendChild(document.createElement('br'));
 td.appendChild(document.createTextNode(CommaFormatted(amt_disc_freight.toFixed(2),true,true)));
 }
 tr.appendChild(td);
 if (LastSalestaxData.tax_shipping == 1){
 taxable_total += (FreightCharge - Math.abs(amt_disc_freight));
 td = document.createElement('td');
 td.className = 'flag_taxable';
 td.appendChild(document.createTextNode('T'));
 if (amt_disc_freight !== 0) {
 td.appendChild(document.createElement('br'));
 td.appendChild(document.createTextNode('T'));
 }
 tr.appendChild(td);
 }
 tFoot.appendChild(tr);
 }
 grandTotal += FreightCharge - Math.abs(amt_disc_freight); // 2013-09-21 RCE changed '+' to '-' for amt_disc_freight

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
 td.appendChild(document.createTextNode(CommaFormatted(grandTotal.toFixed(2),true,true)));
 if (show_tax_row) {
 span = document.createElement('span');
 span.className = 'taxable_sub';
 span.appendChild(document.createTextNode(CommaFormatted((totals.taxable-cpn.tax_disc+FreightCharge-Math.abs(amt_disc_freight)).toFixed(2),true,true)));
 td.appendChild(span);
 }
 tr.appendChild(td);
 tFoot.appendChild(tr);
 }


 // handle sales tax
 if (salestax > 0) {
 tr = document.createElement("tr");
 tr.className = 'sumTR';
 td = document.createElement("td");
 td.className = 'num_cell';
 td.colSpan = '3';
 td.appendChild(document.createTextNode((salestax_bundle.taxrate_type == 'flat_rate' ? "State Tax" : "Sales Tax")+" ("+salestax_rate+"%):"));
 tr.appendChild(td);
 td = document.createElement("td");
 td.className = 'num_cell';
 td.appendChild(document.createTextNode(CommaFormatted(salestax,true,true)));
 tr.appendChild(td);
 tFoot.appendChild(tr);
 grandTotal += salestax;
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
 td.appendChild(document.createTextNode(CommaFormatted(grandTotal.toFixed(2),true,true)));
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

 return grandTotal;
 }
 */


function calculateCouponDiscount () {
	// 2015-08 RCE -- recreation of calculateCartCoupon for new discount model
	//  Complete rewrite of approach
	//  Note that, under this approach, all discounts will be calculated based on the
	//  base_price_ea, and will override any changes made manually, **if** a Coupon
	//  exists.
	var ret = new Object,
		i, j, amt, btls, qty, threshold, item_arr, disc_impact,
		qty_min, qty_max, discountable,
		base_dollars = 0,
		matching_dollars = 0,
		base_btls = 0,
		matching_btls = 0,
		product_discount = 0,
		taxable_discount = 0,
		over_threshold = false,
		max_disc = parseFloat(Coupon.disc_max_disc_amount);

	if (typeof Coupon.disc_id == "undefined") {
		for (i=0; i<CartArray.length; i++) {
			CartArray[i].amount = (CartArray[i].qty * CartArray[i].base_price_ea).toFixed(2);
			CartArray[i].price = parseFloat(CartArray[i].base_price_ea).toFixed(3);
		}
		ret.prod_disc = 0;
		ret.tax_disc = 0;
		ret.frt_disc = 0;
		return ret;
	}
	// step 1: establish the baseline for determining discountability
	for (i=0; i<CartArray.length; i++) {
		disc_impact = (CartArray[i].is_disc == '1' ? -1 : 1);
		if (CartArray[i].is_disc != '1') {
			CartArray[i].amount = (CartArray[i].qty * CartArray[i].base_price_ea * disc_impact).toFixed(2);
			CartArray[i].price = parseFloat(CartArray[i].base_price_ea).toFixed(3);
		} else {
			// .amount is already correct
			CartArray[i].price = CartArray[i].amount;
		}
		if (typeof CartArray[i].cluster_id == "undefined" && typeof CartArray[i].cluster !== "undefined") {
			CartArray[i].cluster_id = CartArray[i].cluster;
		}
		item_arr = CartArray[i];    // simplifies the rest of this block

		qty = parseInt(item_arr.qty,10);
		amt = parseFloat(item_arr.amount);
		base_dollars += amt;
		btls = parseInt(item_arr.qty,10) * parseInt(item_arr.num_bottles,10);
		base_btls += btls;
		if ((item_arr.no_discount && item_arr.no_discount == '1')   // don't count no_discount items
			|| (item_arr.is_disc && item_arr.is_disc == '1')        // don't count discounts
			|| item_arr.qty === '0') {                              // don't count zero-amount items
			continue;
		}
		// matching?
		switch (Coupon.disc_span) {
			case 'all':
				// applies to all items
				matching_dollars += amt;
				matching_btls += btls;
				break;
			case 'sections':
				// surround the Cluster ID with 'c' to make search unambiguous (disc_cluster_ids format is "c1c47c13c299c")
				if (Coupon.disc_cluster_ids.search('c'+item_arr.cluster_id+'c') !== -1) {
					matching_dollars += amt;
					matching_btls += btls;
				}
				break;
			case 'products':
				for (j=0; j<Coupon.items.length; j++) {
					if (item_arr.cat_id == Coupon.items[j].cat_id) {
						qty_min = parseInt(Coupon.items[j].qty_min,10);
						qty_max = parseInt(Coupon.items[j].qty_max,10);
						if (qty_min <= qty) {
							if (qty_max > 0 && qty_max < qty) {
								// only include the value of the maximum quantity to which the discount applies
								matching_dollars += parseFloat(qty_max * item_arr.base_price_ea);
								matching_btls += qty_max;
							} else {
								matching_dollars += amt;
								matching_btls += btls;
							}
						}
						break;
					}
				}
				break;
		}
	}

	// next up: see if we're over the threshold for a product discount
	switch (Coupon.disc_threshold_type) {
		case 'dollars':
			// if we're at or over the set minimum, we're good
			over_threshold = (matching_dollars >= parseFloat(Coupon.disc_threshold));
			break;
		case 'bottles':
			// are we over the minimum?
			threshold = parseInt(Coupon.disc_threshold,10);
			if (matching_btls >= threshold) {
				// candidate; see if there's a hard increment
				if (threshold > 0 && Coupon.disc_threshold_hard_incr == 1) {
					// yes -- are we on it?
					if (matching_btls % threshold > 0) {
						// not on a threshold; bail.
						break;
					}
				}
				over_threshold = true;
			}
			break;
		case 'none':
		default:
			over_threshold = true;
			break;
	}
	// now we know if we're over the threshold; if so, calculate the discount
	if (over_threshold) {
		switch (Coupon.disc_type) {
			case 'pct':
				product_discount = matching_dollars * parseFloat(Coupon.disc_rate)/100;
				break;
			case 'amt':
				product_discount = parseFloat(Coupon.disc_rate);
				break;
		}
		if (max_disc > 0 && product_discount > max_disc) {
			product_discount = max_disc;
		}
	}
	if (product_discount > 0) {
		// now allocate the discount
		for (i=0; i<CartArray.length; i++) {
			item_arr = CartArray[i];
			if ((item_arr.no_discount && item_arr.no_discount == '1')   // don't discount no_discount items
				|| (item_arr.is_disc && item_arr.is_disc == '1')        // don't discount discounts
				|| item_arr.qty === '0') {                              // don't discount zero-amount items
				continue;
			}
			discountable = true;
			switch (Coupon.disc_span) {
				case 'sections':
					if (Coupon.disc_cluster_ids.search('c'+item_arr.cluster_id+'c') == -1) {
						// not in this section
						discountable = false;
					}
					break;
				case 'products':
					discountable = false;
					for (j=0; j<Coupon.items.length; j++) {
						if (item_arr.cat_id == Coupon.items[j].cat_id) {
							discountable = true;
							break;
						}
					}
					break;
				case 'all':
				// nothing to do
			}
			if (discountable == true) {
				// apply this one's pro-rata share of the discount
				amt = item_arr.amount;
				item_arr.amount = (amt - (product_discount * amt/matching_dollars)).toFixed(2);
				item_arr.price = (parseFloat(item_arr.amount) / parseFloat(item_arr.qty)).toFixed(3);
				if (item_arr.taxable == '1') {
					taxable_discount += amt - item_arr.amount;
				}
			}
		}
	}

	// now handle freight discounts
	// now freight
	// it could be either dollar-amount based or number-of-bottles based, and either against the whole order or just
	// the matching goods
	var test_val = 0, test_base,
		frt_disc = 0;
	over_threshold = false;
	if (Coupon.disc_frt_type != 'none') {
		switch (Coupon.disc_frt_threshold_basis) {
			case 'amt_all':
				test_base = parseFloat(Coupon.disc_frt_threshold);
				test_val = base_dollars;
				break;
			case 'amt_match':
				test_val = matching_dollars;
				test_base = parseFloat(Coupon.disc_frt_threshold);
				break;
			case 'btls_all':
				test_val = base_btls;
				test_base = parseInt(Coupon.disc_frt_threshold, 10);
				break;
			case 'btls_match':
				test_val = matching_btls;
				test_base = parseInt(Coupon.disc_frt_threshold, 10);
				break;
			default:
				test_base = 0;
				break;
		}
		over_threshold = (test_val >= test_base);
		if (Coupon.disc_frt_threshold_basis.substring(0, 4) == 'btls' && Coupon.disc_frt_threshold_hard_incr == '1') {
			// this is a hard-increment discount; see if we're at one of those increments
			if (test_val % test_base > 0) {
				over_threshold = false;
			}
		}
		if (over_threshold == true) {
			// make sure it applies to the selected method
			var method = getFieldValue('ship_method');
			// if the shipping method is in the applies-to field, we're in business.
			if (Coupon.disc_frt_applies_to.search(method) != -1) {
				frt_disc = parseFloat(Coupon.disc_frt_amount);
				if (Coupon.disc_frt_type == 'flat_rate') {
					frt_disc *= -1;		// reverse to flag flat rate
				}
			}
		}
	}

	// our work here is done
	ret.prod_disc = product_discount;
	ret.tax_disc = taxable_discount;
	ret.frt_disc = frt_disc;
	return ret;
}


function calculateCartTotals () {

	var qty, price, disc_flag, item_arr, i,
		ret = new Object();

	ret.bucks	= 0;
	ret.taxable	= 0;
	ret.weight	= 0;
	ret.bottles	= 0;
	ret.has_wine= false;
	ret.is_club	= false;
	ret.has_futures = false;
	ret.taxable_discount = 0;
	ret.has_non_futures = false;
	ret.future_date_conflict = false;
	ret.future_release_dates = [];
	ret.coupon_details = calculateCouponDiscount();

	TOTAL_ITEM_QTY = 0;

	for (i=0; i<CartArray.length; i++) {
		item_arr = CartArray[i];
		disc_flag = item_arr.is_disc == 1 ? -1 : 1;
		if (item_arr.is_disc == '1') {
			qty = 1;
			price = Math.abs(item_arr.amount);
		} else {
			qty = parseInt(item_arr.qty, 10);
			price = parseFloat(item_arr.base_price_ea); // 2015-08-07 RCE -- changed to base_price_ea from price
		}
		if (item_arr.has_wine == 1) {
			ret.has_wine = true;
		}
		if (item_arr.is_club == 1) {
			ret.is_club = true;
		}
		if (item_arr.inventory_type == 'future') {
			ret.has_futures = true;
			if (ret.future_release_dates.length < 1) {
				ret.future_release_dates[0] = item_arr.future_release_date + " (" + item_arr.description + ")";
			} else
			if (ret.future_release_dates[0].substr(0,7) != item_arr.future_release_date.substr(0,7)) {
				ret.future_release_dates[ret.future_release_dates.length] = item_arr.future_release_date + " (" + item_arr.description + ")";
				ret.future_date_conflict = true;
			}
		} else {
			ret.has_non_futures = true;
		}

		TOTAL_ITEM_QTY += item_arr.is_disc == '1' ? 0 : qty;
		ret.bucks 	+= qty * price * disc_flag;
		ret.weight	+= qty * parseFloat(item_arr.ship_weight);
		ret.bottles	+= qty * parseInt(item_arr.num_bottles,10);
		if (item_arr.taxable == '1') {
			ret.taxable += qty * price * disc_flag;
			ret.taxable_discount += (item_arr.qty * item_arr.base_price_ea) - item_arr.amount;
		}
	}

	return ret; //[bucks,weight,bottles,taxable,qtydisc,has_wine,is_club,multi_btl_amt,has_futures,has_non_futures];
}

function processCouponOnLoad () {
	processCoupon(null);
}
function getCouponFieldValue () {
    return getFieldValue('coupon_code');
}
function setCouponFieldValue () {
    var fld = gEBID('coupon_code');
    if (fld.tagName == 'SELECT') {
        setFieldValue(fld,(Coupon.disc_id ? Coupon.disc_id : 0));
    } else {
        setFieldValue(fld,(Coupon.disc_code ? Coupon.disc_code : ''));
    }
    setFieldValue('disc_coupon_id',(Coupon.disc_id ? Coupon.disc_id : 0));
}


function processCoupon (caller) {
	var value = getCouponFieldValue(),
        reqData = new Object;
	Coupon = [];	// always reset coupon onchange()

	value = value.replace(/["']/g,'');

	// if the coupon field is empty, allow editing if a logged-in user
	if (cp_.isEmpty(value) || value == 'choose...') {
		setItemPriceAmtFieldDisabledStatus(false);
		cart_displayShoppingCart();
		return;
	}
	reqData.url="/cp/lz_getHTTPrequestData.php" +
		"?REQ_TYPE=Promo_GetCouponInfo&NOT_LOGGED_IN=OK&STORE="+StoreID+"&UI="+getFieldValue('order_ui')+"&VIP_ID="+getFieldValue('vip_id');
    if (strvalue(value) == value) {
        reqData.url += "&DISC_ID="+value;    // this is a dropdown, so we know the ID
    } else {
        reqData.url += "&COUPON="+value;   // this is an input field, so we have to search by string
    }
	reqData.method = 'GET';

	LZ_waiting('checking coupon...');
	ajaxRequest(reqData,processCoupon_ajaxReturn);
}
function processCoupon_ajaxReturn (ajax) {
	LZ_close_waiting();
	var json = parseAjaxReturn(ajax);
	setCouponFieldValue();	// assume failure
	if (json.result == 'INVALID') {
		LZ_alert(json.error);
		setItemPriceAmtFieldDisabledStatus(false);
		return false;
	}
	if (json.result != 'OK') {
		LZ_alert('There was an error retrieving the coupon information; the server said:<br />'+json.error);
		setItemPriceAmtFieldDisabledStatus(false);
		return false;
	}
	if (!editingOrder) {
		LZ_alert(json.msg,null,json.disc_displayphrase);
	}
	if (json.catalog_update && json.catalog_update.length > 0) {
		// 2016-05-04 RCE -- mechanism for updating locally-stored copy of catalog
		// the following fields are impacted:
		//	sold_out
		//	w_coupon_str
		//	popup_message
		//	custom_qtys

		/* pseudocode to update the local catalog here
		 var i, j, new_data, item, dropdown, new_el, qty_array, qty_parts;
		 for (i=0; i<json.catalog_update.length; i++) {
		 new_data = json.catalog_update[i];
		 item = pseudocode_pointerToExistingCatalogItemInfo(new_data.cat_id);
		 item.sold_out = new_data.sold_out;
		 item.w_coupon_str = new_data.w_coupon_str;
		 item.popup_message = new_data.popup_message;
		 // custom_qtys requires rebuilding or possibly creating the DOM element
		 if (new_data.custom_qtys) {
		 qty_array = new_data.custom_qtys.split(',');
		 dropdown = document.getElementById(pseudocode_id_mechanism_for_elements+cat_id);
		 if (existing_element.type != 'SELECT') {
		 // if this isn't already a SELECT element, we need to create one
		 new_el = document.createElement('select');
		 new_el.id = pseudocode_id_mechanism_for_elements+cat_id;
		 new_el.name = pseudocode_id_mechanism_for_elements+cat_id;
		 new_el.className = 'dropdown';
		 dropdown = new_el;
		 }
		 dropdown.options.length = 1;	// eliminate all but 0
		 for (j=0; j<qty_array.length; j++) {
		 qty_parts = qty_array[i].split('~');
		 dropdown.options[dropdown.options.length] = new Option(qty_parts[0],qty_parts[1]);
		 }
		 dropdown.selectedIndex = 0;
		 }
		 }
		 */
		json.catalog_update = null;	// prune the data; no longer needed
	}
	setItemPriceAmtFieldDisabledStatus(true);
	Coupon = json;
	setCouponFieldValue();
	editingOrder = false;
	cart_displayShoppingCart();
}


function setItemPriceAmtFieldDisabledStatus (val) {
	if (UserID < 1) {
		val = true;
	}
	gEBID('item_price').disabled = val;
	gEBID('amt_0').disabled = val;
}


function processGiftCertificate (caller) {

	if (caller === undefined || !caller) {
		caller = gEBID('gift_certificate');
	}

	if (cp_.isEmpty(caller.value)) {
		setFieldValue('gc_cert_id',0);
		setFieldValue('gc_balance',0);
		setFieldValue('gc_value',0);
		cart_displayShoppingCart();
		return;
	}
	LZ_waiting('checking gift certificate...');
	caller.value = caller.value.replace(/["']/g,'');
	var reqData = new Object();
    reqData.url="/cp/lz_getHTTPrequestData.php" +
		"?REQ_TYPE=Cert_CheckCertificate&certificate="+caller.value;
    reqData.method = 'GET';
	ajaxRequest(reqData,processGiftCertificate_ajaxReturn);
}
function processGiftCertificate_ajaxReturn (ajax) {
	LZ_close_waiting();
	var json = parseAjaxReturn(ajax);
	if (json.result == "VALID") {
		document.getElementById('gc_cert_id').value = json.cert_id;
		document.getElementById('gc_balance').value = json.gc_balance;
		document.getElementById('gc_value').value = json.gc_value;
		if (editingOrder == false) {
			LZ_alert("Your gift certificate has a value of "+CommaFormatted(json.gc_balance,true,true));
		} else {
			LZ_close_waiting();
			editingOrder = false;
		}
		cart_displayShoppingCart();
	} else {
		LZ_alert(json.err_msg,document.getElementById('gift_certificate'));
	}
}


function copyBillingAddress () {
	var src_fld, dest_fld, flds = ['name','addr1','addr2','city','city_echo','state','state_echo','postal','phone','dob','email','country'];
	copyFieldsAndSetCountry('bill_','ship_',flds);
	FreightCharge = 0;
	cart_displayShoppingCart();
}

function retrieveCardSwipeDataFromServer(swipeId, which) {
	if (cp_.isEmpty(swipeId)) {
		return;
	}
	else {
		LZ_waiting('Retrieving Swiped Card Info ...');
		var url = '/cp/lz_getHTTPrequestData.php',
			params = 'REQ_TYPE=cardSwipe_RetrieveCardData&cardswipe_id=' + swipeId,
			json = ajaxSynchronousPOST(url,params);
		// wait...
		LZ_close_waiting();

		if (json.result != 'OK') {
			LZ_alert("<p>Error fetching CardSwipe data in retrieveCardSwipeDataFromServer! Server said:<p>" + json.error,'','','wide_alert');
			return false;
		}
		if (which == 'cc') {
			setFieldValue('cc_num',json.swipeData);
			parseCreditCard('cc_num',true)
		} else {
			setFieldValue('bill_name',json.swipeData);
			parseDriversLicense('bill_name');
		}
		return json.swipeData;
	}
}


function parseCreditCard(fld_id, emptyOK, maskOK) {
	if (typeof maskOK == 'undefined') {
		maskOK = false;
	}
	var content = getFieldValue(fld_id);
	if (content.substring(0,2) == "%B") {
		// swipe
		var parts = content.split('^'),
			expYr,
			expMo,
			prefix = fld_id.replace('cc_num','');
		setFieldValue(fld_id,parts[0].substr(2));
		expYr = '20' + parts[2].substr(0,2);
		expMo = parts[2].substr(2,2);
		expMo = parseInt(expMo,10);
		setFieldValue(prefix+'cc_exp_yr',expYr);
		setFieldValue(prefix+'cc_exp_mo',expMo);
		var names = trim(parts[1]).split('/');
		setFieldValue(prefix+'bill_name',strToProper(names[1] + ' ' + names[0]));
		CheckCreditCard(fld_id, emptyOK);
		setFocus('cc_cvv');
	} else {
		CheckCreditCard(fld_id, emptyOK, maskOK);
	}
}


function parseDriversLicense (fld_id) {
	var content = getFieldValue(fld_id);
	if (content.charAt(0) == "%") {
		var lines = content.split('?'),
			parts = lines[0].split('^'),
			state = parts[0].substr(1,2),
			city = strToProper(parts[0].substr(3)),
			names = parts[1].split('$'),
			addr = strToProper(parts[2]),
			dob_year = lines[1].substr(21,4),
			dob_day = lines[1].substr(27,2),
			dob_mo = lines[1].substr(25,2),
			prefix = fld_id.replace('bill_name',''),
			name = '',
			i;
		for (i=1; i<names.length; i++) {
			name += names[i] + ' ';
		}
		name += names[0];
		if (dob_mo == '99') {
			dob_mo = lines[1].substr(19,2);
		}
		var dob = dob_year+'-'+dob_mo+'-'+dob_day;
		setFieldValue(fld_id,strToProper(name));
		setFieldValue(prefix+'bill_addr1',addr);
		if (lines[2].length > 5) {
			var zip = lines[2].substr(3,5);
			setFieldValue(prefix+'bill_postal',zip);
			ZipLookup(prefix+'bill_postal',true);
		}
		setFieldValue(prefix+'bill_dob',dob);
		setFocus(prefix+'bill_postal');
	}
}


function strToProper (str) {
	str = str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	str = str.replace("Mcg","McG");
	str = str.replace("Mcc","McC");
	return str;
}


function clearOrderForm () {
	// 2013-10-15 RCE -- empties cart and blanks out all fields
	var i, fld_id, val,
		elements = getFormElements('order_form');
	Coupon = [];
	LastSalestaxData = new Object;
	Last_cart_zip = 0;
	Last_cart_weight = 0;
	Last_cart_bottles = 0;
	Last_cart_speed = 0;
	LastSalestaxData.zipcode = 0;
	FreightCharge = 0;
	for (i=0; i<elements.length; i++) {
		fld_id = elements[i].id;
		if (cp_.isEmpty(fld_id)) {
			fld_id = elements[i].name;
		}
		switch (fld_id) {
			case 'disc_coupon_id':
				val = 0;
				break;
			case 'ship_method':
				val = 'taken';
				break;
			case 'terms':
				val = 'cc';
				break;
			case 'sales_rep':
				val = UserID;
				break;
			case 'bill_country':
			case 'ship_country':
				val = 'US';
				break;
			case 'order_ui':
			case 'inv_loc_id':  // added 2014-03-03 RCE
			case 'store_id':    // added 2014-03-03 RCE
				continue;   // skip these; they are sticky
			default:
				val = '';
		}
		setFieldValue(elements[i],val);
	}
	setElementStyle('crm_menu_ul','display','none');
	var tbody = document.getElementById("itemsTable").tBodies[0];
	tbody.innerHTML = '';
	CartArray = new Object;   // nothing in the cart
	toggleShippingRows();
	toggleCCinfo();
	ZipLookup('bill_postal',true);
	ZipLookup('ship_postal',true);
	cart_displayShoppingCart();
}


var ValidateStep,
	ValidateTimeout,
	ValidateMessage,
	Referrer_warning_given = false;

function validateWebstoreOrder () {

	if (cp_.isEmpty(getFieldValue('ship_name'))) {
		copyBillingAddress();
	}
	LZ_waiting("Validating information...");
	ValidateTimeout = setTimeout(excessiveValidation,7000);
	ValidateStep = 0;	// 0
	if (!v2()) {
		clearTimeout(ValidateTimeout);
		return false;
	}
	ValidateStep++;	// 16
	ValidateMessage = 'checking for valid total amount';
	if (getFieldValue('amt_goods',true) > 99999
		|| getFieldValue('amt_total',true) > 999999
	) {
		LZ_alert('<p>Sorry, but the maximum order amount may not exceed $99,999.'+
			'<p>Please adjust your order and try again, or call us at '+ORDER_PHONE+' to place your order.</p>');
		return false;
	}
    cart_AddCartInfoToDOMforPOST();
	clearTimeout(ValidateTimeout);
	LZ_waiting("Loading order summary...");
	gEBID('order_form').submit();
}


function excessiveValidation () {
	LZ_alert("<p>Sorry, but there seems to be a problem validating your information."+
		"<p>Please double-check your billing and shipping information and try again."+
		"<p>If you have gotten this message more than once, please give us a call at "+ORDER_PHONE+" and we'll take your order."+
		"<p>("+ValidateStep+': '+ValidateMessage+")");
}


function v2 () {
	var ship_method = getFieldValue('ship_method'),
		terms = getFieldValue('terms'),
		prepaid_sale = prepaidSale(terms),
		order_ui = getFieldValue('order_ui'),
		has_club = false,
		msg = '',
		fld, i,
		ref_prompt_val;

	ValidateStep++;	// 1
	if (!CheckEmail('bill_email',false)) {
		// 2015-11-02 RCE -- this test needs to be here as well as on the email field
		return false;
	}
	if (ship_method == -1) {
		// 2015-10-14 RCE -- simply cannot believe this test wasn't in here before!
		LZ_alert('Please select the Shipping method','ship_method');
		return false;
	}
	ValidateMessage = 'looking for club';
	for (i=0; i<CartArray.length; i++) {
		if (CartArray[i].is_club == 1) {
			has_club = true;
			break;
		}
	}

	ValidateStep++;	// 2
	ValidateMessage = 'checking required fields';
	for (i=0; i<RequiredFields.length; i++) {
		// XXX RCE -- needs to be rewritten
		fld = gEBID(RequiredFields[i]);
		if (fld.tagName.toLowerCase() == 'select' && fld.value === 0) {
			if (fld.id.substr(0,4) == "ship" && ship_method == "taken") {
				continue;
			}
			if (fld.id.substr(0,4) == 'bill' && order_ui == 'pos' && terms == 'cc' && fld.id != 'bill_name') {
				continue;	// card-present transaction only needs bill_name
			}
			if (prepaid_sale && MayBeBlankIfPrepaid.indexOf(fld.id) != -1) {
				continue;
			}
			msg = "Please choose a value for this field ("+fld.id+")."
		} else
		if (fld.tagName.toLowerCase() == 'input' && cp_.isEmpty(fld.value)) {
			if (fld.id.substr(0, 4) == "ship" && !has_club && (ship_method == "taken" || ship_method == 'pickup')) {
				fld.value = document.getElementById("bill_"+fld.id.substr(5)).value;
				continue;
			}
			if (fld.id.substr(0, 4) == 'bill' && fld.id != 'bill_email' &&
				(order_ui == 'pos' || ship_method == 'pickup') && terms == 'cc') {
				continue;	// card-present transaction? don't need address info
			}
			if (prepaid_sale) {
				var x = MayBeBlankIfPrepaid.indexOf(fld.id);
				if (x != -1) continue;
			}
			msg = "Sorry, but this field ("+fld.id+") may not be empty.";
		}
		if (msg !== "") {
			showStoreTab('payment');
			LZ_advisory(msg,fld);
			return false;
		}
	}
	if (beingShipped()) {
		// added 2013-12-08 RCE to double-check for PO boxes
		if (!checkShipAddr('ship_addr1')) {
			LZ_close_waiting();
			return false;
		}
		// added 2015-03-16 RCE to double-check address field length
		if (!testCharCount(null,'ship_addr1') ||
			!testCharCount(null,'ship_addr2')) {
			return false;
		}
	}

	// if there is no total, and the discount isn't 100% for everything, then no order has been placed.
	ValidateStep++; // 3
	ValidateMessage = 'checking for empty order';
	var test_total = parseFloat(getFieldValue('amt_total',true));
	if (test_total === 0 && TOTAL_ITEM_QTY === 0) {
		LZ_alert("<p>You appear not to have ordered anything.<p>Please add one or more items to your cart, then try again.");
		showStoreTab('store');
		return (false);
	}

	// check shipping speed
	// grab has_wine and ship_weight at the same time for next check
	ValidateStep++; // 4
	ValidateMessage = 'checking weight';
	var fastest=0,
		min_speed=0,
		no_ship=false,
		no_ship_index = null,
		ship_weight=0,
		ship_bottles= 0,
		has_wine = false,
		is_club=false,
		ship_speed;
	for (i=0; i<CartArray.length; i++) {
		if (CartArray[i]['has_wine'] == 1) {
			has_wine = true;
		}
		if (CartArray[i]['is_club'] == 1) {
			is_club = true;
		}
		if (ShipSpeeds.indexOf(CartArray[i].min_ship_speed) > min_speed) {
			min_speed = ShipSpeeds.indexOf(CartArray[i].min_ship_speed);
			fastest = i;
		}
		if (CartArray[i].min_ship_speed == 'no-ship') {
			no_ship = true;
			no_ship_index = i;
		}
		// TODO: RCE -- what about number of bottles, for that type of freight calc?
		ship_weight += CartArray[i].ship_weight * CartArray[i]['qty'];
	}

	ValidateStep++; // 5
	ValidateMessage = 'checking for appropriate shipping speed';
	ship_speed = ShipSpeeds.indexOf(ship_method);
	if (beingShipped() && ship_speed < min_speed) {
		setFieldValue('ship_method',ShipSpeeds[min_speed]);
		LZ_alert("<p>Sorry, but "+CartArray[fastest].description+" requires "+getShippingMethodDisplayString('ship_method')+" shipping."+
			"<p>The shipping method has been adjusted accordingly, and your cart has been updated to reflect the change.  Please review before proceeding.");
		cart_displayShoppingCart();
		showStoreTab("cart");
		return false;
	}
	// one other test
	if (no_ship && beingShipped()) {
		LZ_alert('<p>Sorry, but '+CartArray[no_ship_index].description+' cannot be shipped.</p>' +
			'<p>Please either remove it from your cart, or change the shipping method.</p>');
		showStoreTab('cart');
		return false;
	}

	if (beingShipped() && FreightCharge == -1) {

		LZ_alert("<p>Sorry, but "+getShippingMethodDisplayString('ship_method')+" is not available to the Shipping destination."+
			"<p>Please choose a different shipping method.",'ship_method','','wide_alert');
		return false;
	}

	ValidateStep++; // 6
	ValidateMessage = 'checking ship-hold status';

	var on_hold = getFieldValue('ship_hold') != 'none';

	ValidateStep++; // 7
	ValidateMessage = 'checking for valid shipping calculation';
	// TODO: RCE -- what about number of bottles, for that type of freight calc?
	if (ship_weight > 0 && FreightCharge <= 0 && beingShipped() && on_hold === false) {
		// hmmm - how did this happen?
		Last_cart_speed = 'pony express';	// force computation of shipping charges
		cart_displayShoppingCart();
		if (FreightCharge <= 0) {
			LZ_alert("<p>The system cannot calculate your shipping charges.<p>Please verify the Ship-to information and try again.",'ship_name','','error');
			return false;
		}
	}

	ValidateStep++; // 8
	ValidateMessage = 'checking for birthdate';
	if (has_wine == true && WineBirthdateRequired == 1) {
		if (!checkDOB('bill_dob') ||
			(beingShipped() && (!checkDOB('ship_dob') || !noWineStateCheck()))
		) {
			return false;
		}
	}

	ValidateStep++; // 9
	ValidateMessage = 'checking that passwords match for a club';
	if (is_club) {
		if (!VerifyPassword('pwd','pwd2',false)) {
			return false;
		}
		setFieldValue('will_pickup_club',getFieldValue('cbx_will_pickup_club'));
	} else {
		setFieldValue('will_pickup_club','no_club');
	}

	ValidateStep++; // 10
	ValidateMessage = 'checking billing phone number';
	if (!beingShipped() && cp_.isEmpty(getFieldValue('bill_phone')) && getFieldValue('ship_phone').length >= 10) {
		setFieldValue('bill_phone',getFieldValue('ship_phone'));
	}
	if (!prepaid_sale && !(order_ui == 'pos' && terms == 'cc') && !CheckPhoneNumber('bill_phone', false)) {
		return false;
	}

	ValidateStep++; // 11
	ValidateMessage = 'checking for UPS Access Points and valid ship_email';
	if (beingShipped() && getFieldValue('ups_location_id') > 0 && !CheckEmail('ship_email',false)) {
		showShipEmailIfAccessPointSelected(gEBID('ship_postal'));
		LZ_alert("<p>Please enter the Recipeint's email address so the UPS Access Point can notify them when their package arrives.",'ship_postal');
		return false;
	}

	ValidateStep++; // 12
	ValidateMessage = 'checking credit card info';
	if (terms == 'cc' || terms == '3rd_pty') {	// validate credit card fields
		if (!CheckCreditCard('cc_num',false)) {  // at this stage, 'empty' is not ok
			return (false);
		}
		if (typeof RequireCVV == 'undefined') {
			var RequireCVV = false;
		}
		var cc_num = getFieldValue('cc_num'),
			cc_cvv = getFieldValue('cc_cvv'),
			cvv_len = cc_cvv.length;
		i = cc_num.charAt(0);
		if ((cvv_len === 0 && RequireCVV == true)
			|| (cvv_len > 0
				&& ((i == '3' && cvv_len != 4)
					|| ((i == '4' || i == '5' || i == '6') && cvv_len != 3)
				)
			)
		) {
			if (i == '3') {
				LZ_advisory("Please enter the 4-digit security code on the front of your credit card.",'cc_cvv');
			} else {
				LZ_advisory("Please enter the 3-digit security code on the back of your credit card.",'cc_cvv');
			}
			return false;
		}
		// Check the expiration date
		var expmo = getFieldValue("cc_exp_mo"),
			expyr = getFieldValue("cc_exp_yr");
		if (expmo === 0 || expyr === 0) {
			LZ_advisory("Please enter your credit card's expiration date.",'cc_exp_mo');
			return (false);
		}
		var now = Today(),
			year = now.getFullYear(),
			month = now.getMonth() + 1;  // 0..11 --> 1..12
		if (year > expyr || (year == expyr && month > expmo)) {
			LZ_advisory("Your credit card appears to be expired.  Please re-check.",'cc_exp_mo');
			return (false);
		}
	}

	// if the customer has ordered only one item, remind them that shipping charges are much lower if they order
	// two or more items
	ValidateStep++;	// 13
	ValidateMessage = 'checking for single item in cart';
	var items=0;
    for (i=0; i<CartArray.length; i++) {
		items += CartArray[i]['qty'];
	}
	if (typeof PromptOnSingleItem == 'undefined') {
		var PromptOnSingleItem = "0";
	}
	if (items == 1 && PromptOnSingleItem == "1" && !QTY_ALERT_SHOWN && !editingOrder) {
		QTY_ALERT_SHOWN = true;
		var alertStr = "You appear to have ordered just a single item.\n" +
			"You can save significantly on shipping costs by ordering a second item.\n\n" +
			"Click OK to proceed with submitting your order, or Cancel to return to the order form";
		if (!confirm(alertStr)) {
			LZ_close_waiting();
			showStoreTab('store');
			return false;
		}
	}

	ValidateStep++;	// 14
	ValidateMessage = 'checking ship-hold date';
	if (beingShipped() && ship_hold == 'date') {
		var ship_hold_date = new Date(getFieldValue('ship_hold_date'));
		var today = Today();
		if (ship_hold_date < today) {
			LZ_advisory('Please choose a hold date that is later than today.','ship_hold_date');
			return false;
		}
	}

	ValidateStep++; // 15
	ValidateMessage = 'checking for referrer';
	if (UserID > 0 && Referrer_prompt != 'never' && !Referrer_warning_given) {
		ref_prompt_val = getFieldValue('ref_combo_id');
		if (ref_prompt_val == -1 && (Referrer_prompt == 'always' || getFieldValue('edit_count',true) === 0)) {
			LZ_alert('Please enter the referral source for this order.','ref_combo_id');
			Referrer_warning_given = true;
			return false;
		}
	}

	return true;
}


function getShippingMethodDisplayString (id) {
	return getSelectedOptionInfo(id,'text');
}

function setDirtyBitExtraFn () {
}

function process_fast_list_filter () {
	var filter = getFieldValue('fast_list_filter');
	if (filter === null) {
		return;
	}
	var filterRegExp = new RegExp(filter,'i'),
		row, desc_cell, section_cell, i,
		rows = getElementsByName('fast_list_row');

	for (i=0; i<rows.length; i++) {
		row = rows[i];
		desc_cell = row.children[1].innerHTML;
		section_cell = row.children[2].innerHTML;
		if (filter.length < 3 || desc_cell.search(filterRegExp) != -1 || section_cell.search(filterRegExp) != -1) {
			setElementStyle(row.id,'display','');
		} else {
			setElementStyle(row.id,'display','none');
		}
	}
}


