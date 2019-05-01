var LocalStrategy = require('passport-local').Strategy;

// Load db 
var db = require('../models');

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });


  //signup
  passport.use("local-signup", new LocalStrategy({
    // by default, local strategy uses username and local_pw, we will override with email
    usernameField: 'email',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },

    function (req, email, password, done) {
      
      process.nextTick(function () {
        db.User.findOne({
          where: {
            email: email
          }
        }).then(function (user, err) {
          //if email is already registered
          if (user) {
            // console.log("user &&&&&&&&&&&&&&&&&&&", user)
            return done(null, false, { 
              from: "signup",
              message: 'This email is already registered.' 
            });
          } else {
            //creating a new account in our database
            // console.log("user ######", user)
            db.User.create({
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: email,
              phone: req.body.phone,
              city: req.body.city,
              state: req.body.state,
              password: db.User.generateHash(password)
            }).then(function (newUser) {
              // console.log("new user", newUser)
              return done(null, newUser)
            }).catch(err => console.log(err))
          }
        })
      })

    }))




  passport.use("local-signin",
    // instead of using default username field, replace email for the username field verification
    new LocalStrategy(
      {
        usernameField: 'email',
        passReqToCallback: true
        // allows us to pass back the entire request to the callback
      }, function (req, email, password, done) {
        // Match user
        db.User.findOne({where:{
          email: email,

        }}).then(function (user, err) {
          
          // if there are any errors, return the error before anything else
          if (err) {
            // console.log("err ^^^^^^^^^^^^", err);
            return done(err);
          }
          // if no user is found, return the message
          if (!user) {
            // console.log("$$$$$$$$$", !user)
            return done(null, false, { 
              from: 'login',
              message: 'Incorrect email/ password combination.'
            }); // req.flash is the way to set flashdata using connect-flash
          }
          // if the user is found but the password is wrong
          if (user && !user.compareHash(req.body.password)) {
            // console.log('%%^^^^%$%$%%wrong password', user, err)
            return done(null, false, { 
              from: 'login',
              message: 'Incorrect email/ password combination.'
            }); // create the loginMessage and save it to session as flashdata
          }
          // all is well, return successful user
        //   console.log("logging in @@@@@@@@@@@@@@@@", user)
          return done(null, user);

        });
      })
  );




};
