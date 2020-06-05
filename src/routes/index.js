var express = require('express');
const fetch = require("node-fetch");
var router = express.Router();


//------------------Constants to used in Haversine Formular--------------
// a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
// c = 2 ⋅ atan2( √a, √(1−a) )
// d = R ⋅ c

const londonLatitude = 51.5074;
const londonLongitude = 0.1278;


function isUserWithin50KmOfLondon(lat2, lon2) {
    const R = 6371e3; // Earth's radius in metres
    const φ1 = londonLatitude * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - londonLatitude) * Math.PI / 180;
    const Δλ = (lon2 - londonLongitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // Distance in metres

    if (Math.abs(d > 50000)) {
        return false;
    } else {
        return true;

    }


}


router.get('/', function (req, res, next) {

// implement fetch for both requests
//      London Users Request:
    const londonUsersInput = "https://bpdts-test-app.herokuapp.com/city/London/users";
    const londonUsersPromise = fetch(londonUsersInput).then(function (res) {
        return res.json();
    }).then(
        function (json) {
            const londonUsersArray = [];
            for (let i = 0; i < json.length; i++) {

                londonUsersArray[i] = json[i].first_name + ' ' + json[i].last_name + ' ' + json[i].email;
            }

            return londonUsersArray;
        });


//      All Users Request:
    const allUsersInput = "https://bpdts-test-app.herokuapp.com/users";
    const allUsersPromise = fetch(allUsersInput).then(function (res) {
        return res.json();
    }).then(
        function (json) {
            const allUsers = [];
            for (let i = 0; i < json.length; i++) {

                if (isUserWithin50KmOfLondon(json[i].latitude, json[i].longitude)) {
                    allUsers.push(json[i].first_name + ' ' + json[i].last_name + ' ' + json[i].email);
                }
            }
            return allUsers;
        });


    Promise.all([londonUsersPromise, allUsersPromise]).then((values) => {
        console.log(values[1]);

        res.render('index', {
            londonUsers: (values[0]),
            allUsers: values[1]
        });
    });
})
;

module.exports = router;
