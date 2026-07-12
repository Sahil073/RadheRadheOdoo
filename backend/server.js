require("dotenv").config();


// Import app

const app = require("./app");


// Import database connection

require("./database/db");



const PORT = process.env.PORT || 5000;



app.listen(PORT,()=>{

    console.log(
        `🚀 TransitOps Server running on port ${PORT}`
    );

});