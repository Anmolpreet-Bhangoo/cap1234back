const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const multer = require('multer');
const path = require('path');
const cors = require("cors");
const mysql = require("mysql");

app.use(cors());

const connection = mysql.createConnection({
  host: 'gator3403.hostgator.com',
  user: 'jazcoeit',
  password: 'Jaz@quickserve',
  database: 'jazcoeit_quickserve',
});




// Ticketing Part -----------------------------------------------------------------------------------------------------------------------------------------------------------

var ticketEmail = " ";
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/adminTickets", (req, res) => {
  const itemsPerPage = 20;
  const page = req.query.page || 1;
  const offset = (page - 1) * itemsPerPage;
  const sql = `SELECT * FROM ISSUED_TICKETS ORDER BY TICKET_DATE DESC LIMIT ${itemsPerPage} OFFSET ${offset};`;
  connection.query(sql, (err, data) => {
    if (err) return res.json('Error: ' + err.message);
    return res.json(data);
  });
});


app.listen(4004, () => {
  console.log("listening");
})


const sendEmail = function (inputsubject, inputdescription) {

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "prospectissuedticket@gmail.com",
      pass: "mqqbblfvqbrezdfx"
    },
    tls: {
      rejectUnauthorized: false
    },
  })

  let mailOptions = {
    form: "prospectissuedticket@gmail.com",
    to: ticketEmail,
    subject: "Ticket",
    text: "Your Ticket Has been Issued! with Subject " + inputsubject + " and description as " + inputdescription + ". Thanks for letting us know about the Issue!"
  }
  transporter.sendMail(mailOptions, function (err, succ) {
    if (err) {
      console.log(err)
    }
    else {
      console.log("Email Sent")
    }
  })
}



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage
})


app.use(express.json());
app.post('/createTicket', upload.single('image'), (req, res) => {
  const sql = "INSERT INTO ISSUED_TICKETS (USER_EMAIL, TICKET_DATE, TICKET_SUBJECT, TICKET_CATEGORY, TICKET_DESCRIPTION, TICKET_PRIORITY, TICKET_STATUS, TICKET_PIC)  VALUES (?);"
  let filename = "";
  if (req.file) {
    filename = req.file.filename;
  }
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 10);
  const values = [
    ticketEmail,
    formattedDate,
    req.body.subject,
    req.body.category,
    req.body.description,
    req.body.priority,
    "NotSolved",
    filename
  ];
  console.log(req.body.subject);
  console.log(req.file);
  connection.query(sql, [values], (err, data) => {
    if (err) return res.json("Error");
    else
      sendEmail(req.body.subject, req.body.description);
    return res.json(data);
  })
})


app.post("/deleteTicket", (req, res) => {
  const sql = "DELETE FROM ISSUED_TICKETS WHERE TICKET_ID = ?;";
  const values = [req.body.ticketID];

  connection.query(sql, [values], (err, data) => {
    if (err) return res.json("Error");
    else
      return res.json(data);
  })
});


app.post("/solveTicket", (req, res) => {
  const sql = `UPDATE ISSUED_TICKETS SET TICKET_STATUS = "SOLVED" WHERE TICKET_ID = ?;`;
  const values = [req.body.ticketID];

  connection.query(sql, [values], (err, data) => {
    if (err) return res.json("Error");
    else
      return res.json(data);
  })
});

// Ticketing Parts End ------------------------------------------------------------------------------------------------------------------------------------------------------






// Booking Part  ------------------------------------------------------------------------------------------------------------------------------------------------------



app.get("/requests", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the requested page, default to 1
  const perPage = parseInt(req.query.perPage) || 20; // Number of items per page, default to 15

  connection.query(
    `SELECT COUNT(*) as total FROM createbooking`,
    (err, countResult) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error fetching data");
      } else {
        const totalRows = countResult[0].total;
        const totalPages = Math.ceil(totalRows / perPage);
        const startIndex = (page - 1) * perPage;

        connection.query(
          `SELECT * FROM createbooking LIMIT ${startIndex}, ${perPage}`,
          (err, dataResult) => {
            if (err) {
              console.log(err);
              res.status(500).send("Error fetching data");
            } else {
              const response = {
                data: dataResult,
                totalPages: totalPages,
              };
              res.send(response);
            }
          }
        );
      }
    }
  );
});

const sendEmail1 = function(inputName, inputRoomID, inputBookingDate, inputStartTime, inputTotalHours, inputEnquiry, inputEndTime) {

  let transporter1 = nodemailer.createTransport({

    service: "gmail",

        auth: {

             user: "prospectissuedticket@gmail.com",

           pass: "mqqbblfvqbrezdfx"

            },

         tls :{

             rejectUnauthorized: false

         },

     })

   

     let mailOptions1 = {

         form: "prospectissuedticket@gmail.com",

       to: ticketEmail,

         subject: "Booking",

         text: "Your Booking has been confirmed! " + "\n" + "\n" + "Name: " + inputName  + "\n" + "RoomID: " + inputRoomID + "\n" +

         "Booking Date: " + inputBookingDate + "\n" + "Start Time: " + inputStartTime + "\n"  + "Total Hours: " + inputTotalHours + "\n" +

         "Enquiry: " + inputEnquiry + "\n" + "End Time: " + inputEndTime  + "\n" + "\n" +"Thank you for Booking with us!"

 

     }

    transporter1.sendMail(mailOptions1 , function(err, succ){

     if(err){

         console.log(err)

     }

          else{

         console.log("Email Sent")

     }

 })

}

 

app.post("/booking", (req, res) => {

  // const message = "The selected time slot conflicts with an existing booking.";

  const sql =

    "INSERT INTO createbooking (roomID, email, name, bookingDate, startTime, totalHours, enquiry, endTime) VALUES (?)";

 

  const startTime = req.body.time; // Assuming req.body.time is a valid time string

  const totalHours = req.body.totalHours;

 

  // Convert the startTime to minutes

  const startTimeInMinutes =

    parseInt(startTime.slice(0, 2)) * 60 + parseInt(startTime.slice(3));

 

  // Calculate the endTime by adding totalHours to startTime

  const endTimeInMinutes = startTimeInMinutes + totalHours * 60;

 

  // Adjust the endTime if it exceeds 24 hours

  const adjustedEndTimeInMinutes = endTimeInMinutes % (24 * 60);

 

  // Format the endTime as HH:mm

  const endTime = `${Math.floor(adjustedEndTimeInMinutes / 60)

    .toString()

    .padStart(2, "0")}:${(adjustedEndTimeInMinutes % 60)

    .toString()

    .padStart(2, "0")}`;

 

  const newStartTime = startTimeInMinutes;

  const newEndTime = adjustedEndTimeInMinutes;

 

  const roomID = req.body.roomID;

  const bookingDate = req.body.date;

 

  // Check if the same roomID is booked at the same date during the selected time slot

  const selectSql =

    "SELECT * FROM createbooking WHERE roomID = ? AND bookingDate = ?";

    connection.query(selectSql, [roomID, bookingDate], (selectErr, bookingData) => {

    if (selectErr) {

      return res.json("Error");

    }

 

    const hasConflict = bookingData.some((booking) => {

      const existingStartTime =

        parseInt(booking.startTime.slice(0, 2)) * 60 +

        parseInt(booking.startTime.slice(3));

      const existingEndTime =

        parseInt(booking.endTime.slice(0, 2)) * 60 +

        parseInt(booking.endTime.slice(3));

       

        if (

          (newStartTime >= existingStartTime && newStartTime <= existingEndTime) ||

          (newEndTime >= existingStartTime && newEndTime <= existingEndTime) ||

          (newStartTime <= existingStartTime && newEndTime >= existingStartTime)

        )

       

        {

        conflictingBooking = booking;

        return true;

      }

      return false;

    });

 

    if (hasConflict) {

      return res.status(401).json({

        error: "Time Conflict",

        startTime: conflictingBooking.startTime,

        endTime:conflictingBooking.endTime,

      });

    }

   

 

    const values = [

      roomID,

      ticketEmail,

      req.body.name,

      bookingDate,

      req.body.time,

      req.body.totalHours,

      req.body.enquiry,

      endTime,

    ];

 

    connection.query(sql, [values], (err, data) => {

      if (err) return res.json("Error");

      else {

        sendEmail1(req.body.name, roomID, bookingDate, req.body.time, req.body.totalHours, req.body.enquiry, endTime);

        return res.json(data);

      }

     

    });

  });

});

 

app.put("/update",(req,res) => {

  const id = req.body.id;

  const roomID = req.body.roomID;

  const name = req.body.name;

  const bookingDate = req.body.bookingDate;

  const startTime = req.body.startTime;

  const totalHours = req.body.totalHours;

  const enquiry = req.body.enquiry;

  const endTime = req.body.endTime;

 

  connection.query('UPDATE createBooking SET roomID=?, name=?, bookingDate=?, startTime=?, totalHours=?, enquiry=?, endTime=? WHERE id=?', [roomID, name, bookingDate, startTime

  , totalHours, enquiry, endTime, id],

    (err,result) => {

      if(err){

        console.log(err);

        res.status(500).send('There have been an error while updating the current booking room request');

      }else{

        console.log(result);

        res.send(result);

      }

    }

  );

});

 

app.delete("/delete/:id", (req, res) => {

  const id = req.params.id;

 

  connection.query("DELETE FROM createbooking WHERE id=?", id, (err, result) => {

    if (err) {

      console.log(err);

      res.status(500).send("There is an error deleting this request");

    } else {

      console.log(result);

      res.send(result);

    }

  });

});



// Booking Part Ending -----------------------------------------------------------------------------------------------------------------------------------


// Admin Part --------------------------------------------------------------------------------------------------------------------------------------------

// defined a route handler for the root path "/" of the server. when get request is made to the root path. the provided
// callback function is executed
// app.get('/', async (req, res) => {
//   res.status(200).send("Main Backend Route");
// });

// Routers - imports the user and admin from their respective files
const userRouter = require('./user');
const adminRouter = require('./admin');
// add the routers - This mount the routers at their respective base path
app.use('/user', userRouter);
app.use('/admin', adminRouter);



// Homepage part --------------------------------------------------------------------------------------------------------------------------------

app.get("/", (req, res) => {
  const sql = "SELECT * FROM users";
  connection.query(sql, (err, data) => {
    if (err) {
      return console.log("error" + err.message);
    }
    return res.json(data);
  })
})

app.use(express.json());
// New route for users login

// app.post("/login", (req, res) => {
//   const { email, password } = req.body;

//   const sql = "SELECT * FROM ticketingsytem.users WHERE email = ? AND password = ?";
//   db.query(sql, [email, password], (err, result) => {
//     if (err) {
//       console.error("Error executing the query");
//       return res.status(500).json({ error: "Internal server error" });
//     }

//     if (result.length === 0) {
//       // Users not found or incorrect credentials
//       return res.status(401).json({ error: "Invalid email or password" });
//     } else {
//       // Successful login
//       const user = result[0];
//       const isAdmin = user.isAdmin === 1; // Assuming the 'isAdmin' field is a boolean flag in the database

//       return res.status(200).json({ message: "Login successful", isAdmin });
//     }
//   });
// });

function generator() {
  // string so we can store each number one by one
  let randomNumber = "";
  
  // loop generate random number 6 times
  for (let i = 0; i < 6; i++) {
    randomNumber += Math.floor(Math.random() * 9);
  }

  // check if length is 6 if not callback
  if(randomNumber.length == 6){
    // convert into number datatype and return it
    return Number(randomNumber);
  } else {
    // callback
    generator();
  }
  
}



app.post("/login", (req, res) => {
  const { email, password } = req.body;
 ticketEmail = email;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  connection.query(sql, [email, password], (err, result) => {
    if (err) {
      console.error("Error executing the query");
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.length === 0) {
      // Users not found or incorrect credentials
      return res.status(401).json({ error: "Invalid email or password" });
    } else {
      const user = result[0];
      if (user.isActive === 0) {
        // User is not active, can't log in
        return res.status(401).json({ error: "User is not active" });
      }

      // Successful login
      const isAdmin = user.isAdmin === 1; // Assuming the 'isAdmin' field is a boolean flag in the database
      return res.status(200).json({ message: "Login successful", isAdmin });
    }
  });
});

app.post("/signup", (req, res) => {
  const generatedId = generator();
  const sql =
    "INSERT INTO `users` (`userid`, `email`, `password`, `firstName`, `lastName`,`isActive`, `isEmployee`, `isAdmin`) VALUES (?,?,?,?,?,?,?,?);";
  const values = [
    generatedId,
    req.body.email,
    req.body.password,  // Make sure you're using the 'password' property
    req.body.firstName,
    req.body.lastName,
    1,
    0,
    0,
  ];
  connection.query(sql, values, (err, data) => {
    if (err) {
      console.error("Error executing the query", err);
      return res.status(500).json({ error: "Internal server error" });
    } else {
      // SignUp successful
      return res.status(200).json({ message: "Sign up successful" });
    }
  });
});

// Homepage part Ending --------------------------------------------------------------------------------------------------------------------------