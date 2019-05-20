var db = require("../models")

module.exports = {
    create: function (req, res, parentId) {
        if (req.isAuthenticated()) {
            db.kids.create({
                name: req.body.name,
                gradeLevel: req.body.gradeLevel,
                //get parentId from the result of creating a parent row
                parentId: req.session.passport.user.id,
                schoolId: req.body.schoolId
            }).then(function (result) {
                res.json(result)
            })
        }
    },

    //update kids info function as a stretch goal
    update: function(req,res){
        if (req.isAuthenticated()) {
            db.kids.update(
                {   //Fields to update 
                    name: req.body.name,
                    gradeLevel: req.body.gradeLevel,
                    schoolId: req.body.schoolId
                }, {
                    where: {
                        parentId: req.session.passport.user.id
                    }
                }).then(function (result) {
                    res.json(result)
                })
                .catch(err => res.status(422).json(err));
        }
    },
    // find all kids for a specific parent
    findAllKidsForAParent: function (req, res) {
        console.log("Logged Parent id ", req.session.passport.user.id); 
        db.kids.findAll({
            where: {
                parentId: req.session.passport.user.id
            },
            include: [
                {
                    model: db.schools,
                    as: "school", 
                    required: true
                }
            ]
        }).then(function (result) {
            console.log("All kids info for a parent: ", result);
            res.json(result)
        })
        .catch(err => res.status(422).json(err));
    },
}
