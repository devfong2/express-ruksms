const createID = (arr) => {
  return new Promise((resolve, reject) => {
    try {
      let ID;
      if (arr.length !== 0) {
        // หาค่ามากที่สุดของ ID
        const sortByDesc = arr.sort((a, b) => b.ID - a.ID);
        ID = sortByDesc[0].ID + 1;
        resolve(ID);
      } else {
        ID = 1;
        resolve(ID);
      }
    } catch (e) {
      reject(e);
    }
  });
};

export default createID;
