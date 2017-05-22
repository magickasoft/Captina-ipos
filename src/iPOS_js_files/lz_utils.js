//
// Javascript utility functions
// Created by RCE & others

var PERMISSION_NONE = 0;
var PERMISSION_READ= 10;
var PERMISSION_WRITE = 20;
var SUPER_USER = 100;
var CAPTINA_ADMIN = 1000;
var USE_HQ_STATE = "USEHQ";
// temperature-controlled shipping constants
var TC_do_nothing = 0;
var TC_cleanup = 1;
var TC_no_alert = 2;
var TC_drop_tc = 4;
var TC_include_if_ever_avail = 8;
// Miscellaneous constants
var EMPTY_OK = 1;
var EMPTY_NOT_OK = 0;
var CC_MASK_OK = 1;
var CC_MASK_NOT_OK = 0;

// OTHER USEFUL VARIABLES
var CURRENT_URL = document.URL;
var DAY_IN_MILLISECONDS = 1000*60*60*24;



// are we in the back-end?
function inManageOrders () {
    return (typeof LowestLoadedID == 'undefined' ? false : true);
}


var CC_AcceptVisaMC = null,
    CC_AcceptAmex = null,
    CC_AcceptDiscover = null;
function CheckCreditCard (cardField,emptyOK,maskOK) {

    // Test credit card number for validity
    // Created 2001-04-03 by RCE
    // Modified 2002-08-21 by RCE
    //   added 'emptyOK' to allow user to tab
    //   out of field during data entry
    //
    var checkdigit = 0,
        checksum = 0,
        checkStr = getFieldValue(cardField),
        digitStr = "",	// for storage of the digits only
        digitnumber = 0;

    if (maskOK == null) {
        maskOK = CC_MASK_NOT_OK;
    }

    if (typeof cardField == 'string') {
        cardField = gEBID(cardField);
    }
    if (cardField.type == 'hidden') {
        return (true);
    }

    if (cp_.isEmpty(checkStr)) {
        if (emptyOK == EMPTY_NOT_OK) {
            LZ_alert("<p>Please enter your credit card number.</p>",cardField);
            return (false);
        } else {
            return (true);
        }
    }

    if (maskOK==CC_MASK_OK && checkStr.substr(1,7) == "XXX-XXX") {	// masked? accept it
        return (true);
    }

    // Run through the number backwards
    for (var i = checkStr.length-1; i >= 0; i--) {
        // first strip out all but numbers
        checkdigit = checkStr.charCodeAt(i) - 48;
        if ((checkdigit >= 0) && (checkdigit <= 9)) {
            digitStr += checkStr.charAt(i);	// Save the digit for later
            digitnumber += 1;			// Note: counts 1..n+1, not 0..n
            if (digitnumber % 2 == 0)
                checkdigit *= 2;		// Even? Double it
            if (checkdigit > 9)
                checkdigit = checkdigit-9;	// Too big? Reduce by 9 (same as adding digits)
            checksum += checkdigit;		// Add to checksum
        }
    }
    if (digitStr == "7200000007004" || digitStr == "5100000000004245") {
        // test numbers - fine as is
        return (true);
    }
    if (CC_AcceptVisaMC === null) {
        var ajax = GetXmlHttpObject();
        var url="/cp/lz_getHTTPrequestData.php?REQ_TYPE=Misc_GetPref&pref=which_ccs_accepted";
        ajax.open("GET",url,false);	// synchronous call
        ajax.send(null);
        // wait
        var json;
        try {
            json = JSON.parse(ajax.responseText);
        }
        catch (e) {
            json = new Object;
            json.visa_mc = "0";
            json.amex = "0";
            json.discover = "0";
        }
        CC_AcceptVisaMC     = (json.visa_mc == '1' ? true : false);
        CC_AcceptAmex       = (json.amex == '1' ? true : false);
        CC_AcceptDiscover   = (json.discover == "1" ? true : false);
    }

    // test for card compatibility
    var msg = '', ok_cards = 0, cardOK = true;
    if (digitStr.length == 16) {
        // Must be Visa, MC, or Discover
        switch (digitStr.charAt(15)) {
            case '4':
            case '5':
                if (!CC_AcceptVisaMC) {
                    cardOK = false;
                }
                break;
            case '6':
                if (!CC_AcceptDiscover) {
                    cardOK = false;
                }
                break;
            default:
                cardOK = false;
        }
    } else
    if (digitStr.length == 15) {
        if (digitStr.charAt(14) != '3') {
            cardOK = false;
        }
    } else {
        cardOK = false;
    }
    if (!cardOK) {
        // build the error message
        if (CC_AcceptVisaMC) {
            if (!CC_AcceptDiscover && !CC_AcceptAmex) {
                msg += 'Visa and MasterCard';
            } else {
                msg += 'Visa, MasterCard';
            }
            ok_cards = 2;
        }
        if (CC_AcceptDiscover) {
            if (msg > '') {
                msg += ', ';
                if (!CC_AcceptAmex) {
                    msg += 'and ';
                }
            }
            msg += 'Discover';
            ok_cards++;
        }
        if (CC_AcceptAmex) {
            if (msg != '') {
                msg += ', and '
            }
            msg += 'American Express'
            ok_cards++;
        }
        if (msg > '') {
            msg = '<p>Sorry, we only accept ' + msg + (ok_cards > 0 ? ' cards' : '');
        } else {
            msg = '<p>Sorry, we do not accept credit cards';
        }
        msg += '.</p><p>Please try again.</p>';
        LZ_alert(msg,cardField,'','wide_alert');
        return false;
    }

    if ((checksum % 10) !== 0) {
        LZ_alert("<p>Please re-check your credit card number.</p>",cardField);
        return (false);
    }

    // digitStr now has the card number, backwards.
    // Reverse it.
    checkStr = digitStr;
    digitStr = "";
    var len = checkStr.length;
    for (i = len-1; i>=0; i--) {
        digitStr += checkStr.charAt(i);
    }

    // Now format the string correctly
    // Format it as XXXX-XXXX-XXXX-XXXX, using digitStr.

    if (digitStr.length == 16) {
        cardField.value = digitStr.substr(0,4) + "-" +
            digitStr.substr(4,4) + "-" +
            digitStr.substr(8,4) + "-" +
            digitStr.substr(12,4);
    } else {
        cardField.value = digitStr.substr(0,4) + "-" +
            digitStr.substr(4,4) + "-" +
            digitStr.substr(8,3) + "-" +
            digitStr.substr(11,4);
    }

    return (true);
} /* CheckCreditCard */


function Today () {
    // 2013-11-10 RCE -- added to return today's *local* datetime in a Date() object
    //  backs out the offset from UTC according to the user's computer, then adds back the server's understanding of the offset
    var d = new Date(),
        utc_time = d.getTime() + (d.getTimezoneOffset() * 60000),
        localtime =  utc_time + UTC_OFFSET;

    return new Date(localtime);
}


function CheckEmail (emailField,emptyOK) {
    // RCE added new email validation routine from Netscape 10-23-2001
    // Also modified to ensure it contains a valid top-level domain
    // 2002-08-21 RCE added broader TLD testing

    if (typeof emailField == 'string') {
        emailField = gEBID(emailField);
    } else
    if (emailField.value === undefined && emailField.currentTarget) {
        // handle condition where caller isn't passing parameters
        emailField = emailField.currentTarget;
        emptyOK = true;
    }
    if (emailField.type == 'hidden') {
        return (true);
    }
    var emails = emailField.value.toLowerCase().split(','),
        i;

    for (i=0; i<emails.length; i++) {
        emails[i] = trim(emails[i]);
        if (!checkOneEmail (emailField,emails[i],emptyOK)) {
            return false;
        }
    }

    emailField.value = emails.join(',');
    return true;


} /* CheckEmail() */


var validTLDs = ":com:net:org:edu:gov:aero:biz:coop:info:museum:name:pro:ad:ae:af:ag:ai:" +
    "al:am:an:ao:aq:ar:as:at:au:aw:az:ba:bb:bd:be:bf:bg:bh:bi:bj:bm:bn:" +
    "bo:br:bs:bt:bv:bw:by:bz:ca:cc:cf:cg:ch:ci:ck:cl:cm:cn:co:cr:cs:cu:" +
    "cv:cx:cy:cz:de:dj:dk:dm:do:dz:ec:ee:eg:eh:er:es:et:fi:fj:fk:fm:fo:" +
    "fr:fx:ga:gb:gd:ge:gf:gh:gi:gl:gm:gn:gp:gq:gr:gs:gt:gu:gw:gy:hk:hm:" +
    "hn:hr:ht:hu:id:ie:il:in:io:iq:ir:is:it:jm:jo:jp:ke:kg:kh:ki:km:kn:" +
    "kp:kr:kw:ky:kz:la:lb:lc:li:lk:lr:ls:lt:lu:lv:ly:ma:mc:md:mg:mh:mk:" +
    "ml:mm:mn:mo:mp:mq:mr:ms:mt:mu:mv:mw:mx:my:mz:na:nc:ne:nf:ng:ni:nl:" +
    "no:np:nr:nt:nu:nz:om:pa:pe:pf:pg:ph:pk:pl:pm:pn:pr:pt:pw:py:qa:re:" +
    "ro:ru:rw:sa:sb:sc:sd:se:sg:sh:si:sj:sk:sl:sm:sn:so:sr:st:su:sv:sy:" +
    "sz:tc:td:tf:tg:th:tj:tk:tm:tn:to:tp:tr:tt:tv:tw:tz:ua:ug:uk:um:us:" +
    "uy:uz:va:vc:ve:vg:vi:vn:vu:wf:ws:ye:yt:yu:za:zm:zr:zw:int:mil:arpa:nato:";

function checkOneEmail (emailField, email, emptyOK) {
    var newstr = "",
        at = false,
        dot = false,
        i,
        tld = "",
        msg,
        re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (cp_.isEmpty(email) && (emptyOK == true)) {
        return true;
    }

    // 2014-04-13 RCE -- added this regexp as the core test; the other method, below, wasn't doing the job
    if (re.test(email)) {
        return true;
    }
    // if it falls through this test, see if we can figure out what's wrong

    // Pull the putative TLD and validate it against the acceptable set
    // This involves pulling the tail-end of the field, from the final '.',
    // and comparing it to the list of acceptable TLDs in validTLDs.  Note
    // that the validTLD string has every valid TLD bracketed by colons,
    // so that .co (=":co:") doesn't match .com (=":com:").
    i = email.lastIndexOf('.');
    tld = ':'+email.substr(i+1)+':';
    //tld = tld.substr(0,tld.search(/\./));			// find the '.' and copy to it
    //tld = ":" + reverseStr(tld).toLowerCase() + ":";	//This becomes the search string
    if (validTLDs.search(tld) == -1) {
        msg = "<p>The top-level domain appears invalid (for example, there's no '.com' in the address).</p><p>Please enter a valid email address.</p>";
        if (emailField === false) {
            return msg;
        }
        if (typeof LZ_alert == 'function') {
            LZ_alert(msg,emailField);
        } else {
            alert(msg);
            emailField.focus();
        }
        return false;
    }


    for (i = 0; i < email.length; i++) {
        ch = email.substring(i, i + 1)
        if ((ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z")
            || (ch == "@") || (ch == ".") || (ch == "_")
            || (ch == "-") || (ch >= "0" && ch <= "9")) {
            newstr += ch;
            if (ch == "@") {
                if (at == true) { //only one per address!
                    at = false;
                    break;
                }
                at=true;
            }
        }
    }
    if (!at) {
        msg = "<p>There's no '@' sign in your email address.</p><p>Please enter a valid email address.</p>";
        if (emailField === false) {
            return msg;
        }
        if (typeof LZ_alert == 'function') {
            LZ_alert(msg,emailField);
        } else {
            alert(msg);
            emailField.focus();
        }
        return false;
    }
    if (newstr.length != email.length) {	// invalid characters were not copied
        msg = "<p>The email address you entered contains invalid characters."+
            "<br />Allowable characters are letters, numbers, periods, dashes, underscores, and the @ sign. </p>"+
            "<p>Please enter a valid email address.</p>";
        if (emailField === false) {
            return msg;
        }
        if (typeof LZ_alert == 'function') {
            LZ_alert(msg,emailField);
        } else {
            alert(msg);
            emailField.focus();
        }
        return false;
    }

    // something else is wrong; just return a generic error
    if (!emailField) {
        return '<p>Please enter a valid email address.</p>';
    }
    LZ_alert('<p>Please enter a valid email address.',emailField);
    return false;
}


function CheckPhoneNumber (phoneField, emptyOK) {

    if (typeof phoneField == 'string') {
        phoneField = gEBID(phoneField);
    }

    var checkStr = phoneField.value,
        newStr = "",
        digits = 0,
        prefix,
        country;

    if (phoneField.type == 'hidden' || (cp_.isEmpty(checkStr) && (emptyOK == true))) {
        return (true);
    }
    prefix = phoneField.id.substring(0, 5);
    country = getFieldValue(prefix + 'country');
    if (country === null) {
        country = 'US';
    } else
    if (country != 'US' && country != 'CA') {
        return true;	// anything goes
    }
    // no country field, or country is USA or Canada -- 10-digit phone number please
    for (var i = 0; i < checkStr.length; i++) {
        var ch = checkStr.charAt(i);
        if (ch >= "0" && ch <= "9") {
            digits++;
            newStr += ch;
        }
    }
    if ((digits != 10)) {
        LZ_alert("<p>Please enter a valid phone number.</p>", phoneField);
        return (false);
    }
    setFieldValue(phoneField,"(" + newStr.substr(0, 3) + ") " + newStr.substr(3, 3) + "-" + newStr.substr(6, 4));
    return (true);
}


function CheckTime (fld, emptyOK) {
    if (cp_.isEmpty(fld.value) && emptyOK == true) {
        return true;
    }
    // time fields should have been governed by time_only()
    var parts = fld.value.split(':');
    if (parts.length != 2) {
        LZ_alert('<p>Time fields take a 24-hour time in the form hh:mm; please enter a valid time.</p>',fld);
        return false;
    }
    if (cp_.isEmpty(parts[0]) || parseInt(parts[0],10) > 23) {
        LZ_alert("<p>The hour portion must be between 00 and 23; please enter a valid time.</p>",fld);
        return false;
    }
    if (cp_.isEmpty(parts[1]) || parseInt(parts[1],10) > 59) {
        LZ_alert("<p>The minute portion must be between 00 and 59; please enter a valid time.</p>",fld);
        return false;
    }
    fld.value = TimeFormatted(fld.value).substr(0,5);
    return true;
}


function makeStringSafe (fld) {
    if (fld.currentTarget) {
        fld = fld.currentTarget;
    }
    var str_in = getFieldValue(fld),
        str_out = str_in.replace(/"/g,"'");
    if (str_out != str_in) {
        setFieldValue(fld,str_out);
        LZ_advisory('Double quotes are not permitted; they have been changed to single quotes.',fld,1000);
    }
}


/******************************/
// ZIP & Postal Code routines
/******************************/
function CheckZIP (zipField,emptyOK,countryCode) {

    if (typeof zipField == 'string') {
        zipField = gEBID(zipField);
    }

    if (zipField.type == 'hidden') return (true);

    var zip = getFieldValue(zipField);

    if (typeof countryCode == 'undefined' || countryCode === null) {
        var i, prefix="", parts = zipField.id.split('_');
        if (parts.length > 1) {
            for (i=0; i<parts.length-1; i++) {
                prefix += parts[i]+'_';
            }
            countryCode = getFieldValue(prefix+'country');
            if (cp_.isEmpty(countryCode)) {
                countryCode = 'US';
            }
        } else {
            countryCode = '-1';
        }
    }

    if (countryCode == '-1') {  // -1 means "choose..."
        var which = zipField.id.split('_')[0]+'_';
        countryCode = getFieldValue(which+'country');
        if (countryCode === null) {
            // no country code field
            return true;
        }
        LZ_alert('<p>Please choose the country, then enter the zip/postal code.</p>',which+'country');
        return false;
    }

    if (countryCode == 'USA') {
        countryCode = 'US';
    }

    if (countryCode != 'US' && countryCode != 'CA') {   // only US and Canada validation
        return true;
    }

    // format field
    var checkStr, str = zip.replace(/[ -]/g,'').toUpperCase();	//strip spaces and dashes; capitalize
    if (cp_.isEmpty(str) && emptyOK) {
        return false;	// false forces ZipLookup to return; it also stops an untimely submit()
    }
    if (countryCode == 'US') {
        checkStr = str.substr(0,5);
        if (str.length > 5) {
            checkStr += '-'+str.substr(5);
        }
    } else {
        checkStr = str.substr(0,3) + ' ' + str.substr(3);
    }
    setFieldValue(zipField,checkStr);
    if (!isValidPostalCode(checkStr,countryCode)) {
        if (countryCode == 'US') {
            LZ_alert('<p>Please enter your zipcode.</p><p>(Note: enter zipcode only; city and state information are retrieved automatically)</p>',zipField,null,'wide_alert');
        } else {
            LZ_alert('<p>Please enter a valid Canadian Postal Code.</p><p>(Note: enter zipcode only; city and state information are retrieved automatically)</p>',zipField,null,'wide_alert');
        }
        return false;
    }
    return true;

} /* CheckZIP */


function isValidPostalCode(postalCode, countryCode) {
    if (!countryCode) {
        countryCode = 'US';
    }
    switch (countryCode) {
        case 'US':
            postalCodeRegex = /^\d{5}(?:[-\s]*\d{4})?$/;
            break;
        case 'CA':
            postalCodeRegex = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;
            break;
        default:
            postalCodeRegex = /^(?:[A-Z0-9]+(?:[-\s]?[A-Z0-9]+)*)?$/;
    }
    var ret = postalCodeRegex.test(postalCode);
    return ret;
}


var StateJSON = [
    {"abbr":"AL","name":" Alabama","cntry":"US"},
    {"abbr":"AK","name":" Alaska","cntry":"US"},
    {"abbr":"AZ","name":" Arizona","cntry":"US"},
    {"abbr":"AR","name":" Arkansas","cntry":"US"},
    {"abbr":"CA","name":" California","cntry":"US"},
    {"abbr":"CO","name":" Colorado","cntry":"US"},
    {"abbr":"CT","name":" Connecticut","cntry":"US"},
    {"abbr":"DE","name":" Delaware","cntry":"US"},
    {"abbr":"DC","name":" District Of Columbia","cntry":"US"},
    {"abbr":"FL","name":" Florida","cntry":"US"},
    {"abbr":"GA","name":" Georgia","cntry":"US"},
    {"abbr":"HI","name":" Hawaii","cntry":"US"},
    {"abbr":"ID","name":" Idaho","cntry":"US"},
    {"abbr":"IL","name":" Illinois","cntry":"US"},
    {"abbr":"IN","name":" Indiana","cntry":"US"},
    {"abbr":"IA","name":" Iowa","cntry":"US"},
    {"abbr":"KS","name":" Kansas","cntry":"US"},
    {"abbr":"KY","name":" Kentucky","cntry":"US"},
    {"abbr":"LA","name":" Louisiana","cntry":"US"},
    {"abbr":"ME","name":" Maine","cntry":"US"},
    {"abbr":"MD","name":" Maryland","cntry":"US"},
    {"abbr":"MA","name":" Massachusetts","cntry":"US"},
    {"abbr":"MI","name":" Michigan","cntry":"US"},
    {"abbr":"MN","name":" Minnesota","cntry":"US"},
    {"abbr":"MS","name":" Mississippi","cntry":"US"},
    {"abbr":"MO","name":" Missouri","cntry":"US"},
    {"abbr":"MT","name":" Montana","cntry":"US"},
    {"abbr":"NE","name":" Nebraska","cntry":"US"},
    {"abbr":"NV","name":" Nevada","cntry":"US"},
    {"abbr":"NH","name":" New Hampshire","cntry":"US"},
    {"abbr":"NJ","name":" New Jersey","cntry":"US"},
    {"abbr":"NM","name":" New Mexico","cntry":"US"},
    {"abbr":"NY","name":" New York","cntry":"US"},
    {"abbr":"NC","name":" North Carolina","cntry":"US"},
    {"abbr":"ND","name":" North Dakota","cntry":"US"},
    {"abbr":"OH","name":" Ohio","cntry":"US"},
    {"abbr":"OK","name":" Oklahoma","cntry":"US"},
    {"abbr":"OR","name":" Oregon","cntry":"US"},
    {"abbr":"PA","name":" Pennsylvania","cntry":"US"},
    {"abbr":"PR","name":" Puerto Rico","cntry":"USextra"},
    {"abbr":"RI","name":" Rhode Island","cntry":"US"},
    {"abbr":"SC","name":" South Carolina","cntry":"US"},
    {"abbr":"SD","name":" South Dakota","cntry":"US"},
    {"abbr":"TN","name":" Tennessee","cntry":"US"},
    {"abbr":"TX","name":" Texas","cntry":"US"},
    {"abbr":"UT","name":" Utah","cntry":"US"},
    {"abbr":"VT","name":" Vermont","cntry":"US"},
    {"abbr":"VA","name":" Virginia","cntry":"US"},
    {"abbr":"VI","name":" Virgin Islands","cntry":"USextra"},
    {"abbr":"WA","name":" Washington","cntry":"US"},
    {"abbr":"WV","name":" West Virginia","cntry":"US"},
    {"abbr":"WI","name":" Wisconsin","cntry":"US"},
    {"abbr":"WY","name":" Wyoming","cntry":"US"},
    {"abbr":"AB","name":" Alberta","cntry":"CA"},
    {"abbr":"BC","name":" British Columbia","cntry":"CA"},
    {"abbr":"MB","name":" Manitoba","cntry":"CA"},
    {"abbr":"NB","name":" New Brunswick","cntry":"CA"},
    {"abbr":"NL","name":" Newfoundland","cntry":"CA"},
    {"abbr":"NT","name":" Northwest Territories","cntry":"CA"},
    {"abbr":"NS","name":" Nova Scotia","cntry":"CA"},
    {"abbr":"NU","name":" Nunavut","cntry":"CA"},
    {"abbr":"ON","name":" Ontario","cntry":"CA"},
    {"abbr":"PE","name":" Prince Edward Island","cntry":"CA"},
    {"abbr":"QC","name":" Quebec","cntry":"CA"},
    {"abbr":"SK","name":" Saskatchewan","cntry":"CA"},
    {"abbr":"YT","name":" Yukon Territory","cntry":"CA"}
];
function getStateName (abbr) {
    for (var i=0; i<StateJSON.length; i++) {
        if (StateJSON[i].abbr == abbr) {
            return StateJSON[i].name;
        }
    }
    return "";
}


var LookingUpZip = false;
function ZipLookup (fld,emptyOK,prefix,tc_action) {

    if (!emptyOK) {
        emptyOK = true;
    }

    var which, countryFld, countryCode;
    if (typeof fld == 'string') {
        fld = gEBID(fld);
    }
    if (typeof prefix == 'string') {
        which = prefix;
    } else {
        which = fld.id.substr(0,5);
    }
    countryFld = gEBID(which+"country");
    if (!countryFld) {
        countryCode = 'US';
    } else {
        countryCode = getFieldValue(countryFld);
        if ((countryCode == '-1' || cp_.isEmpty(countryCode)) && (tc_action & TC_no_alert)) {
            // suppress the error message in CheckZIP if the caller doesn't want alerts
            countryCode = 'US';
        }
    }

    if (!CheckZIP(fld,emptyOK,countryCode)) return false;

    if (tc_action === null || which != "ship_") {
        tc_action = TC_do_nothing;
    }

    LookingUpZip = true;
    var url = "/cp/lz_getHTTPrequestData.php?REQ_TYPE=Misc_Action&SUB_TYPE=Misc_ZipLookup&ZIP="+getFieldValue(fld)+"&COUNTRY="+countryCode+"&tc_action="+tc_action,
        json = ajaxSynchronousGET(url);
    // next step won't execute until a response comes back
    LookingUpZip = false;
    if (!json || json.error == 1) return false;	// no need to notify

    if (json.result == 'ZIP_NOT_FOUND') {
        LZ_alert('<p>Error: '+fld.value+' does not appear to be a valid Zip code.</p><p>Please check the value and try again.</p>',fld);
        return false;
    }

    // 2015-02-14 RCE: changed to look for state echo, not base state field
    var state_fld = gEBID(which+"state_echo");
    if (state_fld !== null) {
        setFieldValue(which+"state",json.state);
        setFieldValue(which+"city",json.city);
        if (gEBID(which+"state_echo")) {
            setFieldValue(which+"state_echo",json.state);
            setFieldValue(which+"city_echo",json.city);
        }
    } else {
        // nothing here to do; return the json output
        return json;
    }

    // update the shipping methods dropdown based on new destination state, if this is a ship-to
    // 2014-07-01 RCE -- re-thought this one through; it should update just the field in fld,
    //      which might be any of a number of elements
    if (which == "ship_") {
        json = updateShippingOptions(json,fld,tc_action);
    }

    if (typeof ZipLookupAfterFn == 'function') {
        ZipLookupAfterFn();
    }

    if (which == 'ship_' && typeof last_ship_meth != 'undefined') {
        ship_meth = getFieldValue(ship_meth_fld);
        if (last_ship_meth != ship_meth && (typeof UserID == 'undefined' || cp_.isEmpty(UserID))) {
            LZ_alert('Shipping methods have changed based on the destination you selected. Please choose a shipping method.', ship_meth_fld);
        }
    }

    if (which == "ship_" && json.TC_ship_meth && (tc_action & TC_cleanup) && !(tc_action & TC_no_alert)) {
        LZ_alert(json.TC_ship_string);
    }

    return false;
}


function CommaFormatted(amount,showZero,showDollarSign,decimals) {
    if (amount === undefined || amount === null || Math.abs(amount) < 0.00001) {
        amount = '0';
    }
    if (typeof decimals == 'undefined') {
        decimals = 2;
    }
    amount = strdecimal(amount).toString();	// strip all but numeric-related characters
    amount += '';

    amount = parseFloat(amount).toFixed(decimals).toString();

    var x = amount.split('.'),
        x1 = x[0],
        x2 = x.length > 1 ? '.' + x[1] : '',
        rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    amount = x1 + x2;
    if (showZero == false && parseFloat(amount) === 0) {
        return '';
    }
    if (showDollarSign) {
        amount = '$' + amount;
    }
    return amount;

} 


function TimeFormatted (val) {
    if (val === undefined || val === null) {
        val = '00:00';
    }
    var h, s, p = val.split(':');
    h = p[0];
    s = p[1];
    if (h === null) h = '0';
    if (s === null) s = '0';
    h = parseInt(h,10);
    s = parseInt(s,10);
    if (h > 23) h = 0;
    if (s > 59) s = 0;
    h = h.toString();
    s = s.toString();
    if (h.length < 2) h = '0'+h;
    if (s.length < 2) s = '0'+s;
    return h+':'+s+':00';
}


function DateAdd(startDate, numDays, numMonths, numYears) {
    // 2013-10-23 RCE -- rewrote to properly deal with DST (and FMIADS, BTW)
    var returnDate = new Date(startDate.getTime()),
        yearsToAdd = numYears,
        month = returnDate.getMonth() + numMonths,
        tz_offset_1 = returnDate.getTimezoneOffset(),
        millisecs,
        tz_offset_2;

    // first, deal with Month, which goes 0..11
    // if it goes over 11, bring it back down and add a year
    if (month > 11) {
        yearsToAdd = Math.floor((month+1)/12);
        month -= 12*yearsToAdd;
        yearsToAdd += numYears;
    }
    returnDate.setMonth(month);
    returnDate.setFullYear(returnDate.getFullYear()+ yearsToAdd);

    // set day of month
    millisecs = DAY_IN_MILLISECONDS*numDays;
    returnDate.setTime(returnDate.getTime()+millisecs);

    // now, figure out whether there's been a change in offset from UTC -- for example, due to Daylight Savings
    // if so, that hour needs to be added or subtracted
    tz_offset_2 = returnDate.getTimezoneOffset();
    millisecs = 60 * (tz_offset_2 - tz_offset_1) * 1000;
    returnDate.setTime(returnDate.getTime()+millisecs);

    return returnDate;

}


function parseFloatNumber (nbr,decimals) {
    var val = parseFloat(nbr);
    if (cp_.isEmpty(val) || isNaN(val)) {
        val = 0;
    }
    return val.toFixed(decimals);
}

function evalCalcValue (value) {
    if (value.value) {
        value = value.value;
    }
    try {
        value = parseFloat(eval(value.replace("%","/100"))).toFixed(2);
    }
    catch (e) {
        value = parseFloat(value).toFixed(2);
    }
    return value;
}

function isEmpty (inStr) {
    if (typeof inStr == 'undefined' || inStr === null || inStr === "" || inStr == "null" || inStr == "NaN") {
        return true;
    }
    if (typeof inStr == 'number') {
        return inStr === 0;
    }
    if (typeof inStr == 'object') {
        return inStr.length > 0;
    }
    if (typeof inStr == 'string' && (inStr == '0000-00-00' || inStr === '0')) {
        return true;
    }
    if (inStr.replace) {
        var s = inStr.replace(/^\s+/,'').replace(/\s+$/,'');
        return ((s.length == 0) || (s == ""));
    }
    if (typeof inStr == 'boolean') {
        return inStr;
    }
} /* isEmpty */

var cp_ = {
    isEmpty: function (inStr) {
        if (typeof inStr == 'undefined' || inStr === null || inStr === "" || inStr == "null" || inStr == "NaN") {
            return true;
        }
        if (typeof inStr == 'number') {
            return inStr === 0;
        }
        if (typeof inStr == 'object') {
            return inStr.length > 0;
        }
        if (typeof inStr == 'string' && (inStr == '0000-00-00' || inStr === '0')) {
            return true;
        }
        if (inStr.replace) {
            var s = inStr.replace(/^\s+/,'').replace(/\s+$/,'');
            return ((s.length == 0) || (s == ""));
        }
        if (typeof inStr == 'boolean') {
            return inStr;
        }
    }
};


function strdecimal (inStr) {
    // TODO -- probably better to use a RegEx
    // strips everything but the numbers, minus sign, and decimal point
    var outStr = "";
    inStr = inStr.toString();	// make sure we're dealing with a string
    for (var i=0; i<inStr.length; i++) {
        var thisChar = inStr.charAt(i);
        if ((thisChar >= '0' && thisChar <= '9') || thisChar == '.' || thisChar == '-') outStr += thisChar;
    }
    if (outStr == "") outStr = "0.00";
    return (parseFloat(outStr));

} 


function strvalue (inStr) {
    var outStr = "";
    for (var i=0; i<inStr.length; i++) {
        var thisChar = inStr.charAt(i);
        if (thisChar >= '0' && thisChar <= '9') outStr += thisChar;
    }
    return (Math.floor(outStr));

}


function strip_spaces (inStr) {
    return inStr.split(' ').join('');
}


/******************************
 ** This Javascript code trim implementation removes all leading and trailing occurrences of a set of characters specified.
 ** If no characters are specified it will trim whitespace characters from the beginning or end or both of the string.
 ******************************/
function trim(str, chars) {
    return ltrim(rtrim(str, chars), chars);
}

function ltrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}

function rtrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}



//////////////////////
/// Prototypes
//////////////////////
if(!Array.indexOf) {	// effing IE
    Array.prototype.indexOf = function(obj) {
        for (var i=0; i<this.length; i++) {
            if (this[i]==obj) {
                return i;
            }
        }
        return -1;
    }
}

String.prototype.capitalize = function() {
    // capitalizes first letter in each word
    return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
};

