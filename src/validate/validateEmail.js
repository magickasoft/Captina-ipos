const Errors = {
    INVALID_CHARACTERS: "The email address you entered contains invalid characters." +
    "\nAllowable characters are letters, numbers, periods, dashes, underscores, and the @ sign." +
    "\nPlease enter a valid email address.",
    DOMAIN_INVALID: "The top-level domain appears invalid (for example, there's no '.com' in the address). Please enter a valid email address.",
    EMAIL_EMPTY: 'Field email cannot be empty',
    EMAIL_INVALID: "There's no '@' sign in your email address. Please enter a valid email address."
};

const validTLDs = ":com:net:org:edu:gov:aero:biz:coop:info:museum:name:pro:ad:ae:af:ag:ai:" +
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

export function validateEmail(email) {
    var newstr = "",
        at = false,
        i,
        re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!email) {
        return Errors.EMAIL_EMPTY;
    }

    i = email.lastIndexOf('.');
    tld = ':' + email.substr(i + 1) + ':';

    if (validTLDs.search(tld) == -1) {
        return Errors.DOMAIN_INVALID;
    }

    var ch;
    for (i = 0; i < email.length; i++) {
        ch = email.substring(i, i + 1);

        if ((ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z")
            || (ch == "@") || (ch == ".") || (ch == "_")
            || (ch == "-") || (ch >= "0" && ch <= "9")) {
            newstr += ch;
            if (ch == "@") {
                if (at == true) { //only one per address!
                    at = false;
                    break;
                }
                at = true;
            }
        }
    }

    if (!at) {
        return {email, error: Errors.EMAIL_INVALID};
    }

    if (newstr.length != email.length) {
        return Errors.INVALID_CHARACTERS;
    }

    if (re.test(email)) {
        return false;
    }

    // return {email: email}
}