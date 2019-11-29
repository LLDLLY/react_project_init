const key = "lkmndsvlsdkjbvoirjgeorepelkdmvvvposddddddffawls,f[wpef";

export default class Base64 {

    static encode(input, binary) {
        binary = (binary != null) ? binary : false;

        if (!input) return null;

        if (!binary)
        {
            input = Base64.utf8Encode(input);
        }

        let output = "";
        let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        let i = 0;
        input = this.utf8Encode(input);
        while(i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if(isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if(isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                key.charAt(enc1) + key.charAt(enc2) +
                key.charAt(enc3) + key.charAt(enc4);
        }

        return output;
    }


    static decode(input) {
        if (!input) return null;

        let output = "";
        let chr1, chr2, chr3;
        let enc1, enc2, enc3, enc4;
        let i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while(i < input.length) {
            enc1 = key.indexOf(input.charAt(i++));
            enc2 = key.indexOf(input.charAt(i++));
            enc3 = key.indexOf(input.charAt(i++));
            enc4 = key.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if(enc3 !== 64) {
                output = output + String.fromCharCode(chr2);
            }
            if(enc4 !== 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = this.utf8Decode(output);
        return output;
    }

    static utf8Encode(string) {
        if (!string) return '';

        let str = string.replace(/\r\n/g, "\n");
        let utfText = "";
        for(let n = 0; n < str.length; n++) {
            let c = str.charCodeAt(n);
            if(c < 128) {
                utfText += String.fromCharCode(c);
            } else if((c > 127) && (c < 2048)) {
                utfText += String.fromCharCode((c >> 6) | 192);
                utfText += String.fromCharCode((c & 63) | 128);
            } else {
                utfText += String.fromCharCode((c >> 12) | 224);
                utfText += String.fromCharCode(((c >> 6) & 63) | 128);
                utfText += String.fromCharCode((c & 63) | 128);
            }

        }
        return utfText;
    }

    static utf8Decode(utfText) {
        if (!utfText) return '';
        let string = "";
        let i = 0;
        let c = 0;
        let c2 = 0;
        let c3 = 0;
        let text = utfText;
        while(i < text.length) {
            c = text.charCodeAt(i);
            if(c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if((c > 191) && (c < 224)) {
                c2 = text.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = text.charCodeAt(i + 1);
                c3 = text.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }

        return string;
    }

}

