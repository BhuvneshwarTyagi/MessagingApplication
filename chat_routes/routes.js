const express=require("express");
const router=express.Router();

const status=require("./status_web_socket");

router.use("status",status);





module.exports=router;