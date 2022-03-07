import SubscriptionModel from "../../models/subscription.model.js";
export default async (req, res, next) => {
  try {
    // const haveRef = await SubscriptionModel.find({
    //   referenceNo: new RegExp(dateRef),
    // }).select("referenceNo");

    const lastRef = Math.floor(Math.random() * (100000000000 - 1 + 1) + 1);
    let lastRefNum = `${lastRef + 1}`;
    let findResultRef = await SubscriptionModel.findOne({
      referenceNo: lastRefNum,
    }).select("referenceNo");
    while (findResultRef) {
      lastRefNum = `${Math.floor(Math.random() * (100000000000 - 1 + 1) + 1)}`;
      findResultRef = await SubscriptionModel.findOne({
        referenceNo: lastRefNum,
      }).select("referenceNo");
    }

    res.json({
      success: true,
      data: lastRefNum,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

// const findReference = async (haveRef) => {
//   const lastRef = haveRef[haveRef.length - 1].referenceNo;
//   let lastRefNum = `${parseInt(lastRef) + 1}`;
//   let findResultRef = await SubscriptionModel.findOne({
//     referenceNo: lastRefNum,
//   });
//   while (findResultRef) {
//     lastRefNum = `${parseInt(findResultRef.referenceNo) + 1}`;
//     findResultRef = await SubscriptionModel.findOne({
//       referenceNo: lastRefNum,
//     });
//   }

//   return new Promise((resolve) => {
//     resolve(lastRefNum);
//   });
// };
