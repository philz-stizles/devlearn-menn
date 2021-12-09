// eslint-disable-next-line no-unused-vars
module.exports = (err, _req, res, _next) => {
  const status = err.status ? err.status : 500;
  const message = err.message ? err.message : 'Please try again later';

  // eslint-disable-next-line no-console
  console.log(err.message);

  return res.status(status).json({ status: false, message });

  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');
};
