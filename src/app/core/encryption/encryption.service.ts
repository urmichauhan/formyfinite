import { Injectable } from '@angular/core';
declare var require: any
var CryptoJS = require("sjcl");
import { Base64Service } from './base64.service'
// import { toBase64String } from '@angular/compiler/src/output/source_map';
@Injectable({
    providedIn: 'root'
})
export class EncryptionService {

    constructor(private Base64: Base64Service) { }
    encrypt(dataToEncrypt:any, aesPublicKey:any) {
       console.log(dataToEncrypt);
        var hash = CryptoJS.hash.sha256.hash(dataToEncrypt);
        var payloadHash = CryptoJS.codec.hex.fromBits(hash);
        var ct, p;
        var timestamp = (new Date()).toISOString();
        var iv = timestamp.substr(timestamp.length - 8);
        var key = CryptoJS.codec.hex.fromBits(CryptoJS.random.randomWords(32, 0));

        p = {
            adata: "",
            iter: 1000,
            mode: "ccm",
            ts: parseInt("64"),
            ks: parseInt("256"),
            iv:  this.Base64.encode(iv),
            salt:  this.Base64.encode(iv)
        };
        ct = CryptoJS.encrypt(key, dataToEncrypt, p);
        ct = JSON.parse(ct);

        var encryptedRawPayload =  this.Base64.encode(ct.ct);
        var encryptedRandomKey = "";

        {
            var randomCT, randomPayload;

            randomPayload = {
                adata: "",
                iter: 1000,
                mode: "ccm",
                ts: parseInt("64"),
                ks: parseInt("256"),
                iv: this.Base64.encode(iv),
                salt:  this.Base64.encode(iv)
            };

            randomCT = CryptoJS.encrypt(aesPublicKey, key, randomPayload);
            randomCT = JSON.parse(randomCT);

            encryptedRandomKey = this.Base64.encode(randomCT.ct);
        }

        var headers = {
            'key': encryptedRandomKey,
            'hash': payloadHash,
            'timestamp': timestamp,
            'Content-Type': 'text/html'
        };

        var request = {
            "rawPayload": encryptedRawPayload,
            "headers": headers
        };
        return request;

    }
    decrypt(randKey:any, timeStamp:any, responseHash:any, encryptedRes:any, aesPublicKey:any) {

        var decryptedKey = this.decryptAES(this.Base64.decode(randKey),
            aesPublicKey, timeStamp);


        var decryptedResponse = this.decryptAES(this.Base64.decode(encryptedRes),
            decryptedKey, timeStamp);

        var hash = CryptoJS.hash.sha256.hash((decryptedResponse));



        var payloadHash = CryptoJS.codec.hex.fromBits(hash);
        if (payloadHash !== responseHash) {
            decryptedResponse = "{error: 'Malformed response'}";
        }
        return decryptedResponse;
    }
    decryptAES(encryptedData:any, key:any, timestamp:any) {

        var rp = {};
        var plaintext;
        var iv = timestamp.substr(timestamp.length - 8);
        try {
            let ciphertext = encryptedData;

            var dataToDecrypt = {
                "iv": this.Base64.encode(iv),
                "salt": this.Base64.encode(iv),
                "ct": ciphertext,
                "mode": "ccm",
                "v": 1,
                "ks": 256,
                "iter": 1000,
                "adata": "",
                "ts": 64
            }

            plaintext = CryptoJS.decrypt(key, JSON.stringify(dataToDecrypt), {}, rp);

        } catch (e) {
            console.log(e);
            return;
        }
        return plaintext;
    }

}
