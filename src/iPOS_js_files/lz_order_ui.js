/**
 * Created by rce on 5/19/16.
 */

// XXX RCE -- this will need to be done differently for ReactNative
function toggleHelp () {
    var div = document.getElementById('helpDiv');
    div.style.display = (div.style.display == 'block' ? 'none' : 'block');
}

/************** mobile touch input functions ************/
var touchTimer = null;
function one_up () {
    var qty = getFieldValue("qty_0",true);
    qty++;
    setFieldValue('qty_0',qty);
    setPrice();
    touchTimer = setTimeout(one_up,300);
}

function one_down () {
    var qty = getFieldValue("qty_0",true);
    qty = Math.max(0,--qty);
    setFieldValue('qty_0',qty);
    setPrice();
    touchTimer = setTimeout(one_down,300);
}

function stop_touch () {
    clearTimeout(touchTimer);
}

function selQtyChange (caller) {
    if (caller.id) {
        caller = caller.id;
    }
    setFieldValue('qty_0',getFieldValue(caller));
    setPrice();
}


/************* lookup functions ********************/
function addLookupLineItemToCart () {
    setElementStyle('lz_advancedEditMask','display','block');
    setElementStyle('lz_advancedEditMask','zIndex','1000');
    setElementStyle('addItemDiv','display','block');
    setElementStyle('addItemDiv','zIndex','1001');
    setFieldValue('ACitem_cat_id_new','');
    setFocus('ACitem_cat_id_new');
}


function addChosenLineItemToCart (chosenItem) {
    setElementStyle('lz_advancedEditMask','display','none');
    setElementStyle('addItemDiv','display','none');
    showItemDetails(null,parseInt(chosenItem.cat_id,10));
}


function add_item_to_cart() {
    // replaced with the function add_ItemToShoppingCartFromDOM()
    add_ItemToShoppingCartFromDOM();
}


/************* Mobile-chooser functions *************/
function makeClusterChoice () {
    // happens when a user touches/clicks on the clusterChoice_echo div
    setElementStyle('clusterChoice_echo','display','none');
    setElementStyle('clusterChooserDiv','display','block');
}


function switchMobileCluster () {
    var cluster_id = getFieldValue('clusterChoice'),
        txt = getSelectedRadioString('clusterChoice'),
        rows = document.getElementsByName('mobileItemRows'),
        echo = document.getElementById('clusterChoice_echo'),
        i;

    for (i=0; i<rows.length; i++) {
        if (rows[i].getAttribute('cluster') == cluster_id) {
            rows[i].style.display = 'table-row';
        } else {
            rows[i].style.display = '';
        }
    }
    echo.innerHTML = '&#9660; '+txt;
    echo.style.display = '';
    document.getElementById('clusterChooserDiv').style.display = '';
}


function displayMobileItem (cat_id) {
    // grab the item and display it
    // similar in functionality to showItemDetails but not the same
    var ajax = GetXmlHttpObject();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            LZ_close_waiting();
            var json, i, fld, div, cartQty = 0, cartMsg = '';
            json = parseAjaxReturn(ajax);
            if (!json) {
                return;	// unlikely
            }
            if (json.result != 'OK') {
                LZ_alert("<p>Error retrieving product information:<p>"+json.error);
                return;
            }
            setFieldValue('item_image',json.image);
            setFieldValue('item_description',json.description.replace(', ','<br>'));
            setFieldValue('paragraph_wrapper',json.paragraph);
            for (i=1; i<13; i++) {
                fld = document.getElementById('custom_' + i + '_wrapper');
                fld.innerHTML = '';
                if (fld && !cp_.isEmpty(json['custom_' + i])) {
                    if (json['label_' + i]) {
                        div = document.createElement('div');
                        div.className = 'romance_title';
                        div.innerHTML = json['label_' + i];
                        fld.appendChild(div);
                    }
                    div = document.createElement('div');
                    div.className = 'romance_copy';
                    div.innerHTML = json['custom_' + i];
                    fld.appendChild(div);
                }
            }

            // is it already in the cart?

            for (i=0; i<CartArray.length; i++) {
                if (CartArray[i]['cat_id'] == json['cat_id']) {
                    // yup!
                    cartQty = CartArray[i]['qty'];
                    cartMsg = CartArray[i]['msg'];
                    break;
                }
            }

            var qtySel = document.getElementById('item_selectQty_div'),
                qtyInp = document.getElementById('item_qty_div'),
                soldOut = document.getElementById('item_soldout_div'),
                withCpn = document.getElementById('item_with_coupon'),
                addBtn = document.getElementById('mobileAddBtn'),
                sel = document.getElementById('selectQty'),
                first_opt_val = 1,
                opts, price, val, text, parts;
            setFieldValue('qty_0',0);
            setFieldValue('selectQty',0);
            sel.options.length = 1;
            addBtn.style.display = '';
            soldOut.style.display = 'none';
            withCpn.style.display = 'none';
            withCpn.innerHTML = json.w_coupon_str;

            if (json.sold_out > 0) {
                if (json.sold_out == 1) soldOut.style.display = '';
                if (json.sold_out >= 2) withCpn.style.display = '';
                qtySel.style.display = 'none';
                qtyInp.style.display = 'none';
                addBtn.style.display = 'none';
            } else
            if (!cp_.isEmpty(json.custom_qtys)) {
                // custom quantities -- use the dropdown
                qtySel.style.display = '';
                qtyInp.style.display = 'none';
                opts = json['custom_qtys'].split(',');
                first_opt_val = 0;
                for (i=1; i<=opts.length; i++) {
                    if (opts[i-1].search(/~/) == -1) {
                        val = opts[i-1];
                        text = opts[i-1];
                    } else {
                        parts = opts[i-1].split('~');
                        text = parts[0];
                        val =  parts[1];
                    }
                    sel.options[i] = new Option(text,val);
                    if (first_opt_val == 0) {
                        first_opt_val = val;
                    }
                }
                setSelectedOptionByValue(sel,Math.max(first_opt_val,cartQty));
                selQtyChange('selectQty');
            } else
            if (json.has_wine == '1') {
                // use a dropdown if it's wine, or else a standard quantity input
                qtySel.style.display = '';
                qtyInp.style.display = 'none';
                for (i=1; i<=12; i++) {
                    sel.options[i] = new Option(i,i);
                }
                sel.options[i++] = new Option(18,18);
                sel.options[i++] = new Option(24,24);
                sel.options[i++] = new Option(36,36);
                setSelectedOptionByValue(sel,Math.max(first_opt_val,cartQty));
                selQtyChange('selectQty');
            } else {
                // just use a standard input field
                qtySel.style.display = 'none';
                qtyInp.style.display = '';
                setFieldValue('qty_0',cartQty);
            }

            price = (getFieldValue('qty_0',true) * json.price).toFixed(2);


            // set the hidden fields
            setFieldValue('item_price',json.price);
            setFieldValue('base_price_ea',json.price);
            setFieldValue('amt_0',price);
            setFieldValue('catalog_num',json.catalog_num);
            setFieldValue('cat_id',json.cat_id);
            setFieldValue('ship_weight',json.ship_weight);
            setFieldValue('min_ship_speed',json.min_ship_speed);
            setFieldValue('taxable',json.taxable);
            setFieldValue('has_wine',json.has_wine);
            setFieldValue('is_club',json.is_club);
            setFieldValue('is_disc',json.is_disc);
            setFieldValue('free_ok',json.free_ok);
            setFieldValue('no_discount',json.no_discount);
            setFieldValue('num_bottles',json.num_bottles);
            setFieldValue('item_cluster',json.cluster_id);
            setFieldValue('inventory_type',json.inventory_type);
            setFieldValue('future_release_date',json.future_release_date);
            setFieldValue('sku_type',json.sku_type);
            setFieldValue('cat_size_id',json.cat_size_id);

            document.getElementById('mobilePopup').style.display = 'block';

        }
    };
    var url = "/cp/lz_getHTTPrequestData.php?REQ_TYPE=Catalog_Action&SUB_TYPE=Catalog_GetStoreItemDetails&CAT_ID="+cat_id+"&STORE="+StoreID+"&COUPON_ID="+getFieldValue('disc_coupon_id')+"&VIP_ID="+getFieldValue('vip_id');
    ajax.open("GET",url,true);
    ajax.send(null);
    LZ_waiting("retrieving product details...");
}


function showItemDetails (e,caller) {
    // TODO: look for item in array; use that data if already there
    if (e !== null && is_mobileDevice !== undefined && is_mobileDevice && e.touches) {
        if (e.touches.length != 1) return;
    }

    if (typeof caller != "number" && (!caller || !caller.id)) {
        if (this) {
            caller = this;	// coming from shopping cart
        } else {
            return;
        }
    }

    var cat_id;
    if (typeof caller == "number") {	// happens when called via onload function, which passes a cat_id to show
        cat_id = caller;
    }
    else if (caller.id == 'flat_product_select') {
        cat_id = getFieldValue('flat_product_select');
    } else {
        var parts = caller.id.split("_");
        cat_id = parts[1];
    }
    var ajax = GetXmlHttpObject();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            LZ_close_waiting();
            var json, i, fld, div;
            json = parseAjaxReturn(ajax);
            if (!json) {
                return;
            }
            if (json.result != "OK") {
                LZ_alert("<p>Error retrieving product information:<p>"+json.error);
                return false;
            }

            // 2012-12-06 RCE
            //	Added branching code for store type
            //		Traditional store uses a pop-up
            //		"flat" store uses divs w/o pop-up element


            // start with the title of the item
            getFld('itemDetails_heading','item_description').innerHTML 	= json.description;
            // what is the romance model?
            fld = getFld('paragraph','paragraph_wrapper');
            fld.innerHTML = json.paragraph;
            if (fld.id == 'paragraph_wrapper') {
                // there are outer elements
                // the custom fields, if present, get both the title and the copy
                for (i=1; i<13; i++) {
                    fld = getFld('custom_'+i+'_wrapper');
                    fld.innerHTML = '';
                    if (fld && !cp_.isEmpty(json['custom_'+i])) {
                        if (json['label_'+i]) {
                            div = document.createElement('div');
                            div.className = 'romance_title';
                            div.innerHTML = json['label_'+i];
                            fld.appendChild(div);
                        }
                        div = document.createElement('div');
                        div.className = 'romance_copy';
                        div.innerHTML = json['custom_'+i];
                        fld.appendChild(div);
                    }
                }
            } else {
                // old-school
            }


            fld = getFld('itemDetails_packageSize','item_packageSize');
            if (fld) {
                fld.innerHTML= json.package_size;
            }
            getFld('itemPrice','item_price').value  = json.price;
            getFld('base_price_ea').value           = json.price;
            getFld('catalog_num').value 		    = json.catalog_num;
            getFld('cat_id').value 					= json.cat_id;
            getFld('ship_weight').value 			= json.ship_weight;
            getFld('min_ship_speed').value 			= json.min_ship_speed;
            getFld('taxable').value					= json.taxable;
            getFld('has_wine').value 				= json.has_wine;
            getFld('is_club').value 				= json.is_club;
            getFld('is_disc').value                 = json.is_disc;
            getFld('free_ok').value					= json.free_ok;
            getFld('no_discount').value 			= json.no_discount;
            getFld('num_bottles').value 			= json.num_bottles;
            getFld('item_cluster').value			= json.cluster_id;
            getFld('inventory_type').value			= json.inventory_type;
            getFld('future_release_date').value		= json.future_release_date;
            getFld('sku_type').value				= json.sku_type;
            getFld('itemDetails_with_coupon','item_with_coupon').innerHTML= json.w_coupon_str;
            fld = getFld('itemDetails_image','item_image');
            if (fld.tagName == 'IMG') {
                fld.src = json.image;
            } else {
                fld.style.backgroundImage = 'url("'+json.image+'")';
            }

            // do we need to show the 'accept terms' checkbox?
            var accept_terms_div = getFld('accept_terms_div');
            var extras_div = getFld('itemDetailsDivExtras','item_extras');
            var item_inputs = getFld('itemDetails_inputs','item_inputs');
            var accept_terms_cbx = getFld('accept_terms_cbx');
            // set normal states
            accept_terms_div.style.display = 'none';
            extras_div.style.display = 'none';
            extras_div.className = null;
            item_inputs.style.display = '';
            accept_terms_cbx.onclick = null;
            if (json.is_club == 1 && document.getElementById('require_accept_terms').value == '1') {
                accept_terms_div.style.display = 'block';
                extras_div.style.display = 'block';
                document.getElementById('accept_terms_cbx').checked = false;
                // is this a pay-as-you-go club?  if so, don't display the normal check-out stuff
                if (parseFloat(json.price) === 0) {
                    item_inputs.style.display = 'none';
                    accept_terms_cbx.onclick = add_item_to_cart;
                    extras_div.className = 'zero_dollar_club';
                }
            }

            // is it already in the cart?
            var cartQty = 0, cartMsg = '', cartSize = 0;
            for (i=0; i<CartArray.length; i++) {
                if (CartArray[i]['cat_id'] == json['cat_id']) {
                    // yup!
                    cartQty = CartArray[i].qty;
                    cartMsg = CartArray[i].msg;
                    cartSize= CartArray[i].cat_size_id;
                    break;
                }
            }

            // deal with size options
            setupCatSize(json.cat_sizes,json.sku_type,cartSize);


            // is there a spec sheet available for downloading?
            getFld('specsheet_available').style.display = cp_.isEmpty(json['pdf_filename']) ? 'none' : 'block';

            // handle popup message
            document.getElementById('extra_info_msg').value = '';
            var romance = getFld('itemDetails_romance','item_romance');
            romance.className = '';
            if (cp_.isEmpty(json.popup_message)) {
                document.getElementById('extra_info_div').style.display = 'none';
            } else {
                document.getElementById('extra_info_div').style.display = 'block';
                var extra_info_msg = document.getElementById('extra_info_msg'),
                    extra_info_prompt = document.getElementById('extra_info_prompt');
                if (json.sku_type == 'other_group') {
                    document.getElementById('extra_info_msg').style.display = 'none';
                    extra_info_prompt.innerHTML = json.popup_message;
                } else {
                    document.getElementById('extra_info_msg').value = cartMsg;
                    romance.className = 'has_extra' + (is_mobileDevice ? ' mobile' : '');
                    if (typeof extra_info_msg.placeholder != 'undefined') {
                        extra_info_msg.placeholder = json.popup_message;
                        extra_info_prompt.style.display = 'none';
                    } else {
                        extra_info_prompt.innerHTML = json.popup_message;
                        extra_info_prompt.style.display = '';
                    }
                }
            }

            var sel = document.getElementById('selectQty');
            sel.options.length = 1;
            /*
             for (i=sel.options.length; i>=0; i--) {
             sel.options[i] = null;
             }
             */

            setFieldValue('qty_0','');
            var qtySel = getFld('itemDetails_selectQty','item_selectQty_div'),
                qtyInp = getFld('itemDetails_qty','item_qty_div'),
                qtyUpDn= getFld('itemDetails_up_down_scroll','item_up_down_scroll'),
                qtyS_O = getFld('itemDetails_soldout','item_soldout'),
                qtyW_C = getFld('itemDetails_with_coupon','item_with_coupon'),
                amtFld = document.getElementById('amt_0'),
                qtyBtn = getFld('itemDetails_action','item_action'),
                addBtn = getFld('itemDetails_add_btn','item_add_btn');

            var focus_fld = null;
            if (json.sold_out > 0) {
                qtyS_O.style.display = json.sold_out == 1 ? 'block' : 'none';
                qtyW_C.style.display = json.sold_out >= 2 ? 'block' : 'none';
                qtyBtn.style.display = 'none';
                qtySel.style.display = 'none';
                qtyInp.style.display = 'none';
                if (qtyUpDn !== null) qtyUpDn.style.display ='none';
                if (addBtn !== null)  addBtn.style.display = 'none';
            } else {
                qtyBtn.style.display = 'inline';
                qtyS_O.style.display = 'none';
                qtyW_C.style.display = 'none';
                amtFld.disabled = true;
                if (addBtn !== null) addBtn.style.display = '';
                if (json.is_disc == '1') {
                    setFieldValue('qty_0','1');
                    qtyInp.style.display = 'none';
                    qtySel.style.display = 'none';
                    qtyUpDn.style.display = 'none';
                }
                else
                if (cp_.isEmpty(json['custom_qtys'])) {
                    var qty = document.getElementById('qty_0');
                    qty.value = Math.max((is_mobilePOS == true ? 0 : 1),cartQty);
                    focus_fld = qty;
                    qtyInp.style.display = 'inline';
                    if (qtyUpDn !== null) qtyUpDn.style.display = (is_mobileDevice == true ? '' : 'none');
                    qtySel.style.display = 'none';
                } else {
                    var val,text,parts;
                    sel.options[0] = new Option('--',0);
                    var opts = json['custom_qtys'].split(','),
                        first_opt_val = 0;
                    for (i=1; i<=opts.length; i++) {
                        if (opts[i-1].search(/~/) == -1) {
                            val = opts[i-1];
                            text = opts[i-1];
                        } else {
                            parts = opts[i-1].split('~');
                            text = parts[0];
                            val =  parts[1];
                        }
                        sel.options[i] = new Option(text,val);
                        if (first_opt_val == 0) {
                            first_opt_val = val;
                        }
                    }
                    setSelectedOptionByValue(sel,Math.max(first_opt_val,cartQty));
                    getFld('qty_0').value = first_opt_val;
                    focus_fld = sel;
                    qtyInp.style.display = 'none';
                    if (qtyUpDn !== null) qtyUpDn.style.display ='none';
                    qtySel.style.display = 'inline';
                }
                setPrice();
            }

            if (typeof StoreModel == 'undefined' || StoreModel === null || StoreModel == 'full' || document.getElementById('itemDetailsDiv') !== null) {
                var details = document.getElementById('itemDetailsDiv');
                var mask = document.getElementById('lz_editContainerMask');
                mask.style.display = 'block';
                details.style.display = 'block';
                // test portal height
                // from http://www.javascripter.net/faq/browserw.htm
                var winW = 630, winH = 460;
                if (document.body && document.body.offsetWidth) {
                    winW = document.body.offsetWidth;
                    winH = document.body.offsetHeight;
                }
                if (document.compatMode=='CSS1Compat' &&
                    document.documentElement &&
                    document.documentElement.offsetWidth ) {
                    winW = document.documentElement.offsetWidth;
                    winH = document.documentElement.offsetHeight;
                }
                if (window.innerWidth && window.innerHeight) {
                    winW = window.innerWidth;
                    winH = window.innerHeight;
                }

                /* deprecated 2015-05-11 RCE -- should be done in CSS
                 // adjust location of popup if necessary
                 if (winH < 800) {
                 // adjust top position
                 details.style.top = '0px';
                 details.style.left = '0px';
                 details.style.marginLeft = 'auto';
                 details.style.position = 'absolute';
                 //mask.style.position = 'absolute';
                 //mask.style.height = document.body.height+'px';
                 }
                 */
            } else
            if (StoreModel.search('flat') != -1) {
                // check to see if we need to tweak the list of items to highlight the selected one
                var section_rows = jQuery("[name='section_row']"), //document.getElementsByName('section_row'),
                    active_id = 'cat_'+json.cat_id,
                    sr;
                for (i=0; i<section_rows.length; i++) {
                    sr = section_rows[i];
                    if (sr.id == active_id) {
                        // this is our row
                        if (sr.className.search(/active_item/) == -1) {
                            sr.className += ' active_item';
                        }
                    } else {
                        sr.className = sr.className.replace(/ active_item/i,'');
                    }
                }
            }

            if (document.getElementById('store_menu_tab') !== null &&
                document.getElementById('store_tab').style.display != 'block') {
                /* TODO RCE -- remove this comment-out
                 showStoreTab("store");
                 */
            }
            // show add-to-cart button, if defined
            if (document.getElementById('add_to_cart_btn')) {
                document.getElementById('add_to_cart_btn').style.display = 'block';
            }

            if (focus_fld !== null) {
                focus_fld.focus();
            }
        }
    };
    var url = "/cp/lz_getHTTPrequestData.php?REQ_TYPE=Catalog_Action&SUB_TYPE=Catalog_GetStoreItemDetails&CAT_ID="+cat_id+"&STORE="+StoreID+"&COUPON_ID="+getFieldValue('disc_coupon_id')+"&VIP_ID="+getFieldValue('vip_id');
    ajax.open("GET",url,true);
    ajax.send(null);
    LZ_waiting("retrieving product details...");
}


/************ Display Item Details popup functions **************/
function setupCatSize (cat_sizes, sku_type, cat_size_id) {
    var fld = gEBID('cat_size_id'),   // a select
        logged_in = UserID > 0,
        i;
    if (fld && fld.options) {
        fld.options.length = 1; // preserve 'choose...~0
        for (i = 0; i < cat_sizes.length; i++) {
            if (cat_sizes[i].active = 0) {
                if (!logged_in) {
                    continue;
                }
                cat_sizes[i].size_str += ' (inactive)';
            }
            fld.options[fld.options.length] = new Option(cat_sizes[i].size_str, cat_sizes[i].cat_size_id);
        }
    }
    setFieldValue('cat_size_id',cat_size_id);
    setElementStyle('cat_size_id','display',(sku_type == 'other_group' ? '' : 'none'));
}


function download_specsheet () {
    openPopUp(CP_PATH + "download_file?type=specsheet&cat_id="+getFieldValue('cat_id'),100,100);
}


function closeItemDetails () {
    document.getElementById('lz_editContainerMask').style.display = 'none';
    var div = document.getElementById('itemDetailsDiv');
    if (!div) {
        //might be the mobile popup
        div = document.getElementById('mobilePopup');
    }
    if (div) {
        div.style.display = 'none';
    }
    fast_list_filter_focus();
}


/************** Display VIP info window *******************/
var orderVIPpopupObject = null;
function showVIP () {
    if (orderVIPpopupObject !== null) {
        if (!orderVIPpopupObject.closed) {
            orderVIPpopupObject.focus();
            return;
        }
        orderVIPpopupObject = null;
    }
    var vip_id = document.getElementById('vip_id').value;
    orderVIPpopupObject = window.open('https://'+SITE_HOST+CP_PATH+'view_vip?vip_id='+vip_id,'','close=no,dialog=yes,directories=no,location=no,menubar=no,resizeable=no,scrollbars=no,status=no,titlebar=no,toolbar=no,width=1008,height=737');
}


/************** Misc shopping cart DOM functions ************/
function toggleShippingRows (caller) {
    // XXX RCE -- the iPOS client will need something similar to this, but React Native specific.
    var ship_rows = jQuery("[name='hidden_row']"),
        ship_meth = getSelectedOptionInfo('ship_method','value'),
        has_club = false,
        ship_hold_div = gEBID('ship_hold_div'),
        className, i, inv_loc;
    for (i=0; i<CartArray.length; i++) {
        if (CartArray[i].is_club == 1) {
            has_club = true;
            break;
        }
    }
    className = ((has_club == false && ship_meth == 'taken') ? 'hidden_row' : '');
    for (i=0; i<ship_rows.length; i++) {
        ship_rows[i].className = className;
    }
    if (ship_hold_div !== null) {
        if (beingShipped()) {
            ship_hold_div.style.display = 'inline';
            var ship_hold = getFieldValue('ship_hold');
            setElementStyle('ship_hold_date_div','display',(ship_hold == 'date' || ship_hold == 'futures' ? 'inline' : 'none'));
        } else {
            setElementStyle('ship_hold_div','display','none');
        }
    }
    // 2013-03-26 RCE
    //	added the following to automatically assign the correct inventory location, according to the shipping method chosen
    if (beingShipped()) {
        inv_loc = 'shipped';
    } else {
        inv_loc = 'no_ship';
    }
    setFieldValue('inv_loc_id',getFieldValue('inv_loc_id_'+inv_loc));

    setElementClassName('gift_msg_prompt',className);
    if (typeof caller == "undefined") {
        cart_displayShoppingCart();
    }
}


function toggleCCinfo (caller) {
    var val, i;
    if (!caller) {
        val = getFieldValue('terms');
    } else {
        val = caller.value;
    }
    setElementStyle('cc_info_table','display',(val == 'cc' || val == '3rd_pty' ? 'inline-block' : 'none'));
    if (Always_show_purch_addr_in_POS === undefined) {
        Always_show_purch_addr_in_POS = 0;
    }
    var className = (Always_show_purch_addr_in_POS == 0 && (prepaidSale(val) || !beingShipped()) ? 'hidden_row' : ''),
        display = (prepaidSale(val) || !beingShipped() ? 'none' : ''),
        unneeded_elements = jQuery("[name='not_needed_for_cash_sale']"); //document.getElementsByName('not_needed_for_cash_sale');
    for (i=0; i< unneeded_elements.length; i++) {
        if (unneeded_elements[i].tagName.toLowerCase() == "tr") {
            unneeded_elements[i].className = className;
        } else {
            unneeded_elements[i].style.display = display;
        }
    }
}


function fast_list_filter_focus () {
    var fast_list_filter = document.getElementById('fast_list_filter'),
        store_tab_class = document.getElementById('store_menu_tab').className;

    if (store_tab_class == 'menu_li_active' && fast_list_filter) {
        fast_list_filter.focus();
    }
}


function showClusterTable (caller) {
    // modified 2014-03-10 RCE to accept input from a <select> in mobile environments
    if (caller && caller.id && caller.tagName == 'SELECT') {
        var cluster = 'section_'+getFieldValue(caller.id);
    } else {
        var ul = caller.parentNode;
        for (var i=0; i<ul.childNodes.length; i++) {
            if (ul.childNodes[i] == caller) {
                ul.childNodes[i].className = "cluster_active";
            } else {
                ul.childNodes[i].className = "";
            }
        }
        cluster = "section_"+caller.id.substring(3);
    }
    var store_tab = document.getElementById('store_tab');
    var clusters = jQuery("[name='cluster_sections']"); //document.getElementsByName("cluster_sections");
    for (i=0; i<clusters.length; i++) {
        if (clusters[i].id == cluster) {
            clusters[i].style.display = 'block';
            //store_tab.style.height = parseInt(StoreTableRowHeight * Math.max(MinStoreTableRows,tables[i].rows.length),10) + 'px';
        } else {
            clusters[i].style.display = 'none';
        }
    }
}


function showStoreTab (which) {
    switch (which) {
        case 'store':
        case 'cart':
        case 'payment':
        case 'crm':
            break;
        default:
            which = 'store';
            break;
    }
    setElementStyle('store_tab','display',	(which == 'store'		? '' : 'none'));
    setElementStyle('cart_tab','display',	(which == 'cart'		? 'block' : 'none'));
    setElementStyle('payment_tab','display',(which == 'payment'	? 'block' : 'none'));
    setElementStyle('crm_tab','display',	(which == 'crm'		? 'block' : 'none'));
    setElementClassName('store_menu_tab',	(which == 'store'		?'menu_li_active' : 'menu_li'));
    setElementClassName('cart_menu_tab',	(which == 'cart'		?'menu_li_active' : 'menu_li'));
    setElementClassName('payment_menu_tab',	(which == 'payment'	?'menu_li_active' : 'menu_li'));
    var crm_tab = gEBID('crm_menu_tab');
    if (crm_tab !== null) {
        setElementClassName('crm_tab_menu',	(which == 'crm'		?'menu_li_active' : 'menu_li'));
    }
}


function fastPOS_setFocus (caller) {
    if (caller.currentTarget) {
        caller = caller.currentTarget;
    }
    var cat_id = caller.id.replace('cat_', 'fast_qty_');
    setFocus(cat_id);
}


function fastPOS_extra_info_open (caller) {
    if (caller.currentTarget) {
        caller = caller.currentTarget;
    }
    var cat_id = caller.id.replace('fast_qty_echo_','');
    caller.style.display = 'none';
    setElementStyle('fast_qty_input_'+cat_id,'display','block');
    fastPOS_setFocus(caller);
}


function fastPOS_extra_info_close(cat_id) {
    setElementStyle('fast_qty_input_'+cat_id,'display','');
    setElementStyle('fast_qty_echo_'+cat_id,'display','');
    setFieldValue('fast_qty_echo_'+cat_id,getFieldValue('fast_qty_'+cat_id,true));
    addFastPOSitemToCartArray(document.getElementById('fast_qty_'+cat_id));
}


function setCartCookie () {
    if (getFieldValue('order_ui') != 'web') {
        // only used in webstore
        return;
    }
    var i, coupon_code, li, x, y, line_items=[];
    coupon_code = (Coupon.disc_id ? Coupon.disc_id : 0);
    for (i=0; i<CartArray.length; i++) {
        li = CartArray[i].cat_id + '|' + CartArray[i].qty + '|' + CartArray[i].amount + '|' + CartArray[i].base_price_ea + '|' + CartArray[i].cat_size_id;
        line_items[line_items.length] = li;
    }
    var ajax = GetXmlHttpObject();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            var json;
            json = parseAjaxReturn(ajax);
            if (!json) {
                return;
            }
            if (json.result != 'OK') {
                LZ_alert("Whoops - error saving cart! Server said:<br />"+json.error);
            }
        }
    }
    var url="/cp/lz_getHTTPrequestData.php";
    var params = "REQ_TYPE=Orders_CartCookie&action=set&coupon_code="+coupon_code+"&line_items="+line_items.join('^^');
    ajax.open("POST",url,true);
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.send(params);
}


function CheckEmailThenTestForClub (emailField,emptyOK,forceLookup) {
    var i,
        ajax = GetXmlHttpObject(),
        ret = CheckEmail(emailField,emptyOK);
    if (!ret || cp_.isEmpty(emailField.value)) {
        return false;
    }

    if (typeof forceLookup == 'undefined') {
        forceLookup = false;
    }

    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            var do_lookup = forceLookup,
                json = parseAjaxReturn(ajax),
                welcome = '';
            LZ_closeAllAlerts();
            if (json.result == 'FAIL') {
                return false;
            }
            if (!inManageOrders()) {
                if (typeof json.club == "object") {
                    welcome += "Nice to see you again, " + (cp_.isEmpty(json.salutation) ? json.name_first : json.salutation) + "!";
                    if (typeof json.promo_coupon == 'object') {
                        // all of the current data is contained in the global variable Coupon
                        if (Coupon.disc_id                                  // not an empty coupon
                            && Coupon.disc_code != DefaultPromoCode         // not set to the default
                            && Coupon.disc_id != json.promo_coupon.disc_id  // not set to the incoming value
                            && Coupon.disc_id > 0                           // not set to 'choose...'
                        ) {
                            // there's a coupon code already in place and it isn't the default (which can always be overridden)
                            // let the use know there's another code they can use.
                            welcome += "<hr><p>Note: you already have code \"" + Coupon.disc_code + "\" in the " + CouponFieldTitleStr + " field.<br />" +
                                "As a Club member, you may also use code \"" + json.promo_coupon.disc_code + "\"; feel free to try it to see if you get a bigger discount.</p>";
                        } else {
                            Coupon = json.promo_coupon;
                            setCouponFieldValue();
                            if (!cp_.isEmpty(json.promo_msg)) {
                                welcome += "<hr>" + json.promo_msg;
                            }
                        }
                        do_lookup = true;
                    }
                    // 2013-04-06 RCE -- added, along with test in Member_FindByEmail
                    if (json.paused_club_message) {
                        welcome += '<hr>' + json.paused_club_message;
                    }
                }
                if (UserID > 0 && typeof json.club != 'undefined' && !cp_.isEmpty(json.club.club_name)) {
                    welcome += '<div class="alert_club_wrapper">' +
                        '<p class="alert_club">Member of Club ' + json.club.club_name;
                    if (json.club.variant > 0) {
                        welcome += ' (' + json.club['variant' + json.club.variant] + ')';
                    }
                    welcome += ' since ' + json.club.join_date;
                    if (json.club.suspended > 0) {
                        welcome += '<br />suspended as of ' + json.club.suspended_date
                    }
                    welcome += '</p></div>';
                }
                if (UserID > 0 && json.sticky_notes && json.sticky_notes.length > 0) {
                    welcome += '<div class="alert_stickies_wrapper">';
                    for (i = 0; i < json.sticky_notes.length; i++) {
                        welcome += '<p class="alert_sticky">' + json.sticky_notes[i].sticky_note + '</p>';
                    }
                    welcome += '</div>';
                }
                if (welcome > '') {
                    LZ_alert(welcome, null, 'Welcome Back!', 'success');
                    LZ_no_waiting_alerts = true;
                }
            } else
            if (typeof json.club == 'object' && json.club.prod_promo_coupon != 'undefined') {
                setFieldValue('disc_coupon_id',json.club.prod_promo_coupon);
            }

            if (do_lookup) {
                lookupCustomer('silent');
            }
        }
    };
    var url = '/cp/lz_getHTTPrequestData.php?REQ_TYPE=VIPs_Action&SUB_TYPE=Member_FindByEmail&NOT_LOGGED_IN=OK&email='+emailField.value;
    LZ_advisory('checking email...');
    ajax.open('GET',url,true);
    ajax.send(null);
}


/****************** Customer lookup DOM functions ************/
function lookupCustomer (silent) {
    if (typeof silent == "undefined") {
        silent = '';
    }
    var email = document.getElementById('bill_email');
    if (silent != 'silent' && cp_.isEmpty(email.value)) {
        LZ_advisory("Please enter a valid email address",email);
        return false;
    }
    if (typeof NoEmailEmail != 'undefined' && email.value == NoEmailEmail) {
        return true;
    }
    var ajax = GetXmlHttpObject();
    ajax.onreadystatechange = function () {
        if (ajax.readyState==4) {
            var json;
            try {
                json = parseAjaxReturn(ajax);
            }
            catch (e) {
                json = new Object;
                json.result = 'FAIL';
                json.message = ajax.responseText;
            }
            if (json.result == 'FAIL') {
                if (silent != 'silent') {
                    LZ_alert('Error retrieving user information; the server said:<br />'+json.message);
                }
                return;
            }
            //var xmlObj = parseXMLstring(ajax.responseText);
            if (silent != 'silent') {
                LZ_close_waiting();
            }
            if (typeof json.error == 'undefined' || json.error != 'error') {
                var is_pos = getFieldValue('order_ui') == 'pos',
                    cc_data_already_present = !cp_.isEmpty(getFieldValue('cc_num')),
                    json_has_cc_data = !cp_.isEmpty(json.cc_num),
                    fld, val, i;
                // deal with missing DOB on shipping side
                if (cp_.isEmpty(json.ship_dob) && !cp_.isEmpty(json.bill_dob)) {
                    json.ship_dob = json.bill_dob;
                }
                for (i=0; i<CustFields.length; i++) {
                    /* 2015-09-11 RCE -- the code below can result in a card being entered for one customer, then used for another.
                     That's just wrong.
                     If we're not in a pos environment, the card data, if present, should be preserved.
                     Otherwise, it should be overwritten.
                     if (CustFields[i].substring(0,3) == "cc_" && (!is_pos || cc_data_already_present || !json_has_cc_data)) {
                     // skip credit card stuff if either not in POS interface, or if there is cc data present, or no cc data
                     continue;
                     }
                     */
                    if (CustFields[i].substring(0,3) == "cc_" && !is_pos) {
                        // skip credit card stuff if not in POS interface
                        continue;
                    }
                    val = json[CustFields[i]];
                    setFieldValue(CustFields[i],val);
                }

                ZipLookup(document.getElementById('bill_postal'),true);
                ZipLookup(document.getElementById('ship_postal'),true,null,TC_cleanup);	// scrub temp-controlled if not valid
                if (!inManageOrders()) {
                    var crm_menu_li = document.getElementById('crm_menu_ul');
                    if (crm_menu_li) {
                        if (is_pos && UserID && UserID > 0) {
                            var vip_id = json.vip_id;
                            if (vip_id !== "0") {
                                buildCRMtable(vip_id);
                            }
                            crm_menu_li.style.display = (vip_id === '0' ? 'none' : 'block');
                        } else {
                            crm_menu_ul.style.display = 'none';
                        }
                    }
                    cart_displayShoppingCart();
                    addShipToHistory(json);
                }
            } else {
                setFieldValue('vip_id',0);  // be sure to wipe any prior value so this doesn't get attached to the wrong record
                if (silent != 'silent') {
                    LZ_alert("Sorry - couldn't find a customer with this email address",email);
                    document.getElementById('crm_menu_ul').style.display = 'none';
                    return;
                }
            }
        }
    };
    var url="/cp/lz_getHTTPrequestData.php";
    url=url+"?REQ_TYPE=Customer_GetCustomerLoginData&EMAIL="+encodeURIComponent(email.value);
    if (silent != 'silent') {
        LZ_waiting("looking up customer...");
    }
    ajax.open("GET",url,true);
    ajax.send(null);
}


function lookupCustomerByString () {
    var str = getFieldValue('bill_name');
    if (cp_.isEmpty(str)) {
        LZ_advisory('Enter a string to search for first, then click Lookup','bill_name');
        return false;
    }
    if (str.length < 4) {
        LZ_advisory('Enter at least four characters, then click Lookup','bill_name');
        return false;
    }
    var ajax = GetXmlHttpObject();
    ajax.onreadystatechange = function () {
        if (ajax.readyState==4) {
            LZ_close_waiting();
            var json;
            try {
                json = parseAjaxReturn(ajax);
            }
            catch (e) {
                json = new Object;
                json.result = 'FAIL';
                json.error = ajax.responseText;
            }
            if (json.result == 'FAIL') {
                LZ_alert('Error retrieving user information; the server said:<br />'+json.error);
                return;
            }
            // ok -- we have a list (maybe)
            var candidate, tr, td, radio, i,
                candidates = json.candidates,
                tbody = document.getElementById('cust_lookup_tbody');
            if (!candidates || candidates.length === 0) {
                LZ_advisory('No matching candidates found','bill_name');
                return false;
            }
            // yup -- list out our options
            tbody.innerHTML = '';
            for (i=0; i<candidates.length; i++) {
                candidate = candidates[i];
                tr = document.createElement('div');
                tr.className = 'lz_tbl_row';
                td = document.createElement('div');
                td.className = 'lz_tbl_cell name';
                radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'chooseCustomer';
                radio.setAttribute('email',candidate.bill_email);
                radio.onclick = lookupThisCustomer;
                radio.id = 'vip_'+candidate.vip_id;
                td.appendChild(radio);
                td.appendChild(document.createTextNode(candidate.disp_name));
                tr.appendChild(td);
                td = document.createElement('div');
                td.className = 'lz_tbl_cell';
                td.appendChild(document.createTextNode(candidate.salutation));
                tr.appendChild(td);
                td = document.createElement('div');
                td.className = 'lz_tbl_cell';
                td.appendChild(document.createTextNode(candidate.city_state));
                tr.appendChild(td);
                td = document.createElement('div');
                td.className = 'lz_tbl_cell club';
                td.appendChild(document.createTextNode(candidate.club));
                tr.appendChild(td);
                td = document.createElement('div');
                td.className = 'lz_tbl_cell lifetime';
                td.appendChild(document.createTextNode(CommaFormatted(candidate.lifetime,true,true,0)));
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
            document.getElementById('lz_advancedEditMask').style.display = 'block';
            document.getElementById('customer_lookup_div').style.display = 'block';
        }
    };
    var url="/cp/lz_getHTTPrequestData.php";
    url=url+"?REQ_TYPE=Customer_LookupCustomer&STRING="+encodeURIComponent(str);
    LZ_waiting('looking up matching customers...');
    ajax.open("GET",url,true);
    ajax.send(null);
}


function lookupThisCustomer (caller) {
    // called from the "lookup customer" popup
    // two actions:
    //  1. populate the bill_email field and trigger its lookup activity
    //  2. pop up the customer's details
    if (caller.currentTarget) {
        caller = caller.currentTarget;
    }
    document.getElementById('lz_advancedEditMask').style.display = '';
    document.getElementById('customer_lookup_div').style.display = '';
    setFieldValue('bill_email',caller.getAttribute('email'));
    setFieldValue('vip_id',caller.id.replace('vip_',''));
    //lookupCustomer('silent');
    CheckEmailThenTestForClub(document.getElementById('bill_email'),false,true);
    // 2015-05-09 RCE: no longer needed given that we now show sticky notes in welcome popup // showVIP();
}


/*********** Shipping History functions ************/
var ShippingHistory = null;
function addShipToHistory (json) {
    // 2014-04-30 RCE
    // if there is a shipping history for this customer, then it populates a dropdown and shows it.
    // if there isn't, then the dropdown is hidden
    var btn = document.getElementById('my_shipping_history');
    if (typeof json.ship_addrs == 'undefined' || json.ship_addrs.length < 2) {
        btn.style.display = '';
        ShippingHistory = null;
    } else {
        btn.style.display = 'inline';
        ShippingHistory = json.ship_addrs;
    }

}


function showShippingHistory () {
    // this can only get called if there are options in ShippingHistory
    var addr, tr, td, radio, i,
        tbody = document.getElementById('ship_addr_lookup_tbody');
    tbody.innerHTML = '';
    for (i=0; i<ShippingHistory.length; i++) {
        addr = ShippingHistory[i];
        tr = document.createElement('div');
        tr.className = 'lz_tbl_row';
        td = document.createElement('div');
        td.className = 'lz_tbl_cell name';
        radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'chooseShipAddr';
        radio.setAttribute('which_addr',i.toString());
        radio.onclick = loadShippingAddress;
        td.appendChild(radio);
        td.appendChild(document.createTextNode(addr.ship_name_x));
        tr.appendChild(td);
        td = document.createElement('div');
        td.className = 'lz_tbl_cell';
        td.appendChild(document.createTextNode(addr.ship_city_x+', '+addr.ship_state_x+' '+addr.ship_postal_x));
        tr.appendChild(td);
        td = document.createElement('div');
        td.className = 'lz_tbl_cell';
        td.appendChild(document.createTextNode(addr.ship_addr1_x));
        tr.appendChild(td);
        td = document.createElement('div');
        td.className = 'lz_tbl_cell last_ship';
        td.appendChild(document.createTextNode(addr.o_date));
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
    document.getElementById('lz_advancedEditMask').style.display = 'block';
    document.getElementById('ship_addr_lookup_div').style.display = 'block';
}


function loadShippingAddress (caller) {
    if (caller.currentTarget) {
        caller = caller.currentTarget;
    }
    var which = caller.getAttribute('which_addr'),
        addr = ShippingHistory[which],
        i, fields = ['ship_name','ship_addr1','ship_addr2','ship_postal','ship_phone'];
    for (i=0; i<fields.length; i++) {
        setFieldValue(fields[i],addr[fields[i]+'_x']);
    }
    document.getElementById('lz_advancedEditMask').style.display = '';
    document.getElementById('ship_addr_lookup_div').style.display = '';
    ZipLookup(document.getElementById('ship_postal'),true,null,TC_cleanup);	// scrub temp-controlled if not valid
}


/*********** CRM functions ****************************/

function buildCRMtable (vip_id) {
    var crmAjax = GetXmlHttpObject();
    crmAjax.onreadystatechange = function () {
        if (crmAjax.readyState==4) {
            var json = parseAjaxReturn(crmAjax);
            if (!json) {
                return;
            }
            if (json.result == 'FAIL') {
                LZ_alert("Error loading CRM information:<br />"+json.error);
                return false;
            }
            var crm_table = document.getElementById('crm_table');
            var rows = crm_table.tBodies[0].rows.length;
            for (var i=1; i<rows; i++) {
                crm_table.tBodies[0].deleteRow(1);
            }
            buildCRMSection (crm_table,json.crm_list.open_to_dos);
            buildCRMSection (crm_table,json.crm_list.stickies);
            buildCRMSection (crm_table,json.crm_list.others);
            // append blank row
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            td.colSpan = 2;
            td.className = 'crm_list_final';
            td.appendChild(document.createTextNode(" "));
            tr.appendChild(td);
            crm_table.tBodies[0].appendChild(tr);
        }
    };
    var url="/cp/lz_getHTTPrequestData.php";
    url=url+"?REQ_TYPE=VIP_GetCRMjson&vip_id="+vip_id;
    crmAjax.open("GET",url,true);
    crmAjax.send(null);
}
function buildCRMSection (crm_table,list) {
    var tr, td, img, span, i;
    for (i=0; i<list.length; i++) {
        tr = document.createElement ("tr");
        tr.id = list[i].crm_id;
        tr.onclick = loadCRM_customer_event;

        td = document.createElement("td");
        td.className = 'crm_list_image';
        img = document.createElement("img");
        img.src = "lz_img/"+list[i].image;
        td.appendChild(img);
        tr.appendChild(td);

        td = document.createElement("td");
        td.className = 'crm_list_note';
        span = document.createElement('span');
        span.appendChild(document.createTextNode('[' + list[i].crm_date_added + ' ' + list[i].initials + '] '));
        td.appendChild(span);
        td.appendChild (document.createTextNode(list[i].crm_note));
        tr.appendChild(td);

        crm_table.tBodies[0].appendChild(tr);
    }
}
function loadCRM_customer_event (crm_id) {
    if (crm_id.currentTarget) {
        crm_id = crm_id.currentTarget.id;
    }
    if (document.getElementById('crm_vip_id') == undefined) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.id = 'crm_vip_id';
        input.name = 'crm_vip_id';
        document.getElementById('edit_crm_form').appendChild(input);
    }
    document.getElementById('crm_vip_id').value = document.getElementById('vip_id').value;
    loadCRMevent(crm_id);
}



