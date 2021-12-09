const path = require('path');
const fs = require('fs');
const express = require('express');
const expressRateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const swaggerUI = require('swagger-ui-express');
// Middlewares.
const globalErrorHandler = require('./middlewares/error.middleware');
const notFoundHandler = require('./middlewares/notfound.middleware');
// const { webhookCheckout } = require('./controllers/booking.controllers');
// API Docs.
const swaggerDocument = require('./docs');
// Initialize Express App.
const app = express();

const csrfProtection = csurf({ cookie: true });

//
app.enable('trust proxy');

// Cors.
app.use(
  cors({
    // origin: 'https://someurl.com'
  })
); // cors() is a middleware which means that you can implement on specific routes as middleware

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors()) // You can also use for specific routes

// SERVING STATIC FILES
// app.use(express.static(path.join(__dirname, 'static')))
app.use(express.static(path.join(__dirname, 'public'))); // This says, anytime there is a request from the
// server, look in the public folder e.g for http://localhost:5000/overview.html, overview should be placed
// in the root of the public folder
app.use(express.static(path.join(__dirname, 'uploads')));

// SECURITY - Anti Cross-site Scripting - Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// LOGGING - DEVELOPMENT
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// SECURITY - Anti Brute Force Attacks - Set rate limiting
app.use(
  '/api',
  expressRateLimit({
    // By specifying api, this would then affect all the routes since they all have /api
    max: 100, // no of requests per IP
    windowMs: 60 * 60 * 1000, // per period(1 hr)
    message: {
      status: false,
      message: 'Too many requests from this IP, please try again in an hour'
    }
  })
);

// STRIPE CHECKOUT WEBHOOK
// When we needs this body in a raw form
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' })
  // webhookCheckout,
);

// REQUEST BODY PARSING
app.use(express.json({ limit: '10kb' })); // This would limit the body size to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // This would limit the body size to 10kb
app.use(cookieParser()); // Parses data from cookies

// SECURITY - Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // It will look at the req.body, req.query and req.params, and basically
// filter out all of the dollar($) signs and dots(.) in the values

// SECURITY - Data sanitization against XSS - cross site scripting
app.use(xss()); // This would clean any user input from malicious html code

// SECURITY - Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'price'] // specify parameters that can be duplicated in the query
  })
);

// COMPRESSION
app.use(compression()); //

// TESTING MIDDLEWARE
app.use((req, res, next) => {
  // console.log(req.cookies)
  next();
});

// RESOURCES ROUTES
const version = process.env.API_VERSION;
fs.readdirSync(path.join(__dirname, 'routes', version)).map(route => {
  app.use(`/api/${version}`, require(`./routes/${version}/${route}`));
});

// csrf protection.
app.use(csrfProtection);
app.get(`/api/${version}/csrf-token`, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// API documentation.
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Handle unhandled routes - routes that are not caught by any routers
app.all('*', notFoundHandler);

// Global error handling.
app.use(globalErrorHandler);

module.exports = app;
