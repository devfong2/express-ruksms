import bcrypt from "bcryptjs";
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync("313326339", salt);
console.log(hash);
