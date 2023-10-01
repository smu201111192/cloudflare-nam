import {  Hono } from "hono";
import { IBindings } from "../interfaces/IContext";
import { getDB } from "../utils/getDB";

const highlights = new Hono<{Bindings: IBindings}>();

// FirebaseAuth 추가해줘야 되구요.

highlights.get("/", async (c) => {
  const db = getDB(c.env);
  db.selectFrom('HighlightResource')
    .selectAll()
    .orderBy('HighlightResource.createdAt', 'desc')
    .execute()

});


highlights.get("my-search",async ( c ) => {
    
})

export default highlights;
