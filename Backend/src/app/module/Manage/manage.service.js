const { db, FieldValue } = require('../../../config/db');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const validateFields = require('../../../utils/validateFields');

// Helper: get or upsert a singleton document in a collection
async function getSingleton(collectionName) {
    const snap = await db.collection(collectionName).limit(1).get();
    return snap.empty ? null : docToObj(snap.docs[0]);
}

async function upsertSingleton(collectionName, payload) {
    const snap = await db.collection(collectionName).limit(1).get();
    if (!snap.empty) {
        const docRef = snap.docs[0].ref;
        await docRef.update({ ...payload, updatedAt: FieldValue.serverTimestamp() });
        return docToObj(await docRef.get());
    } else {
        const ref = await db.collection(collectionName).add({
            ...payload,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });
        return docToObj(await ref.get());
    }
}

async function deleteSingleton(collectionName, id) {
    const snap = await db.collection(collectionName).doc(id).get();
    if (!snap.exists) return null;
    await db.collection(collectionName).doc(id).delete();
    return true;
}


const addTermsConditions = async (payload) => {
    const result = await upsertSingleton('termsConditions', payload);
    return { message: 'Terms & conditions updated', result };
};

const getTermsConditions = async () => getSingleton('termsConditions');

const deleteTermsConditions = async (query) => {
    const { id } = query;
    const deleted = await deleteSingleton('termsConditions', id);
    if (!deleted) throw new ApiError('TermsConditions not found', 404);
    return { deleted: true };
};


const addPrivacyPolicy = async (payload) => {
    const result = await upsertSingleton('privacyPolicies', payload);
    return { message: 'Privacy policy updated', result };
};

const getPrivacyPolicy = async () => getSingleton('privacyPolicies');

const deletePrivacyPolicy = async (query) => {
    const { id } = query;
    const deleted = await deleteSingleton('privacyPolicies', id);
    if (!deleted) throw new ApiError('Privacy Policy not found', 404);
    return { deleted: true };
};


const addAboutUs = async (payload) => {
    const result = await upsertSingleton('aboutUs', payload);
    return { message: 'About Us updated', result };
};

const getAboutUs = async () => getSingleton('aboutUs');

const deleteAboutUs = async (query) => {
    const { id } = query;
    const deleted = await deleteSingleton('aboutUs', id);
    if (!deleted) throw new ApiError('About Us not found', 404);
    return { deleted: true };
};


const addFaq = async (payload) => {
    validateFields(payload, ['question', 'description']);
    const ref = await db.collection('faqs').add({
        ...payload,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    });
    return docToObj(await ref.get());
};

const updateFaq = async (payload) => {
    validateFields(payload, ['faqId', 'question', 'description']);
    const { faqId, ...rest } = payload;
    const snap = await db.collection('faqs').doc(faqId).get();
    if (!snap.exists) throw new ApiError('FAQ not found', 404);
    await db.collection('faqs').doc(faqId).update({ ...rest, updatedAt: FieldValue.serverTimestamp() });
    return docToObj(await db.collection('faqs').doc(faqId).get());
};

const getFaq = async () => {
    const snap = await db.collection('faqs').get();
    return queryToArr(snap);
};

const deleteFaq = async (query) => {
    validateFields(query, ['faqId']);
    const { faqId } = query;
    const snap = await db.collection('faqs').doc(faqId).get();
    if (!snap.exists) throw new ApiError('FAQ not found', 404);
    await db.collection('faqs').doc(faqId).delete();
    return { deleted: true };
};


const addContactUs = async (payload) => {
    const result = await upsertSingleton('contactUs', payload);
    return { message: 'Contact Us updated', result };
};

const getContactUs = async () => getSingleton('contactUs');

const deleteContactUs = async (query) => {
    const { id } = query;
    const deleted = await deleteSingleton('contactUs', id);
    if (!deleted) throw new ApiError('Contact Us not found', 404);
    return { deleted: true };
};


const ManageService = {
    addPrivacyPolicy, getPrivacyPolicy, deletePrivacyPolicy,
    addTermsConditions, getTermsConditions, deleteTermsConditions,
    addAboutUs, getAboutUs, deleteAboutUs,
    addFaq, updateFaq, getFaq, deleteFaq,
    addContactUs, getContactUs, deleteContactUs,
};

module.exports = ManageService;
