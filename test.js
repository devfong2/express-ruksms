import bcrypt from "bcryptjs";
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync("terminal12345678", salt);
console.log(hash);
