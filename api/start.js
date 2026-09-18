import 'dotenv/config';
import mongoose from 'mongoose';
import {createApp} from './app.js';
const app=createApp();
await mongoose.connect(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017/formyfinite');
const server=app.listen(process.env.PORT||3000,()=>console.log('FormYfinite is running.'));
for(const name of ['SIGINT','SIGTERM'])process.on(name,()=>server.close(async()=>{await mongoose.disconnect();process.exit(0)}));
