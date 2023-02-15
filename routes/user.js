const express = require("express");
var { expressjwt: jwt } = require("express-jwt");
const router = express.Router();

const {signUp, signIn, signOut, getAllUser} = require("../controllers/user.js");

router.post("/signup", signUp);

router.post("/signin", signIn );

router.get("/signout", signOut);

router.get("/users", jwt({secret : "secret", algorithms: ["HS256"]}), getAllUser);


module.exports = router;