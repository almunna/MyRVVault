const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../../middleware/auth.middleware");
const { makeAdmin, getProfile, updateAdminProfile, changePassword } = require("./admin.controller");
const upload = require("../../../utils/uploadConfig");

// Admin routes
router.route("/")
    .post(makeAdmin)
    .get(authenticateAdmin, getProfile);

router.route("/update")
    .put(authenticateAdmin, upload.single("profilePic"), updateAdminProfile)
    .post(authenticateAdmin, changePassword);

module.exports = router;