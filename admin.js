const express = require("express");
const app = express();
const mysql = require('mysql2');
const CryptoJS = require("crypto-js");
const router = express.Router();
const cors = require("cors");
app.use(cors());

const callback = "https://frontend1234.onrender.com/";

// db configuration
const conn = mysql.createPool({
    host: 'gator3403.hostgator.com',
    user: 'jazcoeit',
    password: 'Jaz@quickserve',
    database: 'jazcoeit_quickserve',
  });
  
// create a promise of pool
const promiseConn = conn.promise();

router.get('/', async (req, res) => {
    res.send("<b>Admin Panel Backend - Routes</b><br><li>/data/useridhere - Get admin data</li><li>/newpass/useridhere - Update admin password</li>");
});

// get the admin data with correct userid
router.get('/data/:userid', async (req, res) => {

      const userid = req.params.userid; // get from uri
      const sql = 'SELECT userid, email, firstName, lastName FROM users WHERE isEmployee = 1 AND isAdmin = 1 AND isActive = 1 AND userid = ?';
      promiseConn.query(sql, userid)
          .then(([rows, fields]) => {
                if (rows.length === 0) {
                  res.send("<b>Invalid user id or user id provided is not an admin</b>");
                } else {
                  res.send(rows);
                }
            })
            .catch((error) => {
                console.error('Error executing query:', error);
            });
});
      

// update admin password
router.get('/newpass', async (req, res) => {

    const encryptNewPass = CryptoJS.SHA256(req.query.userNewPass)
    const encryptedNewPass = encryptNewPass.toString(CryptoJS.enc.Base64);

    const queryData = [encryptedNewPass, Number(req.query.userId)]; // data from form
    const sql = 'UPDATE users SET password = ? WHERE userid= ? AND isEmployee = 1 AND isAdmin = 1 AND isActive = 1';
      
    promiseConn.query(sql, queryData)
        .then(([rows, fields]) => { // rows.affectedRows > 0
            if(rows.affectedRows > 0) {
                res.redirect(callback+"#passUpdatedTrue");
            } else {
                res.redirect(callback+"#passUpdatedFalse");
            }
        })
        .catch((error) => {
            console.error('Error executing query:', error);
            res.redirect(callback+"#passUpdatedFalse");
        });
});


module.exports = router;