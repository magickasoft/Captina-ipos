// JavaScript Document
//
// yui2.js
// written by RCE 2012-01-07 to eliminate need for YUI


/**
*** LZ_alert
**	Author: RCE
**	Created: 2012-01-18
**	Presents the user with a modal dialog with information and an "OK" button
**	Parameters:
**		message 	- required; can contain HTML or just text
**		focus_field	- optional; if provided, the focus will be placed on that field when the user presses OK. May be an object or the string ID
**		title		- optional; if not provided, the dialog title will be set to "Attention"
**		className	- optional; added to outer alert div if present
**		timeout		- optional; if present, causes the alert to close automatically in N milliseconds if no user action
**	Note - the value chosen by the user is available in the global variable LZ_confirm_result.
**/
var LZ_no_waiting_alerts = false;   // set True to prevent LZ_waiting from popping up and closing other alerts
var LZ_alert_focus_field;

// DKL 2013-07-08 - added function argument, to be called on OK click
// RCE 2013-07-23 - added test for already-open alert; if present, then
//                  append the new message to it rather than close an open
//                  alert that the user may not have had time to process
function LZ_alert(message, focus_field, title, className, timeout, okFunction) {
    var target = LZ_create('alert'),
        bod = document.getElementById('lz_alert_body_normal');

    if (target.style.display == 'block' && bod.style.display != 'none') {
        // there's already a normal alert open
        // append to it
        bod.appendChild(document.createElement('hr'));
        if (message.substr(0,1) != '<') {
            // not a tag? add a <p>
            message = '<p>' + message;
        }
        bod.innerHTML += message;
        target.className = 'wide_alert';
        return;
    } else {
        // something may be open, and we want to clean up any residual info
        LZ_closeAllAlerts();
    }

    LZ_alert_focus_field = focus_field;
    if (typeof title == 'undefined' || isEmpty(title)) {
        title = 'Attention';
    }
    document.getElementById('lz_alert_header_title').innerHTML = title;
    bod.innerHTML = LZ_wrap_message(message);
    bod.style.display = '';
    document.getElementById('lz_alert_body_waiting').style.display = 'none';

    LZ_add_class_name(className);

    // set up buttons
    document.getElementById('lz_alert_buttons').style.display = '';
    document.getElementById('lz_alert_ok_btn').style.display = '';
    document.getElementById('lz_alert_confirm_ok_btn').style.display = 'none';
    document.getElementById('lz_alert_confirm_cancel_btn').style.display = 'none';
    // if valid function is passed, attach to button onclick event
    if (typeof okFunction === "function") {
        document.getElementById('lz_alert_ok_btn').onclick = okFunction;
    }

    target.style.display = 'block';
    //LZ_center_dialog(target);

    document.getElementById('lz_alert_ok_btn').focus();
    if (typeof timeout != 'undefined' && !isEmpty(timeout)) {
        setTimeout(LZ_closeAllAlerts,timeout);
    }
}


function LZ_advisory (message, anchor, timeout, icon) {
    // 2013-11-11 RCE -- created to pop up a simple advisory message that auto-closes
    //  @message -- html content of the advisory
    //  @anchor  -- optional field against which to anchor the message (default is center/center on screen)
    //  @timeout -- how long to leave the advisory open (default = 3 seconds)
    //  @icon    -- 'warning' (default) is a yellow warning triangle (famfamfam/error.png)
    //              'error' is an exclamation point in a red circle (famfamfam/exclamation.png)
    //              'ok' is a green check mark (famfamfam/tick.png)
    //              'time' is a clock (famfamfam/time.png)
    //              'waiting' is an animated gif

    if (LZ_no_waiting_alerts === false) {
        LZ_closeAllAlerts();
    }
    var div = document.createElement('div'),
        loc_x, loc_y, box, height, alert_div;

    div.id = 'LZ_advisory_div';
    div.innerHTML = message;

    if (anchor) {
        if (typeof anchor == 'string') {
            anchor = document.getElementById(anchor);
        }
        // tie it to a location
        box = getOffsetRect(anchor);
        loc_y = box.top;
        loc_x = box.left;
        if (typeof anchor == 'object') {
            anchor = anchor.id;
        }
    } else {
        anchor = '';
    }

    div.setAttribute('anchor',anchor);
    div.onclick = LZ_advisory_close;

    if (icon) switch (icon) {
        case 'error':
        case 'ok':
        case 'time':
        case 'waiting':
            div.className = icon;
            break;
    }

    alert_div = document.getElementById('lz_alert_wrapper');
    if (typeof alert_div != 'undefined' && alert_div && alert_div.style.display == 'block') {
        // put this in the footer of the open alert div
        div.style.right = '16px';
        div.style.top = '6px';
        document.getElementById('lz_alert_buttons').appendChild(div);
    } else {
        // stand-alone advisory
        document.body.appendChild(div);
        if (anchor != '') {
            height = div.clientHeight + 5;  // +5 to float it above the field
            div.style.left = loc_x + 'px';
            div.style.top  = Math.max(0,(loc_y-height)) + 'px';
        } else {
            div.className = 'fixed ' + div.className;
        }
    }
    div.style.display = 'block';

    if (typeof timeout == 'undefined' || !timeout) {
        timeout = 3000;
    }

    // if there's an anchor, put the focus on that field
    if (anchor != '') {
        LZ_highlight_bad_field(anchor);
    }

    setTimeout(LZ_advisory_close, timeout);

}

function LZ_advisory_close () {
    var anchor = null,
        div = document.getElementById('LZ_advisory_div');
    if (div) {
        anchor = document.getElementById(div.getAttribute('anchor'));
        div.parentNode.removeChild(div);
    }
    if (anchor) {
        anchor.className = anchor.className.replace(' lz_alert_error_fld_bg','');  // remove backlight if present
        anchor.focus();
    }
}

function LZ_highlight_bad_field (anchor) {
    anchor = document.getElementById(anchor);
    anchor.className += ' lz_alert_error_fld_bg';
    anchor.focus();
}



/**
*** LZ_waiting
**	Author: RCE
**	Created: 2012-01-18
**	Puts op a modal window that lets the user know something is happening. May only be cancelled from within the program.
**	Parameters:
**		header	 	- required; can contain HTML or just text
**		msg			- optional; if present, it becomes the body of the dialog; if not, then a "loading..." gif is presented
**		className	- optional; added to outer wait div if present
**
**	Note - call LZ_close_waiting() to close the window
**/
function LZ_waiting (header, msg, className) {
    if (LZ_no_waiting_alerts == true) {
        // show an advisory instead
        LZ_advisory(header,null,500,'waiting');
        return;
    }
    LZ_closeAllAlerts();    // waiting overrides anything else
    var target = LZ_create('wait'),
        lz_body = document.getElementById('lz_alert_body_waiting');

    // clean out anything that's lingering
    if (lz_body.hasChildNodes()) {
        while (lz_body.childNodes.length >= 1) {
            lz_body.removeChild(lz_body.firstChild);
        }
    }

    document.getElementById('lz_alert_header_title').innerHTML = header;

    if (typeof msg != 'undefined' && !isEmpty(msg)) {
        lz_body.innerHTML = LZ_wrap_message(msg);
    }

    LZ_add_class_name(className);

    lz_body.style.display = '';
    document.getElementById('lz_alert_body_normal').style.display = 'none';
    document.getElementById('lz_alert_buttons').style.display = 'none';

    target.style.display = 'block';

}

function LZ_close_waiting () {
    if (LZ_no_waiting_alerts === false) {
        LZ_closeAllAlerts();
    }
}


function LZ_close_alert_if_waiting () {
    if (document.getElementById('lz_alert_body_normal').style.display == 'none') {
        LZ_close_waiting();
    }
}



/**
*** LZ_confirm
**	Author: RCE
**	Created: 2012-01-18
**	Replaces confirm() functionality, sort of
**	The calling function must end after the LZ_confirm() call; all subsequent steps must be in stepTwoFn.
**	Parameters:
**		message 	- required; can contain HTML or just text
**		stepTwoFn	- required; the function to be called once the user makes a selection
**		title		- optional; set to "Attention" if empty/missing
**		btn1		- optional.  JSON format (see below)
**		btn2		- ditto
**		className	- optional; added to outer confirm div if present
**	Note - the value chosen by the user is available in the global variable LZ_confirm_result.
**	Note - there is an event listener attached to the second button that takes return, escape, or space as an activator
**/
var LZ_confirm_stepTwoFn;
var LZ_confirm_result;
var LZ_btn_ok_green = {"text":"Yes - continue","value":"1","btn_color":"green"};
var LZ_btn_cancel_red = {"text":"No - cancel","value":"0","btn_color":"red"};
var LZ_btn_saveOK = {"text":"Yes - close","value":"1","btn_color":"green"};
var LZ_btn_saveCancel = {"text":"No - cancel","value":"0","btn_color":"blue"};


function LZ_confirm (message, stepTwoFn, title, btn1, btn2, className) {
    LZ_closeAllAlerts();
    var target = LZ_create('confirm'),
        bod = document.getElementById('lz_alert_body_normal'),
        btn_confirm_ok = document.getElementById('lz_alert_confirm_ok_btn'),
        btn_confirm_cancel = document.getElementById('lz_alert_confirm_cancel_btn');
    LZ_confirm_stepTwoFn = stepTwoFn;
    bod.innerHTML = LZ_wrap_message(message);
    bod.style.display = '';
    document.getElementById('lz_alert_body_waiting').style.display = 'none';
    if (typeof title == 'undefined' || isEmpty(title)) {
        title = 'Attention';
    }
    document.getElementById('lz_alert_header_title').innerHTML = title;

    if (typeof className == 'undefined') {
        className = 'wide_alert';
    }
    LZ_add_class_name(className);

    // set up the buttons
    document.getElementById('lz_alert_buttons').style.display = '';
    document.getElementById('lz_alert_ok_btn').style.display = 'none';
    btn_confirm_ok.style.display = '';
    btn_confirm_cancel.style.display = '';

    if (typeof btn1 == 'undefined') {
        btn1 = {"text":"OK", "value":"1", "btn_color":"blue"};
    }
    if (typeof btn2 == 'undefined') {
        btn2 = {"text":"Cancel", "value":"0", "btn_color":"red"};
    }
    if (btn2 !== null && btn1.value == btn2.value) {
        var ajax = GetXmlHttpObject();
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                alert ("Error reported to Captina.");
            }
        }
        var msg = "Identical button values in LZ_confirm for message '"+message+"\n\nbtn1: "+JSON.stringify(btn1)+"\n\nbtn2: "+JSON.stringify(btn2);
        var url = '/cp/lz_getHTTPrequestData.php?REQ_TYPE=Misc_CaptinaErrorNotification&module=LZ_confirm&msg='+msg;
        ajax.open("GET",url,true);
        ajax.send(null);
        alert("Sorry - we've encountered an error; support is being notified.");
        LZ_confirm_result = '0';
        stepTwoFn();
    }

    btn_confirm_ok.className = "lz_btn_"+btn1.btn_color+" lz_alerts_btn_10";
    btn_confirm_ok.value = btn1.value;
    btn_confirm_ok.innerHTML = btn1.text;
    btn_confirm_ok.onclick = LZ_confirm_capture;
    if (btn2 === null) {
        btn_confirm_cancel.innerHTML = '';
        btn_confirm_ok.focus();
    } else {
        btn_confirm_cancel.className = "lz_btn_" + btn2.btn_color + " lz_alerts_btn_10";
        btn_confirm_cancel.value = btn2.value;
        btn_confirm_cancel.innerHTML = btn2.text;
        btn_confirm_cancel.onclick = LZ_confirm_capture;
        btn_confirm_cancel.focus();
    }

    target.style.display = 'block';

}

function LZ_confirm_capture (caller) {
    if (caller.currentTarget) {
        caller = caller.currentTarget;
    }
    LZ_confirm_result = caller.getAttribute('value');
    LZ_closeAllAlerts();
    LZ_confirm_stepTwoFn();
}



function LZ_get_params (form_html, step2fn, title, action_btn_str, close_btn_str, className) {
    /* 2013-05-21 RCE
    **  pops up a dialog with the inner html in form_html
    **  designed to get data from the user, then return it to the step2fn
    */
    LZ_closeAllAlerts();
    var target = LZ_create('params'),
        btn_confirm_ok = document.getElementById('lz_alert_confirm_ok_btn'),
        btn_confirm_cancel = document.getElementById('lz_alert_confirm_cancel_btn');

    form_html = LZ_wrap_message(form_html);
    form_html = '<form id="get_params_form" onsubmit="return false;"></div>' + form_html + '</form>';
    document.getElementById('lz_alert_body_normal').innerHTML = form_html + '<div id="lz_params_response_div"></div>';
    document.getElementById('lz_alert_header_title').innerHTML = title;

    if (typeof className == 'undefined') {
        className = '';
    }
    LZ_add_class_name(className);

    // set up buttons
    btn_confirm_ok.className = 'lz_btn_blue lz_btn_10';
    btn_confirm_cancel.className = 'lz_btn_red lz_btn_10';
    if (typeof action_btn_str =='undefined' || action_btn_str == '') {
        action_btn_str = 'submit';
    }
    if (typeof close_btn_str =='undefined' || close_btn_str == '') {
        close_btn_str = 'close';
    }
    btn_confirm_ok.innerHTML = action_btn_str;
    btn_confirm_cancel.innerHTML = close_btn_str;
    document.getElementById('lz_alert_ok_btn').style.display = 'none';
    btn_confirm_ok.style.display = '';
    btn_confirm_cancel.style.display = '';
    // if valid function is passed, attach to button onclick event
    if (typeof step2fn === "function") {
        btn_confirm_ok.onclick = step2fn;
    }
    btn_confirm_cancel.onclick = LZ_closeAllAlerts;

    document.getElementById('lz_alert_body_waiting').style.display = 'none';
    document.getElementById('lz_alert_body_normal').style.display = '';
    document.getElementById('lz_alert_buttons').style.display = '';
    target.style.display = 'block';

    document.getElementById('lz_alert_confirm_ok_btn').focus();
}
function LZ_params_capture (caller) {
    if (caller.currentTarget) {
        caller = caller.currentTarget;
    }
    LZ_confirm_result = caller.getAttribute('value');
    if (LZ_confirm_result == '1') {
        // simple error checking

    }
    LZ_confirm_stepTwoFn(document.getElementById('get_params_form'));
}



function LZ_create (which) {
    // creates the alert container and contents if they don't already exist
    var target = document.getElementById('lz_alert_wrapper');
    if (typeof target == 'undefined' || target == null) {
        var wrapper = document.createElement('div'),
            innards = document.createElement('div'),
            header  = document.createElement('header'),
            title   = document.createElement('h1'),
            content = document.createElement('div'),
            body    = document.createElement('div'),
            footer  = document.createElement('footer'),
            buttons = document.createElement('div'),
            button  = document.createElement('button');

        title.id = 'lz_alert_header_title';
        header.appendChild(title);
        innards.appendChild(header);

        body.id = 'lz_alert_body_normal';
        content.appendChild(body);
        body = document.createElement('div');
        body.id = 'lz_alert_body_waiting';
        content.appendChild(body);
        content.id='lz_alert_body_wrapper';
        innards.appendChild(content);

        button.id = 'lz_alert_ok_btn';
        button.innerHTML = 'OK';
        button.onclick = LZ_closeAllAlerts;
        button.className = 'lz_btn_blue lz_btn_10';
        buttons.appendChild(button);
        button = document.createElement('button');
        button.id = 'lz_alert_confirm_ok_btn';
        buttons.appendChild(button);
        button = document.createElement('button');
        button.id = 'lz_alert_confirm_cancel_btn';
        buttons.appendChild(button);
        buttons.id = 'lz_alert_buttons';
        footer.appendChild(buttons);
        innards.appendChild(footer);

        innards.id = 'lz_alert_innards';
        wrapper.appendChild(innards);
        wrapper.id = 'lz_alert_wrapper';
        document.body.appendChild(wrapper);
        target = document.getElementById('lz_alert_wrapper');
    }

    return target;
}


function LZ_center_dialog (dialog) {
    var iw_wid = document.getElementById('lz_inner_wrapper');
    if (iw_wid !== null) {
        iw_wid = iw_wid.clientWidth;
    } else {
        iw_wid = document.body.clientWidth;
    }
    var cl_wid = dialog.clientWidth;
    var left = Math.round((iw_wid - cl_wid) / 2) + 'px';
    dialog.style.left = left;
}


function LZ_add_class_name (className) {
    if (typeof className == 'undefined' || className === null) {
        className = '';
    }
    document.getElementById('lz_alert_innards').className = className;
}


function LZ_closeAllAlerts () {
    // clean out the innards of the body
    var bod = document.getElementById('lz_alert_body_normal');
    if (bod) {
        bod.innerHTML = '';
        document.getElementById('lz_alert_wrapper').style.display = '';
        // and reset any added class name
        document.getElementById('lz_alert_innards').className = '';
    }
    LZ_advisory_close();
    LZ_no_waiting_alerts = false;
    if (typeof LZ_alert_focus_field == 'object' && LZ_alert_focus_field !== null) {
        LZ_alert_focus_field.focus();
    } else
    if (typeof LZ_alert_focus_field == 'string') {
        var fld = document.getElementById(LZ_alert_focus_field);
        if (isEmpty(fld)) {
            // might be a radio element
            fld = document.getElementsByName(LZ_alert_focus_field);
            if (!isEmpty(fld) && fld.length > 0) {
                var display = fld[0].style.display;
                fld[0].style.display = 'none';
                setTimeout(function () {
                    fld[0].style.display = display;
                    fld[0].checked=true;
                    fld[0].click();
                }, 500);
            }
        } else {
            fld.focus();
        }
    }
}


function LZ_alert_listener (e,caller) {
    var keyCode = e.keyCode;
    if (keyCode == 13 || keyCode == 27 || keyCode == 32) {
        switch (caller.id) {
            case 'lz_alert_div_foot_btn':
                e.stopPropagation();
                LZ_closeAllAlerts();
                break;
            case 'lz_confirm_btn2':
                e.stopPropagation();
                LZ_confirm_capture(caller);
                break;

        }
    }
}


function LZ_wrap_message (message) {
    if (message.charAt(0) != '<') {
        message = '<p>'+message;
    }
    return message;
}

function Y_alert (message, focus_field, title, width, height, className) {
    LZ_alert (message, focus_field, title, className);
}

function Y_wait (header,msg) {
    LZ_waiting(header,msg);
}

