const express = require('express');
const app = express();
const dotEnv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDatabase = require("./src/config/DbConnection")
const errorHandler = require('./src/Middleware/errorHandler');


dotEnv.config();
 
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// DB Connection
connectDatabase()

app.get('/', (req, res) => {
    res.send('✅ API is working');
  });

app.use(errorHandler);
app.listen(process.env.PORT, () => {
    console.log('Server is running on port ' + process.env.PORT);
    });
