import {randomBytes,scrypt as scryptCallback,timingSafeEqual,createHash,createCipheriv,createDecipheriv} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
export const digest=s=>createHash('sha256').update(s).digest('hex');
export async function hashPassword(p){const salt=randomBytes(16).toString('hex');const result=await scrypt(p,salt,64);return salt+':'+result.toString('hex');}
export async function matches(p,stored){const [salt,value]=stored.split(':');return timingSafeEqual(Buffer.from(value,'hex'),await scrypt(p,salt,64));}
export function vault(hex){if(!/^[a-f0-9]{64}$/i.test(hex||''))throw Error('Set DATA_ENCRYPTION_KEY to 64 hexadecimal characters');const key=Buffer.from(hex,'hex');return {seal(value){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);const data=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final()]);return {iv:iv.toString('hex'),data:data.toString('base64'),tag:cipher.getAuthTag().toString('hex')};},open(value){const cipher=createDecipheriv('aes-256-gcm',key,Buffer.from(value.iv,'hex'));cipher.setAuthTag(Buffer.from(value.tag,'hex'));return JSON.parse(Buffer.concat([cipher.update(Buffer.from(value.data,'base64')),cipher.final()]).toString());}};}
