import fs from "fs";
import path from "path";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
const writeFileAsync = promisify(fs.writeFile);
let rootPath = path.resolve();
rootPath = path.join(rootPath, "public");

export default async (baseImage, folder, oldFileName) => {
  const imgPath = path.join(rootPath, folder);
  if (!fs.existsSync(imgPath)) {
    fs.mkdirSync(imgPath);
  }
  // โฟลเดอร์และ path ของการอัปโหลด

  // หานามสกุลไฟล์
  const ext = baseImage.substring(
    baseImage.indexOf("/") + 1,
    baseImage.indexOf(";base64")
  );

  // สุ่มชื่อไฟล์ใหม่ พร้อมนามสกุล
  let filename = "";
  if (ext === "svg+xml") {
    filename = `${uuidv4()}.svg`;
  } else {
    filename = `${uuidv4()}.${ext}`;
  }

  // Extract base64 data ออกมา
  const image = decodeBase64Image(baseImage);

  // เขียนไฟล์ไปไว้ที่ path
  await writeFileAsync(path.join(imgPath, filename), image.data, "base64");
  const oldFilePath = path.join(imgPath, oldFileName);
  if (fs.existsSync(oldFilePath)) {
    fs.unlinkSync(oldFilePath);
  }

  // return ชื่อไฟล์ใหม่ออกไป
  return filename;
};

export const checkBase64Format = (base64Str) => {
  return new Promise((resolve) => {
    // eslint-disable-next-line no-useless-escape
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      resolve(false);
    } else {
      resolve(true);
    }
  });
};

const decodeBase64Image = (base64Str) => {
  // eslint-disable-next-line
  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const image = {};
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string");
  }

  image.type = matches[1];
  image.data = matches[2];

  return image;
};
