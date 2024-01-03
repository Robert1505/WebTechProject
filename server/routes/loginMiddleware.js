const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.SECRET_KEY;

const encodeToken = (tokenData) => {
  return jwt.sign(tokenData, secret);
};

const decodeToken = (token) => {
  const replacedToken = token.replace('Bearer','').trim()
  console.log('token is ', replacedToken)
  try {
    return jwt.verify(replacedToken, secret);
  } catch (e) {
    console.error(e.message);
    return { error: 'bad token' };
  }
};

const authenticationMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (token == null) 
    return res.status(401).json({ error: 'User not authenticated' });
  const userObject = decodeToken(token);
  if (userObject.error) { 
    return res.status(403).json({ error: 'Error when trying to authenticate: ' + userObject.error });
  }
  console.log(userObject)
  req.userId = userObject.userId;
  req.type = userObject.type;
  next();
};

module.exports = {
    encodeToken,
    decodeToken,
    authenticationMiddleware
}