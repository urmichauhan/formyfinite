import { Injectable } from "@angular/core";

@Injectable()
export class CommonFunctions {
    constructor(){}

    dataURLtoFile(dataurl:any, filename:any) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        console.log("mime", mime);
        return new File([u8arr], filename, {type:mime});
    }

    /**
     * Adds number of (count) (character)s before (val)
     * Example Input: val=1133, count=6, character=0
     * Output: 001133
     * 
     * Example Input: val=pen, count=7, character='d'
     * Output: ddddpen
     * 
     * @param val: string
     * @param count: number
     * @param character: string|number
     */
    addPrefix(val:any, count:any, character:any) {
        return val.length < count ? new Array(count - val.length).fill(character).join('').concat(val) : val;
    }

    /**
     * Return indian format currency from number
     * @param x: string | number
     */
    getIndianFormatCurrency(x: string | number) {
        x=x.toString();
        var floatValue = null;
        if(new RegExp('.').test(x)) {
          floatValue = x.split('.')[1];
          x = x.split('.')[0];
        }
        var lastThree = x.substring(x.length-3);
        var otherNumbers = x.substring(0,x.length-3);
        if(otherNumbers != '')
            lastThree = ',' + lastThree;
        var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
        
        if(floatValue != null) {
          res = res+'.'+floatValue;
        }
        return res;
    }
}
