const bcrypt = require('bcryptjs');

const NAMESPACE = 'PASSWORD SERVICE';

exports.hashPasswordAsync = async password => {
  try {
    // Generate salt.
    const salt = await bcrypt.genSalt(12);

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Return hashed password.
    return hashedPassword;
  } catch (error) {
    logger.error(NAMESPACE, error.message);
    throw error;
  }
};

exports.validatePasswordAsync = async (password, hashedPassword) => {
  console.log(await bcrypt.compare(password, hashedPassword));
  return await bcrypt.compare(password, hashedPassword);
};
