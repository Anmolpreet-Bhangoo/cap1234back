const express = require("express");
const mysql = require('mysql2');
const CryptoJS = require("crypto-js");
const router = express.Router();

const callback = "https://frontend1234.onrender.com/adminPanel";

// middlewear
router.use(express.json());

// db configuration
const conn = mysql.createPool({
    host: 'gator3403.hostgator.com',
    user: 'jazcoeit',
    password: 'Jaz@quickserve',
    database: 'jazcoeit_quickserve',
  });
  
// create a promise of pool connection
const promiseConn = conn.promise();


// static routes (should always be at the top before the dynamic routes)
router.get('/', (req, res) => {

    const sql = 'SELECT * FROM users ORDER BY isAdmin DESC';
        
    promiseConn.query(sql)
        .then(([rows, fields]) => {
            if (rows.length === 0) {
                res.send("<b>No users in the database!</b>");
              } else {
                res.send(rows);
              }
        })
        .catch((error) => {
            console.error('Error executing query:', error);
        });

});

// show active users only
router.get('/activeOnly', (req, res) => {

    const sql = 'SELECT * FROM users WHERE isActive = 1 ORDER BY isAdmin DESC';
        
    promiseConn.query(sql)
        .then(([rows, fields]) => {
            if (rows.length === 0) {
                res.send("<b>No users in the database!</b>");
              } else {
                res.send(rows);
              }
        })
        .catch((error) => {
            console.error('Error executing query:', error);
        });

});

// show deactivated users only
router.get('/deactOnly', (req, res) => {

    const sql = 'SELECT * FROM users WHERE isActive = 0 ORDER BY isAdmin DESC';
        
    promiseConn.query(sql)
        .then(([rows, fields]) => {
            if (rows.length === 0) {
                res.send("<b>No users in the database!</b>");
              } else {
                res.send(rows);
              }
        })
        .catch((error) => {
            console.error('Error executing query:', error);
        });

});

// show guest users only
router.get('/guestOnly', (req, res) => {

    const sql = 'SELECT * FROM users WHERE isEmployee = 0 ORDER BY isAdmin DESC';
        
    promiseConn.query(sql)
        .then(([rows, fields]) => {
            if (rows.length === 0) {
                res.send("<b>No users in the database!</b>");
              } else {
                res.send(rows);
              }
        })
        .catch((error) => {
            console.error('Error executing query:', error);
        });

});

// show employee users only
router.get('/emloyeeOnly', (req, res) => {

    const sql = 'SELECT * FROM users WHERE isEmployee = 1 ORDER BY isAdmin DESC';
        
    promiseConn.query(sql)
        .then(([rows, fields]) => {
            if (rows.length === 0) {
                res.send("<b>No users in the database!</b>");
              } else {
                res.send(rows);
              }
        })
        .catch((error) => {
            console.error('Error executing query:', error);
        });

});

// show admin users only
router.get('/adminOnly', (req, res) => {

    const sql = 'SELECT * FROM users WHERE isAdmin = 1 ORDER BY isAdmin DESC';
        
    promiseConn.query(sql)
        .then(([rows, fields]) => {
            if (rows.length === 0) {
                res.send("<b>No users in the database!</b>");
              } else {
                res.send(rows);
              }
        })
        .catch((error) => {
            console.error('Error executing query:', error);
        });

});

// insert new user based on get query data (similar to php)
router.get('/new', (req, res) => {

    const encrypt = CryptoJS.SHA256(req.query.userPass) // encrypt plain text to SHA256 hash code
    const encryptedPass = encrypt.toString(CryptoJS.enc.Base64); // convert hascode to string

    const queryData = [Number(req.query.userId), req.query.fName, req.query.lName, req.query.userEmail, encryptedPass]; // data from form
    const sql = 'INSERT INTO users (userid, firstName, lastName, email, password, isEmployee, isAdmin, isActive) VALUES (?, ?, ?, ?, ?, 1, 0, 1)';
        
    promiseConn.query(sql, queryData)
        .then(([rows, fields]) => {
            // check if query affected a row
            if(rows.affectedRows > 0) {
                navigate("/adminPanel");
            } else {
                res.redirect(callback+"#userAddedFalse");
            }
        })
        .catch((error) => {
            console.error('Error executing query:', error);
            res.redirect(callback+"#userAddedFalse");
        });

});

// delete user from the database
router.get('/delete', (req, res) => {

    const queryData = [Number(req.query.userId), req.query.userEmail]; // data from form
    const sql = 'DELETE FROM users WHERE userid = ? AND email = ? AND isAdmin = 0';
        
    promiseConn.query(sql, queryData)
        .then(([rows, fields]) => {
            if(rows.affectedRows > 0) {
                res.redirect(callback+"#userDeletedTrue");
            } else {
                res.redirect(callback+"#userDeletedFalse");
            }
        })
        .catch((error) => {
            console.error('Error executing query:', error);
            res.redirect(callback+"#userDeletedFalse");
        });

});

// reactivate user from the database
router.get('/reactivate', (req, res) => {

    const queryData = [Number(req.query.userId), req.query.userEmail]; // data from form
    const sql = 'UPDATE users SET isActive = 1 WHERE userid = ? AND email = ? AND isActive = 0';
        
    promiseConn.query(sql, queryData)
        .then(([rows, fields]) => {
            if(rows.affectedRows > 0) {
                res.redirect(callback+"#userReactivatedTrue");
            } else {
                res.redirect(callback+"#userReactivatedFalse");
            }
        })
        .catch((error) => {
            console.error('Error executing query:', error);
            res.redirect(callback+"#userReactivatedFalse");
        });

});

// deactivate user from the database
router.get('/deactivate', (req, res) => {

    const queryData = [Number(req.query.userId), req.query.userEmail]; // data from form
    const sql = 'UPDATE users SET isActive = 0 WHERE userid = ? AND email = ? AND isActive = 1';
        
    promiseConn.query(sql, queryData)
        .then(([rows, fields]) => {
            if(rows.affectedRows > 0) {
                res.redirect(callback+"#userDeactivatedTrue");
            } else {
                res.redirect(callback+"#userDeactivatedFalse");
            }
        })
        .catch((error) => {
            console.error('Error executing query:', error);
            res.redirect(callback+"#userDeactivatedFalse");
        });

});


// dynamic routes

module.exports = router;