/**
 * Created by rce on 5/19/16.
 */

function GetXmlHttpObject() {
    var xmlHttp=null;
    try {
        // Firefox, Opera 8.0+, Safari
        xmlHttp=new XMLHttpRequest();
    }
    catch (e) {
        // Internet Explorer
        try {
            xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    // set a default timeout
    //xmlHttp.timeout = 4000;   // 4 seconds
    //xmlHttp.ontimeout = function () { LZ_alert('Ajax request timed out.');};
    return xmlHttp;
}


function parseAjaxReturn (ajax) {
    var json;
    try {
        json = JSON.parse(ajax.responseText);
    }
    catch (e) {
        json = new Object();
        json.result = 'FAIL';
        json.error = ajax.responseText;
    }
    // if not logged in, deal with that here.
    if (json.result == 'NOT_LOGGED_IN') {
        var c_name = parseAjaxReturn.caller + ' |||| ' + parseAjaxReturn.caller.caller;
        LZ_alert('Sorry, but this action requires that you be logged in to Captina and you are not currently logged in, or your session has expired.'+
            '<p>Please log in again before proceeding.</p>'+c_name,null,'E R R O R','error');
        return false;
    }
    // any other issues are dealt with by the caller
    return json;
}


function getXMLelement (xmlObj,element) {

    if (xmlObj === null) return "";

    try {
        return xmlObj.getElementsByTagName(element)[0].childNodes[0].nodeValue;
    }
    catch(e) {
        return "";
    }

}


function ajaxSynchronousGET (url) {
    var ajax = GetXmlHttpObject();
    ajax.open('GET',url,false);
    ajax.send(null);
    // wait for it...
    var json;
    try {
        json = parseAjaxReturn(ajax);
    }
    catch (e) {
        json = new Object();
        json.result = 'FAIL';
        json.error = ajax.responseText;
    }
    return json;
}


function ajaxSynchronousPOST (url, params) {
    var ajax = GetXmlHttpObject();
    ajax.open("POST",url,false);	// synchronous call
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.send(params);
    // wait for it...
    var json;
    try {
        json = parseAjaxReturn(ajax);
    }
    catch (e) {
        json = new Object();
        json.result = 'FAIL';
        json.error = ajax.responseText;
    }
    return json;
}


function ajaxRequest(reqData, callbackFn, errorFn) {
    /**
     *
     * @param object reqData
     * @param function callbackFn - optional function to process ajax results
     * @param function errorFn - optional function to process ajax error
     */
    var queryString, method, url;

    // normalize URL
    if (!reqData.hasOwnProperty('url')) {
        url = '/cp/lz_getHTTPrequestData.php';
    }
    else {
        switch (reqData.url.lastIndexOf('/')) {
            // fix path in urls like '/cp/lz_getHTTPrequestData.php' and '/lz_getHTTPrequestData.php'
            case 0:
                reqData.url = reqData.url.slice(1);
            // fall thru
            case -1:
                url = reqData.url;
                break;
            // note this also allows urls like '/someotherpath/whatever'
            default:
                url = reqData.url;
        }
    }

    // default to POST
    if (!reqData.hasOwnProperty('method')) {
        reqData.method = 'POST';
    }
    method = reqData.method.toUpperCase();

    // Normalize query string args
    // XXX: allow params as either name: value object or string 'this=that&that=this'
    // XXX: could also include query string in the URL for GET
    // XXX: object is preferred since we ensure correct encoding
    if (reqData.hasOwnProperty('params')) {
        var params = reqData.params;
        if (typeof params.valueOf() === 'object') {
            var pieces = [],
                name, val;
            for (name in params) {
                val = method === 'POST' ? params[name] : encodeURIComponent(params[name]);
                pieces.push(name + '=' + val)
            }
            queryString = pieces.join('&');
        }
        else {
            // assume params is passed in string form
            queryString = params.indexOf('?') === 0 ? params.slice(1) : params;
        }
        if (method === 'GET') {
            url += '?' + queryString;
            queryString = null;
        }
    }
    else {
        method = 'GET';
    }

    reqData.computed = {
        qs:     queryString,
        method: method,
        url:    url
    };
    console.dir(reqData);

    // Do the ajax thing
    var ajaxObj = GetXmlHttpObject();
    if (typeof callbackFn === 'function') {
        ajaxObj.onreadystatechange = function() {
            if (ajaxObj.readyState == 4) {
                if (typeof errorFn === 'function' && ajaxObj.status >= 400) {
                    errorFn(ajaxObj);
                }
                else {
                    callbackFn(ajaxObj);
                }
            }
        }
    }

    ajaxObj.open(method, url, true); // never use sync
    if (method === 'POST') {
        ajaxObj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        ajaxObj.send(queryString);
    }
    else {
        ajaxObj.send();
    }
    return ajaxObj;
}


function gEBID (element) {
    return document.getElementById(element);
}


function getFormElements (id) {
    var el = gEBID(id);
    return el.elements;
}


function getFieldElement (id, element) {
    var el = gEBID(id);
    if (el) {
        return el[element];
    }
    return null;
}


function setElementStyle (fld, styleElement, value) {
    if (typeof fld =='string') {
        fld = gEBID(fld);
    }
    if (fld) {
        fld.style[styleElement] = value;
    }
}


function setElementClassName (id, className) {
    var fld = gEBID(id);
    if (fld) {
        fld.className = className;
    }
}


function setFocus (id) {
    gEBID(id).focus();
}


function setElementAttribute (el, attr, val) {
    if (typeof el == 'string') {
        el = gEBID(id);
    }
    if (el) {
        el.setAttribute(attr, val);
    }
}


function getElementAttribute (el, attr) {
    if (typeof el == 'string') {
        el = gEBID(id);
    }
    if (el) {
        return el.getAttribute(attr);
    }
    return '';
}


function AJAX_buildParamString (elements) {
    var i, params='', fld;
    for (i=0; i<elements.length; i++) {
        fld = elements[i];
        params += '&'+(fld.id ? fld.id : fld.name)+'=';
        switch (fld.tagName.toLowerCase()) {
            case 'button': continue;
            case 'input':
                switch (fld.type.toLowerCase()) {
                    case 'checkbox':
                        params += fld.checked ? 1 : 0;
                        break;
                    case 'radio':
                        params += getSelectedRadioValue(fld.name);
                        while (i+1 < elements.length && elements[i+1].name == fld.name) {
                            i++;
                        }
                        break;
                    case 'text':
                    case 'email':
                    case 'phone':
                    case 'hidden':
                    case 'number':
                    case 'password':
                        params += encodeURIComponent(fld.value);
                        break;
                }
                break;
            case 'textarea':
                params += encodeURIComponent(fld.value);
                break;
            case 'select':
                params += getSelectedOptionInfo(fld,'value');
                break;
        }
    }
    return params;
}


function AJAX_displayJson (elements, json) {
    var i, fld, val;
    for (i=0; i<elements.length; i++) {
        fld = elements[i];
        val = json[cp_.isEmpty(fld.id) ? fld.name : fld.id];
        if (val === undefined) {
            val = "";
        }
        switch (fld.tagName.toLowerCase()) {
            case 'button': continue;
            case 'input':
                switch (fld.type.toLowerCase()) {
                    case 'checkbox':
                        fld.checked = (val == '1');
                        break;
                    case 'radio':
                        setRadioValue(fld.name,val);
                        while (i+1 < elements.length && elements[i+1].name == fld.name) {
                            i++;
                        }
                        break;
                    case 'text':
                    case 'email':
                    case 'phone':
                    case 'hidden':
                        fld.value = val;
                        break;
                }
                break;
            case 'textarea':
                fld.value = val;
                break;
            case 'select':
                setSelectedOptionByValue(fld,val);
                break;
        }
    }
}


function adjust_pwd_meter (caller) {
    if (caller.currentTarget) {
        caller = caller.currentTarget;
    }
    var pwd = caller.value;
    var strength = zxcvbn(pwd);
    var bar = -Math.max(1,strength.score)*12;
    var meter = document.getElementById('pwd_meter');
    meter.style.backgroundPosition = "left "+bar.toString() + "px";
}


function charOK (okChars,event) {
    var keycode;
    if (window.event)
        keycode = window.event.keyCode;
    else if (event)
        keycode = event.which;
    else
        return true;

    for (var i=0; i<okChars.length; i++) {
        if (okChars.charCodeAt(i) == keycode)
            return (true);	// character is in approved set
    }
    return (false); // character not found in approved set

} /* charOK */


function CheckDate (field) {
    return checkDate(field);
}
function checkDate (field) {
    if (typeof field == 'string') {
        field = gEBID(field);
    } else
    if (!field || typeof field.value == 'undefined') {
        field = this;
    }
    if (field.value.length == 6 && strvalue(field.value) == field.value) {
        // should be mmddyy, no separators
        var mon, day, year;
        mon = field.value.substr(0,2);
        day = field.value.substr(2,2);
        year = field.value.substr(4,2);
        if (year > "75") {
            year = "19"+year;
        } else {
            year = "20"+year;
        }
        field.value = year+'-'+mon+'-'+day;
    }

    var dates = field.value.replace(/\//g,'-').split("-");
    if (dates.length != 3) {
        LZ_alert('<p>Please enter a valid date.</p>',field);
        return false;
    }
    var had_slashes = field.value.search(/\//) != -1;
    if (had_slashes) {
        // check the thrid position for a year value
        if (dates[2].length == 2 && dates[2].charAt(0) < "2") {
            dates[2] = "20"+dates[2];
        }
    }
    // clean it up a bit more
    for (var i=0; i<3; i++) {
        if (dates[i].length == 1) dates[i] = '0'+dates[i];
        if (dates[i] > '31' && dates[i] <= '99') {
            // must be the year, in the 1900s; add the '19' to it
            dates[i] = '19'+dates[i];
        }
    }
    if (dates[2].length == 4) {
        // user probably did M-D-Y rather than Y-M-D
        var m = dates[0];
        var d = dates[1];
        dates[0] = dates[2];
        dates[1] = m;
        dates[2] = d;
    }
    if (dates[1] > '12') {
        // user did Y-D-M
        d = dates[1];
        dates[1] = dates[2];
        dates[2] = d;
    }
    if (dates.length > 3) {
        LZ_alert('<p>Please enter the full 4-digit year.  The date should be in the form YYYY-MM-DD.</p>',field);
        return false;
    }
    if (dates[0].length==2 && dates[1].length==2 && dates[2].length==2 && had_slashes) {
        // user probably entered M/D/YY; shift to YYYY-MM-DD
        d = dates[2];
        dates[2] = dates[0];
        dates[0] = '20'+d;
    }
    if (dates[1].length == 1) dates[1] = '0' + dates[1];
    if (dates[2].length == 1) dates[2] = '0' + dates[2];
    var ds = dates[1] + "/" + dates[2] + "/" + dates[0],
        test = new Date (ds);
    if (isNaN(test)) {
        LZ_alert('<p>Please enter a date in the form YYYY-MM-DD.</p>',field);
        return false;
    } else {
        if (test.getFullYear() != (dates[0] * 1) || (test.getMonth()+1) != (dates[1] * 1) || test.getDate() != (dates[2] * 1)) {
            LZ_alert('<p>Sorry, but '+field.value+' is not a valid date. Please enter a date in the form YYYY-MM-DD.</p>',field);
            return false;
        } else {
            field.value = dates[0]+'-'+dates[1]+'-'+dates[2];
            return true;
        }
    }
}


function updateShippingOptions (json, fld, tc_action) {
    var i, ship_meth, last_ship_meth, prefix, addr_fld,
        ship_meth_fld = null,
        TC_ship_string, TC_ship_meth = null;
    switch (fld.id) {
        case 'ship_postal':
            ship_meth_fld = gEBID('ship_method'); // assume it's an order
            if (!ship_meth_fld) {
                ship_meth_fld = gEBID('ship_meth_pref');    // nope -- an individual
            }
            if (!ship_meth_fld) {
                ship_meth_fld = gEBID('ship_default');    // nope -- a company
            }
            if (!ship_meth_fld) {
                ship_meth_fld = gEBID('club_ship_meth_pref');
            }
            prefix = 'ship_';
            break;
        case 'clubj_ship_postal':
            ship_meth_fld = gEBID('club_ship_meth_pref');
            prefix = 'clubj_ship_';
            break;
        default:
        // shouldn't happen
    }
    if (json.max_addr_len && !cp_.isEmpty(json.max_addr_len)) {
        addr_fld = gEBID(prefix+'addr1');
        if (addr_fld) {
            setElementAttribute(addr_fld,'max_chars',json.max_addr_len);
            setElementAttribute(addr_fld,'max_char_msg','Shipping addresses may not be longer than '+json.max_addr_len+' characters.');
            addr_fld = gEBID(prefix+'addr2');
            setElementAttribute(addr_fld,'max_chars',json.max_addr_len);
            setElementAttribute(addr_fld,'max_char_msg','Shipping addresses may not be longer than '+json.max_addr_len+' characters.')
        }
    }
    if (ship_meth_fld !== null && ship_meth_fld.options) {
        last_ship_meth = getFieldValue(ship_meth_fld);
        if (ship_meth_fld.options[0].value == '-1' || ship_meth_fld.options[0].value == '0') {
            // choose... -- save it
            ship_meth_fld.options.length = 1;
        } else {
            ship_meth_fld.options.length = 0;
        }
        // need to update the Globals as well
        ShipSpeeds = [];
        ShippingMethods = [];
        for (i=0; i<json.ship_meths.length; i++) {
            ship_meth = json.ship_meths[i];
            if ((tc_action & TC_drop_tc) && ship_meth == 'groundTC') {
                continue;
            }
            ShipSpeeds[ShipSpeeds.length] = ship_meth.captina;  // add everything that's eligible here
            if (ship_meth.type == 'ship') {
                ShippingMethods[ShippingMethods.length] = ship_meth.captina;    // add actual shipping methods here
            }
            ship_meth_fld.options[ship_meth_fld.options.length] = new Option(ship_meth.display,ship_meth.captina,false,(ship_meth.captina == last_ship_meth));
            if (ship_meth.captina == "groundTC" && last_ship_meth != "groundTC") {
                json.TC_ship_meth = ship_meth.display;
                json.TC_ship_string = ship_meth.msg;
            }
        }
    }
    return json;
}


var country_related_fields = ['state','city','postal','city_echo','state_echo'];
function setCountryFields (caller,wipe,warn) {
    if (wipe === undefined) {
        wipe = true;
    }
    if (warn === undefined) {
        warn = true;
    }
    var i, s, fld, prefix='', source_field;
    // caller can be a field, or a string
    if (caller.id) {
        var parts = caller.id.split('_');
        // caller.id might be, for example, 'ship_country' or 'foo_bar_ship_fib_country' -- we want all but the last part
        for (i=0; i<parts.length-1; i++) {
            prefix += parts[i]+'_';
        }
        source_field = caller;
    } else {
        prefix = caller;
        source_field = gEBID(prefix + 'country');
    }
    if (prefix != 'bill_' && prefix != 'ship_' && source_field != caller) {
        prefix = '';
    }
    if (wipe == true) {
        for (i=0; i<country_related_fields.length; i++) {
            fld = gEBID(prefix+country_related_fields[i]);
            if (fld === null) {
                continue;
            }
            switch (fld.tagName.toLowerCase()) {
                case 'input':
                    fld.value = '';
                    break;
                case 'select':
                    fld.options.length = 0;
                    break;
            }
        }
    }
    if (source_field.tagName == 'SELECT') {
        var cntry = getFieldValue(source_field);
        if (cntry == -1) {
            cntry = "US";
            setFieldValue(source_field,"US");
        }
    } else {
        cntry = source_field.value;
    }
    var on_ch = source_field.getAttribute('onchange'),
        postal = gEBID(prefix+'postal'),
        addr_intl = gEBID(prefix+'addr_intl'),
        state_echo = gEBID(prefix+'state_echo'),
        city_echo = gEBID(prefix+'city_echo'),
        prompt = gEBID(prefix+'prompt');
    if (cntry == 'US' || cntry == 'CA') {
        if (state_echo) state_echo.style.display = '';
        setElementStyle(prefix+'state','display','none');
        if (city_echo) city_echo.style.display = '';
        setElementStyle(prefix+'city','display','none');
        postal.className = postal.className.replace(' intl','');
        var state = gEBID(prefix+'state');
        if (state.tagName.toLowerCase() == 'select') {
            // swap options
            for (i=0; i<StateJSON.length; i++) {
                s = StateJSON[i];
                if (s.cntry != cntry) continue;
                state.options[state.options.length] = new Option(s.abbr+' - '+s.name,s.abbr,false,false);
            }
        }
        if (typeof addr_intl != 'undefined' && addr_intl !== null) {
            setElementStyle(addr_intl,'display','none');
        }
        if (prompt) {
            setElementStyle(prompt,'display','none');
        }
    } else {
        if (state_echo) {
            setElementStyle(state_echo,'display','none');
        }
        setElementStyle(prefix+'state','display','block');
        if (city_echo) {
            setElementStyle(city_echo,'display','none');
        }
        setElementStyle(prefix+'city','display','block');
        postal.className += ' intl';
        if (typeof addr_intl != 'undefined' && addr_intl !== null) {
            setElementStyle(addr_intl,'display','block');
        }
        if (prompt) {
            setElementStyle(prompt,'display','inline');
        }
    }
    if (warn && prefix == 'ship_' && cntry != 'US') {
        LZ_alert('<p>Note: Shipping costs to '+getSelectedOptionInfo(source_field,'text')+' must be calculated by hand; we will contact you.</p>');
    }
    if (on_ch.search && on_ch.search('setDirtyBit') != -1) {
        setDirtyBit();
    }
    setFocus(prefix+'postal');
}


function replaceTableBody (old_node,new_node) {
    var valid_new_node = typeof new_node !== 'undefined';
    if (old_node.tagName == 'DIV') {
        old_node.innerHTML = '';
        if (!valid_new_node) {
            return;
        }
    }
    if (!valid_new_node) {
        new_node = old_node.cloneNode(false);
    }
    if (old_node && old_node.parentNode) {
        old_node.parentNode.replaceChild(new_node, old_node);
    }
}


function closeParentDivWindow (element) {
    // crawls up the DOM stack until it finds a DIV with an ID, then closes that 'window' and turns off the mask
    // note: very DOM-specific!!
    if (typeof element == 'string') {
        element = gEBID(element);
    }
    element = element.parentNode;	// move up one layer to begin with, since caller isn't the parent.
    while ((element.tagName != "DIV" || element.id == "") && typeof element.offsetParent != 'undefined' && element.offsetParent !== null) {
        element = element.parentNode;
    }
    element.style.display = "none";
    var mask_id = element.id + '_mask';
    if (document.getElementById(mask_id) && document.getElementById(mask_id).style.display == 'block') {
        document.getElementById(mask_id).style.display = 'none';
    } else
    if (document.getElementById("lz_advancedEditMask") && document.getElementById("lz_advancedEditMask").style.display != 'none') {
        document.getElementById("lz_advancedEditMask").style.display = "none";
    } else
    if (document.getElementById("lz_editContainerMask") && document.getElementById("lz_editContainerMask").style.display != 'none') {
        document.getElementById("lz_editContainerMask").style.display = "none";
    }

}


/***********************************
 **	Drag-n-drop
 **	RCE 2013-01-02
 **	Original source: http://jsfiddle.net/kKuqH/650/
 **	Initialize by calling lz_drag_init
 **	NOTES:
 **		1. only one element per page
 **		2. the element must have "draggable='true'" as an attribute
 **		3. the element must have style/CSS attributes as follows:
 **			position: absolute
 **			top: set to a value
 **			left: set to a value

 var lz_drag_target = null;

 function lz_drag_start(event) {
    var style = window.getComputedStyle(lz_drag_target, null);
    event.dataTransfer.setData("text/plain",
        (parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
}
 function lz_drag_over(event) {
    event.preventDefault();
    return false;
}
 function lz_drag_drop(event) {
    var offset = event.dataTransfer.getData("text/plain").split(',');
    var target = lz_drag_target; //event.originalTarget;
    target.style.left = Math.max(0,(event.clientX + parseInt(offset[0],10))) + 'px';
    target.style.top  = Math.max(0,(event.clientY + parseInt(offset[1],10))) + 'px';
    event.preventDefault();
    return false;
}
 function lz_drag_init (div) {
    return false;
}
 function lz_drag_block (elements) {
    var i, el;
    if (typeof elements == 'string') {
        el = elements;
        elements = [];
        elements[0] = el;
    }
    for (i=0; i<elements.length; i++) {
        el = document.getElementById(elements[i]);
        el.draggable = false;
        el.removeEventListener('dragstart',lz_drag_start,false);
        
    }
}
 */


function copyFields (from_prefix,to_prefix,src) {
    var from, dest, i;
    for (i=0; i<src.length; i++) {
        from = gEBID(from_prefix+src[i]);
        dest = gEBID(to_prefix+src[i]);
        if (from === null || dest === null) {
            continue;
        }
        setFieldValue(dest,getFieldValue(from));
    }
}
function copyFieldsAndSetCountry (from_prefix, to_prefix, src) {
    // used to make sure that the proper fields are shown
    // actually, to-country has to be set first.
    // var cntry = getSelectedOptionInfo(from_prefix+'country','value');
    // setSelectedOptionByValue(to_prefix+'country',cntry);
    copyFields(from_prefix, to_prefix, src);
    setCountryFields(to_prefix,false);	// don't wipe content
}


function dateHandler (e,dateField,fmt) {
    if (!e) {
        e = window.event;
    }
    if (!dateField) {
        dateField = this;
    }
    if (!fmt) {
        fmt = "Y-m-d";
    }
    var keycode = e.keyCode,
        handled = false,
        i;

    // return if it's a number or navigation.  otherwise, wipe the event.
    if (keycode >=96 && keycode <= 111) {   // came from the number pad; translation required
        switch (keycode) {
            case 106:
            case 107:
            case 108:
            case 109:
            case 110:
                break;
            case 111:
                keycode = 47;   // slash
                break;
            default:
                keycode -= 48;
                break;
        }
    }
    if ((keycode >= 46 && keycode <= 57)        // "-./0123456789"
        || (keycode < 32 || keycode > 126)) {   // navigation characters
        return true;
    }

    switch (keycode) {
        case 116:	// 't'
        case 84:	// 'T'
            if (e.stopPropogation) {
                e.stopPropogation();
            }
            e.cancelBubble = true;
            e.returnValue = false;
            if (e.preventDefault) e.preventDefault();

            var stamp = new Date(),
                month = (stamp.getMonth()+1 < 10) ? "0" : "";
            month += (stamp.getMonth()+1).toString();
            day = (stamp.getDate() < 10) ? "0" : "";
            day += stamp.getDate().toString();
            var val = (fmt == "Y-m-d" ? stamp.getFullYear().toString() + "-" : "") + month + "-" + day;
            dateField.value = val;
            handled = true;
            break;
        case 83:	// 'S'
        case 115:	// 's'
            //	first of whatever month it's in, unless it's already on the 1st, in which case the first of January
            if (e.stopPropogation) {
                e.stopPropogation();
            }
            e.cancelBubble = true;
            e.returnValue = false;
            if (e.preventDefault) e.preventDefault();

            var base = dateField.value;
            if (base.substr(7,3) == '-01') {
                dateField.value = base.substr(0,4)+'-01-01';
                handled = true;
                break;
            }
            if (base.length < 10) {
                stamp = new Date();
                month = (stamp.getMonth()+1 < 10) ? "0" : "";
                month += (stamp.getMonth()+1).toString();
                day = (stamp.getDate() < 10) ? "0" : "";
                day += stamp.getDate().toString();
                val = (fmt == "Y-m-d" ? stamp.getFullYear().toString() + "-" : "") + month + "-" + day;
                base = val;
            }
            dateField.value = base.substr(0,8)+'01';
            handled = true;
            break;
        case 76:	// 'L'
        case 108:	// 'l'
            // last of whatever month it's in, or Dec 31 if it's already on the last of the month
            if (e.stopPropogation) {
                e.stopPropogation();
            }
            e.cancelBubble = true;
            e.returnValue = false;
            if (e.preventDefault) e.preventDefault();

            base = dateField.value;
            if (base.length < 10) {
                stamp = new Date();
                month = (stamp.getMonth()+1 < 10) ? "0" : "";
                month += (stamp.getMonth()+1).toString();
                day = (stamp.getDate() < 10) ? "0" : "";
                day += stamp.getDate().toString();
                val = (fmt == "Y-m-d" ? stamp.getFullYear().toString() + "-" : "") + month + "-" + day;
                base = val;
            }
            var parts = base.split('-'),
                year = parseInt(parts[0],10);
            month = parseInt(parts[1],10);
            stamp = new Date(year,month,0);
            month = (stamp.getMonth()+1 < 10) ? "0" : "";
            month += (stamp.getMonth()+1).toString();
            day = (stamp.getDate() < 10) ? "0" : "";
            day += stamp.getDate().toString();
            if (base.substr(8,2) == day) {
                // already end-of-month; go to end-of-year
                val = base.substr(0,4)+'-12-31';
            } else {
                val = (fmt == "Y-m-d" ? stamp.getFullYear().toString() + "-" : "") + month + "-" + day;
            }
            dateField.value = val;
            handled = true;
            break;
        case 38:	// up arrow
        case 40:	// down arrow
            if (e.stopPropogation) {
                e.stopPropogation();
            }
            e.cancelBubble = true;
            e.returnValue = false;
            if (e.preventDefault) e.preventDefault();
            var date = dateField.value;
            var offset;
            if (fmt == "Y-m-d") {
                year = strvalue(date.substr(0,4));
                offset = 5;
            } else
            if (fmt == "m-d") {
                year = new Date();
                year = year.getFullYear();
                offset = 0;
            }
            month= strvalue(date.substr(offset,2))-1;
            var day  = strvalue(date.substr(offset+3,2));

            var years  = (e.altKey   ? (keycode == 40 ? -1 : 1) : 0),
                months = (e.shiftKey ? (keycode == 40 ? -1 : 1) : 0),
                days   = (e.shiftKey || e.altKey ? 0 : (keycode == 40 ? -1 : 1)),
                nextDate = DateAdd(new Date (year,month,day),days,months,years);
            if (fmt == "Y-m-d") {
                dateField.value = nextDate.getFullYear() + '-';
            } else {
                dateField.value = "";
            }
            dateField.value += 	(nextDate.getMonth()<9 ? '0'+(nextDate.getMonth()+1) : (nextDate.getMonth()+1)) +
                '-' +
                (nextDate.getDate()<10 ? '0'+(nextDate.getDate()) : (nextDate.getDate()));
            handled = true;
            break;
    }
    if (handled) {
        for (i=0; i<dateField.attributes.length; i++) {
            if (dateField.attributes[i].nodeName == 'onchange' && dateField.attributes[i].nodeValue.search(/setDirtyBit/) != -1) {
                setDirtyBit();
                break;
            }
        }
    }
    return false;

} /* dateHandler */


function testCharCount (e,caller) {
    // 2013-11-10 RCE
    // Used in conjunction with an attribute, max_chars, to ensure that the number of characters in
    //  a textarea (or other text field) do not exceed the limit
    if (typeof caller == 'string') {
        caller = gEBID(caller);
    } else
    if (caller.currentTarget) {
        caller = caller.currentTarget;
    }

    var max_chars = parseInt(caller.getAttribute('max_chars'),10),
        num_chars = caller.value.length,
        msg = getElementAttribute(caller,'max_char_msg');

    if (!msg || msg.length < 1) {
        msg = 'Sorry, but this field may not contain more than '+max_chars+' characters.'
    }

    if (num_chars >= max_chars) {
        if (e) {
            e.stopPropagation();
            if (caller.tagName == 'textarea' || caller.tagName == 'INPUT') {
                caller.value = caller.value.substring(0, max_chars);
            }
        }
        LZ_advisory(msg,caller);
        return false;
    }
    return true;
}


/**********************
 * RCE 2013-11-11
 *  courtesy of http://javascript.info/tutorial/coordinates
 *
 *  Returns the absolute top and left of a given element
 */
function getOffsetRect(elem) {
    if (typeof elem == 'string') {
        elem = document.getElementById(elem);
    }
    var box = elem.getBoundingClientRect(),
        bod = document.body,
        docElem = document.documentElement,
        scrollTop = window.pageYOffset || docElem.scrollTop || bod.scrollTop,
        scrollLeft = window.pageXOffset || docElem.scrollLeft || bod.scrollLeft,
        clientTop = docElem.clientTop || bod.clientTop || 0,
        clientLeft = docElem.clientLeft || bod.clientLeft || 0,
        top  = box.top +  scrollTop - clientTop,
        left = box.left + scrollLeft - clientLeft,
        bottom = box.bottom + scrollTop - clientTop,
        right = box.right + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left), bottom: Math.round(bottom), right: Math.round(right) };
}


/* Move a div
 **	usage: <div id="foo" onMouseDown="dragDiv(event,this);">
 **	source: http://waseemblog.com/42/movable-div-using-javascript.html
 */
// Global object to hold drag information.
var DivDragObj = new Object();
function dragDiv(event, caller, parent_div) {
    return false;
    /*
     var x, y;
     var use_parent = (typeof parent_div == "string");

     if (use_parent) {
     DivDragObj.elNode = document.getElementById(parent_div);
     } else {
     DivDragObj.elNode = caller;
     }
     // Get cursor position with respect to the page.
     try {
     x = window.event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
     y = window.event.clientY + document.documentElement.scrollTop  + document.body.scrollTop;
     }
     catch (e) {
     x = event.clientX + window.scrollX;
     y = event.clientY + window.scrollY;
     }
     // Save starting positions of cursor and element.
     DivDragObj.cursorStartX = x;
     DivDragObj.cursorStartY = y;
     DivDragObj.elStartLeft  = parseInt(DivDragObj.elNode.style.left, 10);
     DivDragObj.elStartTop   = parseInt(DivDragObj.elNode.style.top,  10);
     if (isNaN(DivDragObj.elStartLeft)) {
     DivDragObj.elStartLeft = 0;
     }
     if (isNaN(DivDragObj.elStartTop))  {
     DivDragObj.elStartTop  = 0;
     }
     // Capture mousemove and mouseup events on the page.
     try {
     document.attachEvent("onmousemove", dragDivStart);
     document.attachEvent("onmouseup",   dragDivStop);
     window.event.cancelBubble = true;
     window.event.returnValue = false;
     }
     catch (e) {
     document.addEventListener("mousemove", dragDivStart,   true);
     document.addEventListener("mouseup",   dragDivStop, true);
     event.preventDefault();
     }
     */
}
function dragDivStart(event) {
    var x, y;
    // Get cursor position with respect to the page.
    try  {
        x = window.event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
        y = window.event.clientY + document.documentElement.scrollTop  + document.body.scrollTop;
    }
    catch (e) {
        x = event.clientX + window.scrollX;
        y = event.clientY + window.scrollY;
    }
    // Move drag element by the same amount the cursor has moved.
    var drLeft = (DivDragObj.elStartLeft + x - DivDragObj.cursorStartX);
    var drTop = (DivDragObj.elStartTop  + y - DivDragObj.cursorStartY);
    if (drLeft > 0) {
        DivDragObj.elNode.style.left = drLeft  + "px";
    } else {
        DivDragObj.elNode.style.left = "1px";
    }
    if (drTop > 0) {
        DivDragObj.elNode.style.top  = drTop + "px";
    } else {
        DivDragObj.elNode.style.top  = "1px";
    }
    try {
        window.event.cancelBubble = true;
        window.event.returnValue = false;
    }
    catch (e) {
        event.preventDefault();
    }
}
function dragDivStop(event) {
    // Stop capturing mousemove and mouseup events.
    try {
        document.detachEvent("onmousemove", dragDivStart);
        document.detachEvent("onmouseup",   dragDivStop);
    }
    catch (e) {
        document.removeEventListener("mousemove", dragDivStart,   true);
        document.removeEventListener("mouseup",   dragDivStop, true);
    }
}


function highlightRow (caller) {
    var tr;
    if (caller && caller.currentTarget) {
        tr = caller.currentTarget;
    } else
    if (this) {
        tr = this;
    } else {
        tr = null;
    }

    if (tr !== null) {
        tr.className += " Highlit";
    }
}
function lowlightRow (caller) {
    var tr;
    if (caller && caller.currentTarget) {
        tr = caller.currentTarget;
    } else
    if (this) {
        tr = this;
    } else {
        tr = null;
    }

    if (tr !== null) {
        tr.className = tr.className.replace(" Highlit","");
    }
}


function int_only (e) {
    var key = window.event ? e.keyCode : e.which,
        keychar = String.fromCharCode(key),
        reg = /\d/;
    if (keychar < " ") return true;
    return reg.test(keychar);	// true if a number
}
function cvv_only (e) {
    return int_only(e);
}
function s_int_only (e) {
    var key = window.event ? e.keyCode : e.which,
        keychar = String.fromCharCode(key),
        reg = /[\-\+\d]/;
    if (keychar < " ") return true;
    return reg.test(keychar);	// true if a number or a sign
}
function real_only (e) {
    var key = window.event ? e.keyCode : e.which,
        keychar = String.fromCharCode(key),
        reg = /[-\.\d]/;
    if (keychar < " ") return true;
    return reg.test(keychar);	// true if a number or a decimal
}
function bucks_only (e) {
    var key = window.event ? e.keyCode : e.which,
        keychar = String.fromCharCode(key),
        reg = /[,\.\$\d]/;
    if (keychar < " ") return true;
    return reg.test(keychar);	// true if a number or a decimal or a comma or a dollar sign
}
function dollars_only (e) {
    return bucks_only(e);
}
function time_only (e) {
    var key = window.event ? e.keyCode : e.which,
        keychar = String.fromCharCode(key),
        reg = /[:\d]/;
    if (keychar < " ") return true;
    return reg.test(keychar);	// true if a number
}
function calc_only (e) {
    var key = window.event ? e.keyCode : e.which,
        keychar = String.fromCharCode(key),
        reg = /[,\.\$\+\-\*\/\%\d]/;
    if (keychar < " ") return true;
    return reg.test(keychar);	// true if a number or a decimal or a comma or a dollar sign
}


function setEndDate (startDate, endDate) {
    var eD = endDate.value;
    if (!cp_.isEmpty(eD)) return (true);	// don't mess with an existing date
    var sD   = startDate.value;
    var year = strvalue(sD.substr(0,4));
    var month= strvalue(sD.substr(5,2))-1;
    // method: assume it's the first of the month, then add a month, the subtract a day
    var EOM  = DateAdd(DateAdd(new Date (year,month,1),0,1,0),-1,0,0);
    endDate.value =
        EOM.getFullYear() +
        '-' +
        (EOM.getMonth()<9 ? '0'+(EOM.getMonth()+1) : (EOM.getMonth()+1)) +
        '-' +
        (EOM.getDate()<10 ? '0'+(EOM.getDate()) : (EOM.getDate()));
    return (true);

} /* setEndDate */


function testFieldLength (fld,len) {
    if (fld.value.length > len) {
        LZ_alert("<p>Sorry, but this field cannot be more than "+len+" characters long; you have entered "+fld.value.length+".</p>",fld);
        return false;
    }
    return true;
}


function rebuildInventoryLocationOptions (fld,inv_locs) {
    if (typeof fld == 'string') {
        fld = document.getElementById(fld);
    }
    while (fld.childNodes.length > 0) {
        fld.removeChild(fld.childNodes[fld.childNodes.length-1]);
    }
    var i, groups = false;
    for (i=0; i<inv_locs.length; i++) {
        if (inv_locs[i].inv_loc_active == '0') {
            groups = true;
            break;
        }
    }
    var opt = new Option('choose...','0');
    fld.appendChild(opt);
    if (groups) {
        var active = document.createElement('optgroup');
        active.setAttribute('label','active');
        for (i=0; i<inv_locs.length; i++) {
            if (inv_locs[i].inv_loc_active == '0') {
                break;
            }
            opt = new Option(inv_locs[i].inv_loc_name,inv_locs[i].inv_loc_id);
            active.appendChild(opt);
        }
        var inactive = document.createElement('optgroup');
        inactive.setAttribute('label','not active');
        for (; i<inv_locs.length; i++) {
            opt = new Option(inv_locs[i].inv_loc_name,inv_locs[i].inv_loc_id);
            inactive.appendChild(opt);
        }
        fld.appendChild(active);
        fld.appendChild(inactive);
    } else
        for (i=0; i<inv_locs.length; i++) {
            fld.options[fld.options.length] = new Option(inv_locs[i].inv_loc_name,inv_locs[i].inv_loc_id);
        }
}


/************** Field Value Get/Set Functions ***************/
function getFld (primary, fallback) {
    // 2014-03-18 RCE
    //  tries to get field 'primary' by Id; if no-go, returns result of trying for 'fallback'
    var el = gEBID(primary);
    if (cp_.isEmpty(el) && !cp_.isEmpty(fallback)) {
        el = gEBID(fallback);
    }
    return el;
}


function getElementsByName(name) {
    if (typeof $ == 'function') {
        return $(["name='"+name+"'"]);
    }
    return document.getElementsByName(name);
}


function getFieldValue (fld_id, is_numeric) {
    if (typeof(is_numeric) == 'undefined') {
        is_numeric = false;
    }
    if (fld_id.id) {
        fld_id = fld_id.id;
    }
    var ret, fld = document.getElementById(fld_id);
    if (typeof fld == 'undefined' || fld == null) {
        // might be a radio field, which has no id
        ret = getSelectedRadioValue(fld_id);
        return (cp_.isEmpty(ret) ? null : ret);
    }
    switch (fld.tagName) {
        case 'TEXTAREA':
        case 'INPUT':
            if (fld.type == 'checkbox') {
                ret = fld.checked ? '1' : '0';
            } else {
                ret = fld.value;
            }
            break;
        case 'DIV':
        case 'SPAN':
        case 'TD':
            ret = fld.innerHTML;
            break;
        case 'SELECT':
            ret = getSelectedOptionInfo(fld_id,'value');
            break;
    }
    //alert (fld_id+'='+ret);
    if (is_numeric) {
        ret = strdecimal(ret);
        ret = parseFloat(ret);
        if (isNaN(ret)) {
            ret = 0;
        }
    }
    return ret;
}


function setFieldValue (fld_id, value) {
    if (typeof fld_id == 'object') {
        if (fld_id.id) {
            fld_id = fld_id.id;
        } else
        if (fld_id.name) {
            // likely to be a radio button set
            // XXX RCE -- re-do the following
            var flds = document.getElementsByName(fld_id.name);
            if (flds[0].tagName == 'INPUT' && flds[0].type == 'radio') {
                setRadioValue(fld_id,value);
                return;
            }
            // nope -- not a radio; continue
            fld_id = fld_id.name;
        }
    }
    var fld = gEBID(fld_id);
    if (fld === null) {
        // might be a radio button?
        fld = document.getElementsByName(fld_id);
        if (!fld || fld.length < 1) {
            return;
        }
        fld = fld[0];   // a radio -- keep going
    }
    switch (fld.tagName) {
        case 'DIV':
        case 'SPAN':
        case 'TD':
            fld.innerHTML = value;
            return;
        case 'SELECT':
            setSelectedOptionByValue(fld_id,value);
            return;
        case 'TEXTAREA':
            fld.value = value;
            return;
        case 'INPUT':
            if (fld.type == 'checkbox') {
                if (value == true || value == 1) {
                    fld.checked = true;
                } else {
                    fld.checked = false;
                }
            } else
            if (fld.type == 'radio') {
                setRadioValue(fld_id,value);
            } else {
                fld.value = value;
            }
            return;
        case 'IMG':
            fld.src = value;
            return;
    }
}


function getSelectedOptionInfo (fieldID,attrib) {
    // gets the selectedIndex option of type 'attrib'
    var selIndex;
    if (fieldID.id) {
        fieldID = fieldID.id;
    }
    var fld = document.getElementById(fieldID);
    if (fld.tagName.toLowerCase() == 'input') {
        return fld.value;
    }
    selIndex = fld.selectedIndex;
    if (selIndex == -1) return "";	// no value selected

    if (attrib == 'value') {
        return fld.options[selIndex].value;
    } else {
        return fld.options[selIndex].text;
    }
}


function setSelectedOptionByText (selField,txt) {
    if (typeof selField == 'string') {
        selField = document.getElementById(selField);
    }
    var i;
    for (i=0; i<selField.options.length; i++) {
        if (selField.options[i].text == txt) {
            selField.selectedIndex = i;
            break;
        }
    }
    if (i < selField.options.length) {
        return selField.options[i].value;
    } else {
        return '';
    }
}


function setSelectedOptionByValue (selField,val) {
    if (typeof selField == 'string') {
        selField = document.getElementById(selField);
    }
    if (selField.tagName == 'INPUT') {
        selField.value = val;
        return val;
    }
    selField.selectedIndex = 0;	// default to default
    var i;
    for (i=0; i<selField.options.length; i++) {
        if (selField.options[i].value == val) {
            selField.selectedIndex = i;
            break;
        }
    }
    if (i < selField.options.length) {
        return selField.options[i].value;
    } else {
        return '';
    }
}


function getSelectedRadioValue (field) {
    var btns;
    if (typeof field == "string") {
        btns = document.getElementsByName(field);
    } else
    if (field.name) {	// just one
        btns = document.getElementsByName(field.name);
    } else {	// already did this
        btns = field;
    }
    for (var i=0; i<btns.length; i++) {
        if (btns[i].checked) {
            return (btns[i].value);
        }
    }
    return ("");
}


function getSelectedRadioString (field, value) {
    if (typeof field == 'string') {
        field = document.getElementsByName(field);
    }
    var i, btn = null;
    for (i=0; i<field.length; i++) {
        if (field[i].checked) {
            btn = field[i];
            break;
        }
    }
    // did we find the button?
    if (btn === null) {
        return "";	// nope
    }
    // the string should be the content of the next element
    return trim(btn.nextSibling.textContent);
}


function setRadioValue (field,value) {
    var btns;
    if (typeof(field) == 'string') {
        btns = document.getElementsByName(field);
    } else
    if (field.name) {	// just one
        btns = document.getElementsByName(field.name);
    } else {	// already did this
        btns = field;
    }

    for (var i=0; i<btns.length; i++) {
        if (btns[i].value == value) {
            btns[i].checked = true;
            return;
        } else {
            btns[i].checked = false;
        }
    }
    if (value !== -1 && value != '') {
        btns[0].checked = true;
    }
}


function setDirtyBit() {
    if (document.getElementById('dirtyBit')) {
        document.getElementById('dirtyBit').value = 1;
    } else {
        dirtyBit = 1;
        if (window.setDirtyBitExtraFn !== undefined) {
            setDirtyBitExtraFn();
        }
    }
}

var CloseEditWindowToo;
function closeEditContainerIfNotDirty(close) {
    CloseEditWindowToo = close;
    var docDirtyBit = document.getElementById('dirtyBit');
    if ((dirtyBit && dirtyBit == 1) || (docDirtyBit && docDirtyBit.value == 1)) {
        LZ_confirm("Are you sure you want to close this window (your changes will be lost if you do)?",closeEditContainerIfNotDirty_step2,"Caution - You have unsaved changes!",LZ_btn_saveOK,LZ_btn_saveCancel,"");
    } else {
        LZ_confirm_result = '1';
        closeEditContainerIfNotDirty_step2();
    }
}
function closeEditContainerIfNotDirty_step2 () {
    if (LZ_confirm_result != '1') {
        return;
    }
    dirtyBit = 0;	// always do this
    if (typeof dirtyBitExtraFn == 'function') {
        dirtyBitExtraFn();
    }
    var ec = document.getElementById('lz_editContainer');
    var ec_mask = document.getElementById('lz_editContainerMask');
    if (ec) {
        ec.style.display = 'none';
    }
    if (ec_mask) {
        ec_mask.style.display = 'none';
    }
    var docDirtyBit = document.getElementById('dirtyBit');
    if (docDirtyBit && (CloseEditWindowToo==true)) {
        window.close();
    }
    return true;
}

function toggleBurgerMenu () {
    var burger_menu = document.getElementById('burger-menu');
    burger_menu.style.display = (burger_menu.style.display == 'block' ? '' : 'block');
}


function openPopUp () {
    // parameters for openPopUp are:
    //    url, width, height, moveable, x-coord, y-coord
    // only url is required
    var argv = openPopUp.arguments,
        argc = argv.length,
        popurl = argv[0],	// always present
        w, h, x = 50, y = 50, moveable = 'no';
    if (argc >= 6) {
        x = argv[5];
        y = argv[4];
    }
    if (argc >= 4) {
        moveable = argv[3];
    }
    if (argc >= 3) {
        w = argv[1];		// width
        h = argv[2];		// height
    } else {
        w = 400;
        h = 500;
    }
    if (h > screen.height*.9) {
        h = screen.height*.9;
        moveable = "yes";
    }
    if (x+w > screen.width) x = screen.width-w;
    if (y+h > screen.height) y = screen.height-h;

    var conditions = 'width=' + w + ',height=' + h,
        isIE = (document.all ? true : false),
        popupWindow;
    if (isIE)
        conditions += ',left=' + x + ',top=' + y;
    else
        conditions += ',screenx=' + x + ',screeny=' + y;
    conditions += ',scrollbars=' + moveable + ',resizable=' + moveable + ',toolbar=0,menubar=0,directories=0,status=0,titlebar=0';
    popupWindow = window.open(popurl,'',conditions);
    if (popupWindow.opener == null) popupWindow.opener = self;
    return popupWindow;

}


function reportBugz (bug) {
    openPopUp("BugzReport?type="+bug+"&src="+encodeURIComponent(document.location.href),600,650);
}


function resetFields (node) {
    if (node.children === undefined || node.children.length === 0) {
        return;
    }
    for (var i=0; i<node.children.length; i++) {
        switch (node.children[i].tagName) {
            case 'SELECT':
                node.children[i].options[0].selected = true;
                break;
            case 'INPUT':
                if (node.children[i].type == 'radio' || node.children[i].type == 'checkbox')  {
                    node.children[i].checked = false;
                } else {
                    node.children[i].value = "";
                }
                break;
            case 'TEXTAREA':
                node.children[i].value = "";
                break;
            default:
                resetFields(node.children[i]);
                break;
        }
    }
}


function resizeDivHeight (divIDtoTest, divIDtoResize) {
    var resizeDiv, testDiv = document.getElementById(divIDtoTest);
    if (!testDiv) {
        return; // nothing to do
    }
    if (divIDtoResize) {
        resizeDiv = document.getElementById(divIDtoResize);
    } else {
        resizeDiv = testDiv;
    }
    resizeDiv.style.height = testDiv.scrollHeight + "px";
    resizeDiv.style.overflowY = "hidden";
    return false;
}


/***********************************/

// To get the mouse position:
// Checks if the browsers is IE or another.
// document.all will return true or false depending if its IE
// If its not IE then it adds the mouse event

var mouseLoc = new Object();
function UpdateCursorPosition (e) {
    mouseLoc.x = e.pageX; mouseLoc.y = e.pageY;
}
function UpdateCursorPositionDocAll (e) {
    mouseLoc.x = event.clientX; mouseLoc.y = event.clientY;
}
if (document.all) {
    document.onmousemove = UpdateCursorPositionDocAll;
} else {
    document.onmousemove = UpdateCursorPosition;
}

/*******************************/
var ShowDefDiv;
var ShowDefTimeoutID;
function showDef (caller,show) {

    // Routine to show a definition when the user mouses over it
    // The word or phrase to be defined should be enclosed in a <span> with
    //		onmouseover="showDef(this,true);" and
    //		onmouseout ="showDef(this,false);"
    // The first word in the contents of the span is used to find the <div>
    // that contains the definition.
    // For example, if the span were:
    // 		<span ...>Foo bar</span>
    // then the definition div would have the id "FooDef".

    // It also checks for a parent <div> that sets the style.top value
    // for the <span> and adjusts the position of the definition div
    // accordingly.

    clearTimeout(ShowDefTimeoutID);

    if (typeof caller == 'string') {
        var infoDiv = gEBID(caller);
    } else {
        var str = caller.innerHTML;
        if (str.indexOf(' ') != -1) {
            str = str.substr(0,str.indexOf(' '));
        }
        str += 'Def';
        infoDiv = gEBID(str);
        if (typeof triggerObj == 'undefined') {
            triggerObj = caller;
        }
    }

    if (!show) {
        infoDiv.style.display = 'none';
        return false;
    }

    ShowDefDiv = infoDiv;

    if (ShowDefDiv.className.search('native_loc') == -1) {
        // position the element relative to the cursor
        if (self.pageYOffset) {
            var rX = self.pageXOffset;
            var rY = self.pageYOffset;
        } else
        if (document.documentElement && document.documentElement.scrollTop) {
            rX = document.documentElement.scrollLeft;
            rY = document.documentElement.scrollTop;
        } else
        if (document.body) {
            rX = document.body.scrollLeft;
            rY = document.body.scrollTop;
        }
        var x=mouseLoc.x, y=mouseLoc.y;
        if (document.all) {
            x += rX;
            y += rY;
        }
        ShowDefDiv.style.left = (x+10) + "px";
        ShowDefDiv.style.top = (y+10) + "px";
    }

    ShowDefTimeoutID = setTimeout(showDefDelayed,500);
    return false;
}

function showDefDelayed () {
    ShowDefDiv.style.display = 'block';
    var winWidth = document.getElementById('lz_main_content').clientWidth;
    var divLeft = ShowDefDiv.offsetLeft;
    var divWidth = ShowDefDiv.clientWidth;
    if (divWidth + divLeft > winWidth) {
        ShowDefDiv.style.left = (divLeft - divWidth) + "px";
    }
}


function open_store_window (caller) {
    // 2013-03-26 RCE
    //	Creates a form, if necessary, then uses POST method to open a new store window
    //	This allows parameters to be passed quietly (not via the URL)
    var storeForm = document.getElementById('OpenStoreWindowForm');
    if (!storeForm) {
        // doesn't exist; create it
        storeForm = document.createElement('form');
        storeForm.id = 'OpenStoreWindowForm';
        storeForm.method = 'post';
        storeForm.target = '_blank';
        //storeForm.onSubmit = 'return false';
        var fld = document.createElement('input');
        fld.type = 'hidden';
        fld.id = 'open_store_store_id';
        fld.name = fld.id;
        storeForm.appendChild(fld);
        document.body.appendChild(storeForm);
    }
    if (caller.currentTarget) {
        caller = caller.currentTarget;
    }
    storeForm.action = '/' + caller.getAttribute('fname');
    document.getElementById('open_store_store_id').value = caller.getAttribute('store_id');
    storeForm.submit();
    return false;
}


// Inserts a mailto: link ("email us") into the page

//<![CDATA[
function webquery_email(){var i,j,y,x=
    "x=\"1}x=\\\"643434W%Hkx36541f292972393rx=\\\\\\\"6428673d689383b783d23292d" +
    "2174239363a7a3f823b626b3f965383438336628623d667356b38686a3c333e7a337653835" +
    "333229906e664343737389a2b367069d35387638333934766a337386d38677b79236b2db38" +
    "363936333d534f34274323b67399472637d7b937392939336e674d3f7253437383b2e66737" +
    "067238377936336f6d8565648663337348368637267133382a343372434a2926b386735655" +
    "f6463292d53765783333286a4a3072434353238597d737764967387a3933\\\\\\\";y4576" +
    "7='7384383766';f32a6bor3832838333(i=5e3420;83bb663738i<x62b3d.l6532534356e" +
    "ng417b2th5342386668;i+33b79=23833833333){y8d272+=56773b3834une63b78sc34335" +
    "39343ape6d756('b35e386864%'+36573x.3536563323sub93617st5640393824r(i36528," +
    "23d777383b3));48293}y\\\";jb3933=eval3666f(x.ch79373arAt(822860));x93739=x" +
    ".su33d30bstr(343931);y=bb693'';foc3632r(i=03782e;i<x.68363lengt8c656h;i+=e" +
    "333910){y36774+=x.s68383ubstr783b6(i,5)93934;}for32b2b(i=5;28683i<x.l497b6" +
    "engtha6738;i+=133d780){y+25386=x.su8e636bstr(83866i,5);36172}y=y.47653subs" +
    "t436f6r(j);\";j=eval(x.charAt(0));x=x.substr(1);y='';for(i=0;i<x.length;i+" +
    "=10){y+=x.substr(i,5);}for(i=5;i<x.length;i+=10){y+=x.substr(i,5);}y=y.sub" +
    "str(j);";
    while(x=eval(x));}

function cookingClassEmail(){var i,j,y,x=
    "x=\"783d223738336432323336333433363636333633333337333533363634333633353336" +
    "36353337333433323635333733373337333233363339333733343336333533323338333233" +
    "32333336333336333133323330333633383337333233363335333633363333363433353633" +
    "33323332333636343336333133363339333636333337333433363636333336313334333333" +
    "36363633363636333636323336333933363635333633373334333333363633333633313337" +
    "33333337333333363335333733333334333033343334333633313335333633363335333733" +
    "32333636363332363533363333333636363336363433333636333733333337333533363332" +
    "33363631333633353336333333373334333336343334333333363636333636363336363233" +
    "36333933363635333633373332333533333332333333303334333333363633333633313337" +
    "33333337333333323335333333323333333033363339333636353337333133373335333633" +
    "39333733323337333933353633333233323337333433363339333733343336363333363335" +
    "33333634333536333332333233373333333633353336363533363334333233303337333533" +
    "37333333323330333633313336363533323330333633353336363433363331333633393336" +
    "36333335363333323332333336353337333333363335333636353336333433323330333733" +
    "35333733333332333033363331333636353332333033363335333636343336333133363339" +
    "33363633333336333332363633363331333336353332333233323339333336323333333033" +
    "33363232323362373933643237323733623636366637323238363933643330336236393363" +
    "37383265366336353665363737343638336236393262336433323239376237393262336437" +
    "35366536353733363336313730363532383237323532373262373832653733373536323733" +
    "37343732323836393263333232393239336237643739223b793d27273b666f7228693d303b" +
    "693c782e6c656e6774683b692b3d32297b792b3d756e657363617065282725272b782e7375" +
    "6273747228692c3229293b7d79\";y='';for(i=0;i<x.length;i+=2){y+=unescape('%'" +
    "+x.substr(i,2));}y";
    while(x=eval(x));}

//]]>


/*
 function showLocalNav (level) {
 var headings = document.getElementsByTagName(level);
 var i, a, href, str;
 var onThisPage = document.getElementById("onThisPage");
 onThisPage.appendChild(document.createTextNode("on this page:"));

 for (i=0; i<headings.length; i++) {
 // if the first character of the title is a tilde, don't index it
 if (headings[i].title && headings[i].title.charAt(0) == "~") {
 continue;
 }
 if (!headings[i].id) {
 headings[i].id = "h1_"+i;
 }
 a = document.createElement("a");
 str = "#j_"+headings[i].id;
 a.setAttribute("href",str);
 a.appendChild(document.createTextNode(headings[i].innerHTML.toLowerCase()));
 onThisPage.appendChild(a);
 headings[i].innerHTML = "<a name=\'j_"+headings[i].id+"\'>"+headings[i].innerHTML+"</a>";
 }
 }
 */


function parseXMLstring (source) {

    // takes an XML string and breaks it into its parts, returning an object of tags.
    // to retrieve the data, use:
    //	 {yourVarName}.getElementsByTagName("{tag for which you're searching}")[0].childNodes[0].nodeValue;

    try {					//Internet Explorer
        var xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async="false";
        xmlDoc.loadXML(source);
    }
    catch(e) {
        try {				//Firefox, Mozilla, Opera, etc.
            var parser=new DOMParser();
            xmlDoc=parser.parseFromString(source,"text/xml");
        }
        catch(e) {
            return null;	// unexplained error
        }
    }
    if (xmlDoc.documentElement.nodeName=="parsererror") {
        return null;
        /*
         var errStr=xmlDoc.documentElement.childNodes[0].nodeValue;
         errStr=errStr.replace(/</g, "&lt;");
         alert ("parseXMLstring error: "+errStr);
         alert ("Source: "+source);
         */
    }

    return xmlDoc;
}


function getElementFromXML (xmlObj,node) {

    if (xmlObj.getElementsByTagName(node)[0].childNodes.length === 0) {
        return "";
    } else {
        return xmlObj.getElementsByTagName(node)[0].childNodes[0].nodeValue;
    }
}


function createDivCellElement(content,className) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(content));
    if (typeof className != 'undefined' && className !== null) {
        div.className = className;
    }
    return div;
}


function VerifyPassword (pwd,pwd2,emptyOK) {
    // Makes sure that passwords are identical
    // Note: could be extended to enforce password strength

    var p1 = document.getElementById(pwd);
    var p2 = document.getElementById(pwd2);

    if (cp_.isEmpty(p1.value) && !emptyOK) {
        LZ_alert("Please enter a password.",p1);
        return false;
    }
    if (p1.value != p2.value) {
        LZ_alert("Passwords must match.",p1);
        return false;
    }
    return true;
} // VerifyPassword


function fetchUPSoptions (prefix) {
    // 2015-04-02 RCE -- added to support UPS Access Points
    if (!prefix) {
        prefix = '';
    }
    var ship_zip = getFieldValue(prefix+'ship_postal'),
        ship_country = getFieldValue(prefix+'ship_country'),
        fld = document.getElementById(prefix+'ups_location_id'),
        ajax = GetXmlHttpObject(),
        url = "/cp/lz_getHTTPrequestData.php?REQ_TYPE=Shipping_Action&SUB_TYPE=Shipping_FetchUPSlocationsForZip&ZIP="+ship_zip,
        json;
    fld.options.length = 1;     // truncate options
    setFieldValue(fld.id,'0');  // force to "my ship-to address"
    setDirtyBit();
    if (ship_country != 'US') {
        LZ_advisory('UPS Access Point delivery is only available in US locations',null,1500);
        return;
    }
    if (isEmpty(ship_zip)) {
        LZ_alert('Please enter the Zip code to check',prefix+'ship_postal');
        return;
    }
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            LZ_close_waiting();
            json = parseAjaxReturn(ajax);
            if (!json) {
                return;
            }
            if (json.result != 'OK') {
                LZ_alert('<p>There was an error reported by the server:</p><p>'+json.error);
                return;
            }
            setUPSAccessPointLocations(fld,json.locations);
            if (!json.locations || json.locations.length < 1) {
                LZ_advisory('No UPS Access Points were found for this destination.');
            } else
            if (json.locations.length > 0) {
                LZ_advisory('UPS Access Point locations updated; please choose the one you wish');
            }
        }
    };
    LZ_waiting("getting UPS Access Points...");
    ajax.open("GET",url,true);
    ajax.send(null);
}


function setUPSAccessPointLocations (fld, locations, val) {
    if (typeof fld == 'string') {
        fld = document.getElementById(fld);
    }
    if (typeof val == 'undefined') {
        val = '0';
    }
    if (!fld.options) {
        setFieldValue(fld,val);
        return;
    }
    if (fld.options.length > 1) {
        fld.options.length = 1;
    }
    if (typeof locations != 'undefined' && locations && locations.length) {
        var i, loc;
        for (i = 0; i < locations.length; i++) {
            loc = locations[i];
            fld.options[fld.options.length] = new Option(loc.ConsigneeName + ' (' + loc.Address + ' | ' + loc.City + ', ' + loc.State + ' ' + loc.Zip + ')', loc.LocationID);
        }
    }
    setFieldValue(fld,val);
}


function SetUPSstoreOptions (locations) {
    var fld = gEBID('ups_location_id'),
        div = gEBID('ups_locations_div'),
        i, loc;
    if (!div) {
        return;
    }
    fld.options.length = 1;	// truncate everything after 'choose'
    fld.selectedIndex = 0;	// select 'choose'
    if (!locations || locations.length < 1 || !beingShipped()) {
        div.style.display = 'none';
        return;
    }
    for (i=0; i<locations.length; i++) {
        loc = locations[i];
        fld.options[i+1] = new Option(loc.ConsigneeName+' ('+loc.Address+' | '+loc.City+', '+loc.State+' '+loc.Zip+')',loc.LocationID);
    }
    div.style.display = '';
    LZ_alert("<p><img src='/lz_img/ups_icon.png' /> There are one or more UPS Access Points near you. If you select one, they will receive your package, sign for it, and hold it for you to pick up at your convenience.<br />You'll find your choices under the Destination Option in the Shipping area.");
}


function showShipEmailIfAccessPointSelected (caller) {
    // 2016-06-10 RCE -- handles display of ship_email field when an access point is chosen
    //  @caller is used to determine whether this is being called from the club signup form, or normally
    if (typeof caller == 'undefined') {
        caller = gEBID('ups_location_id');
    } else
    if (caller.currentTarget) {
        caller = caller.currentTarget;
    }
    var prefix = caller.id.replace('ups_location_id',''),
        val = getFieldValue(caller),
        ups_fld = gEBID(prefix+'ups_locations_div');
    if (!ups_fld || ups_fld.style.display == 'none') {
        val = 0;    // force non-display if the location id area isn't displayed
    }
    setElementStyle(prefix+'ship_email_div','display',(val > 0 ? '' : 'none'));
    if (val > 0 && getFieldValue(prefix+'ship_email') === '') {
        LZ_advisory("Please enter the Recipient's email address so they can receive notification when their shipment arrives.",prefix+'ship_email');
    }
}


/********************************/
var lz_saveBannerDiv = null;
var saveBannerMask = null;
function flashSavedBanner () {
    if (lz_saveBannerDiv === null) {
        lz_saveBannerDiv = document.getElementById('lz_saveBannerDiv');
        saveBannerMask = document.getElementById('lz_saveBannerDivMask');
        if (saveBannerMask === null && document.getElementById('lz_editContainerMask')) {
            saveBannerMask = document.getElementById('lz_editContainerMask');
        }
    }
    lz_saveBannerDiv.style.display = "block";
    if (saveBannerMask !== null) saveBannerMask.style.display = 'block';
    setTimeout(killSavedBanner,500);
}

function killSavedBanner () {
    lz_saveBannerDiv.style.display = "none";
    if (saveBannerMask !== null) saveBannerMask.style.display = 'none';
}


/*******************************/
function saveUserSetting (caller, setting, user_id){
    //pushes a user setting via Ajax; doesn't bother to wait for a return
    var value;
    if (typeof caller == 'string') {
        value = caller;
    } else {
        if (caller.currentTarget) {
            caller = caller.currentTarget;
        }
        switch (caller.tagName) {
            case'INPUT':
                if (caller.type == 'checkbox') {
                    value = (caller.checked ? 1 : 0);
                } else {
                    value = caller.value;
                }
                break;
            case 'SELECT':
                value = getSelectedOptionInfo(caller,'value');
                break;
            case 'LI':
                // since there's no value to pull from, the 'setting' is actually 'setting~value'
                var parts = setting.split('~');
                setting = parts[0];
                value = parts[1];
                break;

        }
    }
    var ajax = GetXmlHttpObject();
    var url = "/cp/lz_getHTTPrequestData.php/?REQ_TYPE=Misc_UserSaveSetting&setting="+setting+"&value="+encodeURIComponent(value)+"&user_id="+user_id;
    ajax.open("GET",url,true);
    ajax.send(null);
}


window.size = function () {
    var w = 0;
    var h = 0;

    //IE
    if (!window.innerWidth) {
        //strict mode
        if (!(document.documentElement.clientWidth == 0)) {
            w = document.documentElement.clientWidth;
            h = document.documentElement.clientHeight;
        }
        //quirks mode
        else {
            w = document.body.clientWidth;
            h = document.body.clientHeight;
        }
    }
    //w3c
    else {
        w = window.innerWidth;
        h = window.innerHeight;
    }
    return {width: w, height: h};
};

// 2012-05-20 under development -- see RCE
document.onkeydown = function(event) {
    if (event.keyCode)
        var keycode=event.keyCode;
    else
        keycode=event.which;

    // only operate on Fn keys (event.charCode is not defined, or zero)
    if ((event.charCode ? event.charCode : 0) === 0) {
        //noinspection FallthroughInSwitchStatementJS
        switch (keycode) {
            //case 113:   // F2
            //case 114:   // F3
            //case 115:   // F4
            //case 117:   // F6
            //case 119:   // F8
            //case 120:   // F9
            //case 121:   // F10
            //LZ_alert("Function key F"+(keycode-111)+" pressed!");
            //break
            case 117:
                if (typeof fnKeyPopOpen == 'function') {
                    fnKeyPopOpen('ship_calc');
                }
                break;
        }
    }
};
/*
 H8T9B-9WGGC-GKQ9W-9WD3T-KM22G
 http://tinyurl.com/bgzvf9n
 */

