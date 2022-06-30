//* test connect agent
export default (req, res, next) => {
  try {
    console.log("Test Connect to AGENT");
    const { a, b } = req.body;
    const sum = a + b;

    res.json({
      success: true,
      data: sum,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
