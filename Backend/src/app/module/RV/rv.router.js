const express = require("express");
const router = express.Router();

const {
  addRv,
  getRvs,
  getRv,
  updateRv,
  deleteRv,
  updateCurrentMileage,
  getUserRvs
} = require("./rv.controller");
const { authenticateUser, authenticateAdmin } = require("../../middleware/auth.middleware");

router.post("/add-rv", authenticateUser, addRv);
router.get("/get-rvs", authenticateUser, getUserRvs);
router.get("/get-rv/:id", authenticateUser, getRv);
router.put("/update-rv/:id", authenticateUser, updateRv);
router.post("/delete-rv/:id", authenticateUser, deleteRv);
router.put("/update-mileage/:id", authenticateUser, updateCurrentMileage);



//for admin
router.get("/get-all-rvs", authenticateUser, getRvs);


module.exports = router;
