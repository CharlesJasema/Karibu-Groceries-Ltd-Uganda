const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { createCreditSale } = require("./controllers/creditController");

router.post("/", protect, createCreditSale);

module.exports = router;