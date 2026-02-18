const express = require("express");
const ManageController = require("./manage.controller");
const { authenticateAdmin } = require("../../middleware/auth.middleware");

const router = express.Router();

router
    .post(
        "/add-terms-conditions",
        authenticateAdmin,   
        ManageController.addTermsConditions
    )
    .get("/get-terms-conditions", ManageController.getTermsConditions)
    .delete(
        "/delete-terms-conditions",
        authenticateAdmin,
        ManageController.deleteTermsConditions
    )
    .post(
        "/add-privacy-policy",
        authenticateAdmin,
        ManageController.addPrivacyPolicy
    )
    .get("/get-privacy-policy", ManageController.getPrivacyPolicy)
    .delete(
        "/delete-privacy-policy",
        authenticateAdmin,
        ManageController.deletePrivacyPolicy
    )
    .post(
        "/add-about-us",
        authenticateAdmin,
        ManageController.addAboutUs
    )
    .get("/get-about-us", ManageController.getAboutUs)
    .delete(
        "/delete-about-us",
        authenticateAdmin,
        ManageController.deleteAboutUs
    )
    .post(
        "/add-faq",
        authenticateAdmin,
        ManageController.addFaq)
    .patch(
        "/update-faq",
        authenticateAdmin,
        ManageController.updateFaq
    )
    .get("/get-faq", ManageController.getFaq)
    .delete(
        "/delete-faq",
        authenticateAdmin,
        ManageController.deleteFaq
    )
    .post(
        "/add-contact-us",
        authenticateAdmin,
        ManageController.addContactUs
    )
    .get("/get-contact-us", ManageController.getContactUs)
    .delete(
        "/delete-contact-us",
        authenticateAdmin,
        ManageController.deleteContactUs
    );

module.exports = router;
