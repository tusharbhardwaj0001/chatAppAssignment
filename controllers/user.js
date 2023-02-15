const  User = require("../models/user");
var jwt = require('jsonwebtoken');


exports.signIn = (req, res) => {
    const {userName, password} = req.body;

    User.findOne({userName}, (err, user) => {
        if(err || !user){
            return res.status(400).json({
                error : "this username doesn't exist"
            });
        }
            
        if(password != user.password)
        {
            return res.json({
                error : "Email and password doesn't match"
            });
        }
 

        //create token
        const token = jwt.sign({ data : user._id }, "secret");

        //put into cookie
        res.cookie("token", token, {expire : Math.floor(Date.now() / 1000) + (60 * 60)});

        res.profile = user;

        // console.log(user);
        //response
        res.status(200).json({
            "token" : token,
            "Id" : user._id,
            "Username" : user.userName
        });
    });

};



exports.signUp = (req, res) => {

    const user = new User(req.body);

    user.save((err, user) => {
        if(err){
            return res.status(400).json({
                err : "Not be able to signup, may be information repeat"
            });
        }
        res.status(200).json({
            name : user.name
        })
    });
};


exports.signOut = (req, res) => {
    res.clearCookie("token");
    res.json({
      message: "User signout successfully"
    });
  };
  


exports.getAllUser = (req, res) => {
    User.find({}, function(err, users) {
        if(err){
            res.json({
                err : "error occour"
            });
        }
        var userMap = {};
    
        users.forEach(function(user) {
          userMap[user._id] = user;
        });

        var token = res.cookie.token;

        console.log(token);
        res.status(200).json({
            // "Token" : token,
            "userList" : userMap
        });  
    });
}



  