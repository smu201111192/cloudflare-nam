import { Context } from "hono";

export function getClinetIp(c: Context){
    const clientIP = c.req.headers.get("CF-Connecting-IP");
    return clientIP;
}