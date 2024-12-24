import axios from "@/utils/axiosInstance";

const getAppointments = () => {
    return axios.get(`/api/getAllAppointments`)
}

const getUserByCid = (cid) => {
    try {
        return axios.get(`/api/getUserByCid?cid=${cid}`)
    } catch (error) {
        console.error("Error getting user by cid:", error.response?.data || error.message);
        throw error;
    }
}

const getUserById = (id) => {
    return axios.get(`/api/getUserById?id=${id}`)
}

const searchAppointments = (page, limit, search, from, to) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);

    if (search) {
        params.append("search", search);
    }
    if (from) {
        params.append("from", from);
    }
    if (to) {
        params.append("to", to);
    }

    return axios.get(`/api/searchAppointment?${params.toString()}`);
};

const searchAppointmentsWithStaffId = (page, limit, staffId, search, from, to) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    params.append("staffId", staffId);

    if (search) {
        params.append("search", search);
    }
    if (from) {
        params.append("from", from);
    }
    if (to) {
        params.append("to", to);
    }

    return axios.get(`/api/searchAppointmentWithStaffId?${params.toString()}`);
};

// Examination
export const getExaminations = async (date, status, staffId, is_appointment, page, limit, search, time) => {
    try {
        if (!time) time = '';
        if (!staffId) staffId = '';

        const response = await axios.get(`/api/getExaminations?date=${date}&status=${status}&staffId=${staffId}&is_appointment=${is_appointment}&page=${+page}&limit=${+limit}&search=${search}&time=${time}`);
        //console.log("Response:", response.data); 
        return response;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export const getListToPay = async (date, statusPay, page, limit, search) => {
    const response = await axios.get(`/api/getListToPay?date=${date}&statusPay=${statusPay}&page=${+page}&limit=${+limit}&search=${search}`);
    return response;
}

const getExaminationById = (id) => {
    try {
        return axios.get(`/api/getExaminationById?id=${id}`)
    } catch (error) {
        console.error("Error getting examination by id:", error.response?.data || error.message);
        throw error;
    }
}

const createExamination = async (data) => {
    try {
        const response = await axios.post(`/api/createExamination`, data);
        //console.log("Response:", response.data);

        return response.data;
    } catch (error) {
        console.error("Error creating examination:", error.response?.data || error.message);
        throw error;
    }
};

const updateExamination = async (data) => {
    try {
        const response = await axios.put(`/api/updateExamination`, data);
        //console.log("Response:", response.data);

        return response.data;
    } catch (error) {
        console.error("Error updating examination:", error.response?.data || error.message);
        throw error;
    }
};


export const checkOutParaclinical = (data) => {
    return axios.post(`/api/paymentParaclinicalMomo`, data);
}
export const checkOutExamination = (data) => {
    return axios.post(`/api/paymentExaminationMomo`, data);
}
export const checkOutPrescription = (data) => {
    return axios.post(`/api/paymentPrescriptionMomo`, data);
}

const getDiseaseByName = (name) => {
    return axios.get(`/api/getDiseaseByName?name=${name}`)
}

const getAllDisease = () => {
    return axios.get(`/api/getAllDisease`)
}

const getAllRoomTypes = () => {
    return axios.get(`/api/getAllServiceTypes`)
}

export const getServiceLaboratory = () => {
    return axios.get(`/api/getServiceLaboratory`)
}


const getAllMedicinesForExam = () => {
    return axios.get(`/api/getAllMedicinesForExam`)
}

const getStaffNameById = (doctorId) => {
    return axios.get(`/api/getStaffNameById?staffId=${doctorId}`);
}

//vital sign
const createOrUpdateVitalSign = async (data) => {
    try {
        const response = await axios.post(`/api/createOrUpdateVitalSign`, data);
        //console.log("Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating vital sign:", error.response?.data || error.message);
        throw error;
    }
}

//Paraclinical
const createOrUpdateParaclinical = async (data) => {
    try {
        const response = await axios.post(`/api/createOrUpdateParaclinical`, data);
        //console.log("Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating paraclinical:", error.response?.data || error.message);
        throw error;
    }
}

export const createRequestParaclinical = async (data) => {
    return axios.post(`/api/createRequestParaclinical`, data);
}

const deleteParaclinical = async (data) => {
    try {
        const response = await axios.delete(`/api/deleteParaclinical`, {
            params: {
                id: data.id,
                examinationId: data.examinationId
            }
        });
        //console.log("Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting paraclinical:", error.response?.data || error.message);
        throw error;
    }
}

export const updateParaclinical = async (data) => {
    const response = await axios.put(`/api/updateParaclinical`, data);
    return response.data;
}

export const getParaclinicals = async (date, status, staffId, page, limit, search) => {
    const response = await axios.get(`/api/getParaclinicals?date=${date}&status=${status}&staffId=${staffId}&page=${+page}&limit=${+limit}&search=${search}`);
    return response;
}

export const getPrescriptions = async (date, status, staffId, page, limit, search) => {
    const response = await axios.get(`/api/getPrescriptions?date=${date}&status=${status}&staffId=${staffId}&page=${+page}&limit=${+limit}&search=${search}`);
    return response;
}

export const updatePrescription = async (data) => {
    const response = await axios.put(`/api/updatePrescription`, data);
    return response.data;
}

export const getMedicalHistories = async (userId) => {
    const response = await axios.get(`/api/getMedicalHistories?userId=${userId}`);
    return response;
}

//Prescription
const getPrescriptionByExaminationId = async (examinationId) => {
    return axios.get(`/api/getPrescriptionByExaminationId?examinationId=${examinationId}`)
}

export const updateListPayParaclinicals = async (data) => {
    const response = await axios.put(`/api/updateListPayParaclinicals`, data);
    return response.data;
}

const upsertPrescription = async (data) => {
    try {
        const response = await axios.post(`/api/upsertPrescription`, data);
        //console.log("Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error upserting prescription:", error.response?.data || error.message);
        throw error;
    }
}

//Hand book
const getAllHandbooks = async (page, limit, search, filter, status) => {
    try {
        const response = await axios.get(`/api/getAllHandBooks?page=${page}&limit=${limit}&search=${search}&filter=${filter}&status=${status}`);
        return response;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

const getHandbookById = async (id) => {
    try {
        const response = await axios.get(`/api/getHandBookById?id=${id}`);
        //console.log("Response:", response.data); 
        return response;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

const createHandbook = async (data) => {
    try {
        const response = await axios.post(`/api/createHandBook`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating handbook:", error.response?.data || error.message);
        throw error;
    }
}

const updateHandbook = async (data) => {
    try {
        const response = await axios.put(`/api/updateHandBook`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating handbook:", error.response?.data || error.message);
        throw error;
    }
}

const getAllTags = async () => {
    try {
        const response = await axios.get(`/api/getAllTags`);
        // console.log('Data tags received:', response);
        return response;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

const getScheduleByStaffId = async (staffId) => {
    try {
        const response = await axios.get(`/api/getScheduleByStaffId?staffId=${staffId}`);
        //console.log("Response:", response.data); 
        return response;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

//specialty
export const getSpecialties = async () => {
    try {
        const response = await axios.get(`/api/getSpecialtiesByDepartment`);
        return response;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

//insuarance
export const getUserInsuarance = async (userId) => {
    try {
        const response = await axios.get(`/api/getUserInsuarance?userId=${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export {
    getUserByCid,
    getUserById,

    getAppointments,
    searchAppointments,
    searchAppointmentsWithStaffId,

    getExaminationById,
    createExamination,
    updateExamination,

    createOrUpdateParaclinical,
    deleteParaclinical,

    getDiseaseByName,
    getAllDisease,

    getPrescriptionByExaminationId,
    upsertPrescription,

    getAllRoomTypes,
    getAllMedicinesForExam,
    createOrUpdateVitalSign,

    getAllHandbooks,
    createHandbook,
    getHandbookById,
    updateHandbook,
    getAllTags,

    getScheduleByStaffId,
    getStaffNameById
}