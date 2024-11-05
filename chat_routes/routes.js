const express=require("express");
const router=express.Router();

const messages=require("./initialChatFetch");

router.use("/messages",messages);





module.exports=router;