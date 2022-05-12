import bcrypt from "bcryptjs";
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync("cG9uZCsK", salt);
console.log(hash);
