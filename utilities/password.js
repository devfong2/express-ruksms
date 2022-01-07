import bcrypt from "bcryptjs";

export const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      resolve(hash);
    } catch (e) {
      reject(e);
    }
  });
};

export const comparePassword = (password, passwordInDatabase) => {
  return new Promise((resolve, reject) => {
    try {
      const compare = bcrypt.compareSync(password, passwordInDatabase);
      resolve(compare);
    } catch (e) {
      reject(e);
    }
  });
};
