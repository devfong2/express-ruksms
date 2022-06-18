import bcrypt from "bcryptjs";
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync("abcd12345", salt);
console.log(hash);
