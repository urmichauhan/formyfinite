import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {randomBytes} from 'node:crypto';
import {createApp} from '../api/app.js';
const database=await MongoMemoryServer.create();await mongoose.connect(database.getUri());
const port=Number(process.env.PORT||3000);const app=createApp({key:randomBytes(32).toString('hex'),production:false,origin:`http://localhost:${port}`});
const server=app.listen(port,()=>console.log(`Temporary demo: http://localhost:${port}. Register an account. Data disappears when stopped.`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await mongoose.disconnect();await database.stop();process.exit(0)}));
