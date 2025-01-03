import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import RadioButtonList from '../RadioButton/RadioButton';
import { createExamination, getUserInsuarance, getUserByCid, updateExamination } from '@/services/doctorService';
import { message, Select, Spin } from 'antd';
import { getThirdDigitFromLeft, isNumericString } from '@/utils/numberSeries';
import './AddExamModal.scss';
import AddUserModal from '../AddUserModal/AddUserModal';
import { STATUS_BE } from '@/constant/value';

const AddExamModal = ({ isOpen, onClose, timeSlot, handleAddExamSuscess, isEditMode, examId, patientData, comorbiditiesOptions, specialtyOptions }) => {
    const [selectedComorbidities, setSelectedComorbidities] = useState([]);
    const [inputComorbidity, setInputComorbidity] = useState('');
    const [shakeId, setShakeId] = useState(null);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [prioritize, setPrioritize] = useState(patientData?.special || 'normal');

    const [specialtySelected, setSpecialtySelected] = useState(null);

    const [userInfo, setUserInfo] = useState({});
    const [cid, setCid] = useState('');
    const [symptom, setSymptom] = useState('');
    const [insurance, setInsurance] = useState('');

    const comorbidityContainerRef = useRef(null);
    const inputRef = useRef(null);
    const searchResultsRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [isSearched, setIsSearched] = useState(false);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    const insuarance = async () => {
        try {
            const response = await getUserInsuarance(patientData.userId);

            let insuranceData = null;

            if (response.EC === 0 && response.DT) {
                insuranceData = response.DT;
            }

            const comorbidityObjects = patientData.comorbidities
                ? patientData.comorbidities.split(',').map(comorbidityId => {
                    const matchedComorbidity = comorbiditiesOptions.find(
                        option => option.id === comorbidityId
                    );
                    return matchedComorbidity;
                }).filter(Boolean)
                : [];

            // Sử dụng dữ liệu từ userExaminationData
            setUserInfo({
                id: patientData.userId,
                firstName: patientData.userExaminationData.firstName,
                lastName: patientData.userExaminationData.lastName,
            });


            setSelectedComorbidities(comorbidityObjects);
            setSymptom(patientData.symptom || '');
            setInsurance(patientData.insuaranceCode || '');

            // Tìm và set specialty
            const matchedSpecialty = specialtyOptions.find(
                specialty => specialty.label === patientData.roomName
            );
            if (matchedSpecialty) {
                setSpecialtySelected(matchedSpecialty);
            }
        } catch (error) {
            console.error("Error getting insurance:", error.response?.data || error.message);
            return null;
        }
    }

    useEffect(() => {
        // Thêm logic ngăn cuộn trang khi modal mở
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup effect khi component unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);


    useEffect(() => {
        if (isEditMode) {
            insuarance();
        }
    }, [comorbiditiesOptions, specialtyOptions]);

    const handleSpecialtyChange = (value) => {
        setSpecialtySelected({
            ...specialtyOptions.find(item => item.value === value)
        });
    };

    const handleChangePrioritize = (value) => {
        setPrioritize(value);
    };

    // hàm set lại giá trị ban đầu:
    const resetForm = () => {
        setSpecialtySelected(null);
        setSymptom('');
        setInsurance('');
        setCid('');
        setUserInfo({});
        setSelectedComorbidities([]);
        setInputComorbidity('');
        setPrioritize('normal');
    }

    const handleAddUserSuscess = (data) => {
        resetForm();
        setIsSearched(true);
        setUserInfo(data.user);
        setCid(data.user.cid);
        setInsurance(data.insurance?.insuranceCode || '');
    }

    const handleFindUser = async () => {
        setInsurance('');
        try {
            if (!cid) {
                message.error('Vui lòng nhập số CCCD để tìm kiếm');
                setUserInfo({});
                return;
            }

            if (!isNumericString(cid)) {
                message.error('Số CCCD không hợp lệ');
                setUserInfo({});
                return;
            }

            setIsSearched(true);

            setLoading(true);
            const response = await getUserByCid(cid);
            if (response.data.DT) {
                setUserInfo(response.data.DT);
                setInsurance(response.data.DT.userInsuranceData?.insuranceCode || '');
            } else {
                setUserInfo({});
            }
            setLoading(false);
        } catch (error) {
            console.error("Error getting user by cid:", error.response?.data || error.message);
            setLoading(false);
        }
    }

    // Lọc bệnh đi kèm theo giá trị nhập vào
    const filteredComorbidities = comorbiditiesOptions.filter(comorbidity =>
        comorbidity.label.toLowerCase().includes(inputComorbidity.toLowerCase())
    );

    // Xử lý khi người dùng nhập vào input
    const handleInputChange = (event) => {
        setInputComorbidity(event.target.value);
        setShowSearchResults(true);
    };

    const handleAddUser = () => {
        setIsUserModalOpen(true);
        setIsSearched(false);
    }
    const closeAddUser = () => setIsUserModalOpen(false);

    // Chọn bệnh đi kèm
    const handleSelectComorbidity = (comorbidity) => {
        // Kiểm tra xem bệnh đã tồn tại trong danh sách chưa
        if (selectedComorbidities.some(item => item.id === comorbidity.id)) {
            setShakeId(comorbidity.id);
            setTimeout(() => setShakeId(null), 1000);
            return;
        }

        setSelectedComorbidities((prevSelected) => [
            ...prevSelected,
            comorbidity
        ]);
        setInputComorbidity('');
        setShowSearchResults(false);
    };

    // Xóa bệnh đi kèm
    const handleRemoveComorbidity = (id) => {
        setSelectedComorbidities(selectedComorbidities.filter(item => item.id !== id));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                comorbidityContainerRef.current &&
                !comorbidityContainerRef.current.contains(event.target)
            ) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Thêm logic ngăn cuộn trang khi modal mở
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup effect khi component unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const addExam = async () => {

        if (!userInfo?.id || !cid || !specialtySelected || !symptom) {
            message.error('Thông tin không hợp lệ!');
            return;
        }

        let insuranceCoverage = getThirdDigitFromLeft(insurance);

        const data = {
            userId: userInfo.id,
            staffId: specialtySelected.staffId,
            symptom: symptom,
            special: prioritize ? prioritize : "normal",
            insuranceCoverage: insuranceCoverage || null,
            insuaranceCode: insurance,
            roomName: specialtySelected.label,
            price: specialtySelected.staffPrice,
            comorbidities: selectedComorbidities ? selectedComorbidities.map(item => item.id).join(',') : null,
            time: timeSlot ? timeSlot : null,
            is_appointment: timeSlot ? 1 : 0,
            status: timeSlot ? 2 : 4
        }

        try {
            const response = await createExamination(data);
            if (response.EC === 0 && response.DT && response.DT.id) {
                message.success('Thêm khám bệnh thành công!');
                handleAddExamSuscess();
                resetForm();
                onClose();
            } else {
                message.error('Thêm khám bệnh thất bại!');
            }
        } catch (error) {
            console.error("Error creating examination:", error.response?.data || error.message);
            message.error('Thêm khám bệnh thất bại!');
        }
    }

    const updateExam = async () => {

        if (!userInfo?.id || !specialtySelected) {
            message.error('Thông tin không hợp lệ!');
            return;
        }

        let insuranceCoverage = getThirdDigitFromLeft(insurance);

        const data = {
            id: examId,
            userId: userInfo.id,
            staffId: specialtySelected.staffId,
            symptom: symptom,
            special: prioritize ? prioritize : "normal",
            insuranceCoverage: insuranceCoverage || null,
            insuaranceCode: insurance,
            roomName: specialtySelected.label,
            price: specialtySelected.staffPrice,
            comorbidities: selectedComorbidities ? selectedComorbidities.map(item => item.id).join(',') : null,
            status: patientData?.paymentId ? STATUS_BE.PAID : STATUS_BE.WAITING
            // is_appointment: 0, -->bỏ nhe. để thống kê
        }

        try {
            const response = await updateExamination(data);

            if (response.EC === 0 && response.DT.includes(1)) {
                message.success('Cập nhật bệnh nhân thành công');
                handleAddExamSuscess();
                resetForm();
                onClose();
            } else {
                message.error('Cập nhật bệnh nhân thất bại');
            }
        } catch (error) {
            console.error("Error:", error);
            message.error('Cập nhật bệnh nhân thất bại');
        }
    }

    const deleteExam = async () => {
        const data = {
            id: examId,
            status: 0
        }

        try {
            const response = await updateExamination(data);

            if (response.EC === 0 && response.DT.includes(1)) {
                message.success('Hủy lịch khám thành công');
                handleAddExamSuscess();
                resetForm();
                onClose();
            } else {
                message.error('Hủy lịch khám thất bại');
            }
        } catch (error) {
            console.error("Error:", error);
            message.error('Hủy lịch khám thất bại');
        }
    }

    if (!isOpen) return null;

    return (
        <div className="add-exam-container">
            <div className="add-exam-content">
                {isEditMode ? (
                    <div className='add-exam-header'>
                        Hồ sơ khám bệnh
                    </div>
                ) : (
                    <div className='add-exam-header'>
                        Thêm hồ sơ khám bệnh
                    </div>
                )}

                <div className='add-exam-body'>
                    <div className='pation-info'>
                        {isEditMode ? (
                            <>
                                <div className="patient-name row mt-3">
                                    {userInfo?.lastName && userInfo?.firstName ? (
                                        <div className='row'>
                                            <div className='col-12 d-flex flex-row'>
                                                <div className='col-2'>
                                                    <p style={{ fontWeight: "400" }}>Bệnh nhân:</p>
                                                </div>
                                                <div className='col-8'>
                                                    <p>{userInfo.lastName} {userInfo.firstName}</p>
                                                </div>
                                            </div>
                                            <div className='col-12 d-flex flex-row mt-3 mb-2'>
                                                <div className='col-2 d-flex align-items-center'>
                                                    <p style={{ fontWeight: "400" }}>Số BHYT:</p>
                                                </div>
                                                <div className='col-5'>
                                                    <input className='input-add-exam' style={{ width: "93%" }} maxLength={10}
                                                        type='text' value={insurance} onChange={(e) => setInsurance(e.target.value)}
                                                        placeholder='Nhập số BHYT...' />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center mb-3">
                                            <Spin />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <p>Thông tin bệnh nhân:</p>
                                <div className='info-action'>
                                    <input className='input-add-exam' maxLength={12} onBlur={handleFindUser}
                                        type='text' value={cid} onChange={(e) => setCid(e.target.value)}
                                        placeholder='Nhập số CCCD để tìm kiếm...' />
                                    <button className='find-patient' onClick={handleAddUser}>
                                        <i className="fa-solid fa-plus"></i>
                                    </button>
                                </div>
                                <div className={`patient-name row mt-3 ${loading ? '' :
                                    userInfo?.lastName && userInfo?.firstName ? 'text-loading' : 'text-danger ms-1 mb-2'
                                    }`}>
                                    {isSearched && (
                                        loading ? (
                                            <div className="loading text-center">
                                                <Spin />
                                            </div>
                                        ) : userInfo?.lastName && userInfo?.firstName ? (
                                            <div className='row'>
                                                <div className='col-12 d-flex flex-row'>
                                                    <div className='col-2'>
                                                        <p>Bệnh nhân:</p>
                                                    </div>
                                                    <div className='col-8'>
                                                        <p style={{ color: "black", fontWeight: "400" }}>{userInfo.lastName} {userInfo.firstName}</p>
                                                    </div>
                                                </div>
                                                <div className='col-12 d-flex flex-row mt-3 mb-2'>
                                                    <div className='col-2 d-flex align-items-center'>
                                                        <p>Số BHYT:</p>
                                                    </div>
                                                    <div className='col-5'>
                                                        <input
                                                            className='input-add-exam'
                                                            style={{ width: "93%" }}
                                                            maxLength={10}
                                                            type='text'
                                                            value={insurance}
                                                            onChange={(e) => setInsurance(e.target.value)}
                                                            placeholder='Nhập số BHYT...'
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : 'Không tìm thấy bệnh nhân...'
                                    )}
                                </div>
                            </>
                        )}

                    </div>
                    <div className='pation-info row mb-4'>
                        <div className='col-7'>
                            <p>Phòng khám:</p>
                            <div className='info-action'>
                                <Select
                                    showSearch
                                    placeholder="Chọn phòng khám"
                                    optionFilterProp="label"
                                    options={specialtyOptions}
                                    style={{ width: '100%' }}
                                    value={specialtySelected}
                                    className='select-add-exam'
                                    onChange={handleSpecialtyChange}
                                />
                            </div>
                        </div>
                        <div className='col-5'>
                            <p>Bác sĩ:</p>
                            <div className='info-action'>
                                <input className='input-add-exam' maxLength={12} readOnly style={{ marginRight: 0 }}
                                    type='text' value={specialtySelected ? specialtySelected.staffName : 'Chưa chọn phòng khám'}
                                    placeholder='Chọn phòng khám trước' />
                            </div>
                        </div>
                    </div>
                    <div className='exam-info'>
                        <p>Ưu tiên:</p>
                        <RadioButtonList
                            value={prioritize}
                            handleChangePrioritize={handleChangePrioritize}
                        />
                    </div>
                    <div className='exam-info'>
                        <p>Triệu chứng:</p>
                        <input className='input-add-exam'
                            type='text' value={symptom} onChange={(e) => setSymptom(e.target.value)}
                            placeholder='Nhập triệu chứng...' />
                    </div>
                    <div className='exam-info'>
                        <p>Bệnh đi kèm:</p>
                        <div
                            ref={comorbidityContainerRef}
                            className='comorbidities-action'
                        >
                            <div className='comorbidities-list'>
                                {selectedComorbidities.map(comorbidity => (
                                    <div
                                        key={comorbidity.id}
                                        className={`comorbidities-item mb-2 ${shakeId === comorbidity.id ? 'shake' : ''}`}
                                    >
                                        <p>{comorbidity.label}</p>
                                        <i
                                            className="fa-solid me-2 fa-times"
                                            onClick={() => handleRemoveComorbidity(comorbidity.id)}
                                        ></i>
                                    </div>
                                ))}
                            </div>
                            {/* Input tìm kiếm bệnh đi kèm */}
                            <input
                                ref={inputRef}
                                className='input-add-exam'
                                type='text'
                                placeholder='Thêm bệnh đi kèm...'
                                style={{ background: '#eeeeee', border: 'none', boxShadow: 'none' }}
                                value={inputComorbidity}
                                onChange={handleInputChange}
                                onFocus={() => setShowSearchResults(true)}
                            />
                            {/* Hiển thị danh sách bệnh đi kèm khi có kết quả tìm kiếm */}
                            {showSearchResults && inputComorbidity && (
                                <div
                                    ref={searchResultsRef}
                                    className='search-results'
                                >
                                    {filteredComorbidities.map(comorbidity => (
                                        <div
                                            key={comorbidity.id}
                                            className='search-item'
                                            onClick={() => handleSelectComorbidity(comorbidity)}
                                        >
                                            {comorbidity.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className='add-exam-footer'>
                    <button className="close-exam-btn" onClick={onClose}>Đóng</button>
                    {isEditMode ? (
                        <>
                            <button style={{ background: "#F44343" }} className='add-exam-btn me-2' onClick={() => deleteExam()}>Hủy lịch</button>
                            <button className='add-exam-btn' onClick={() => updateExam()}>Xác nhận</button>
                        </>
                    ) : (
                        <button className='add-exam-btn' onClick={() => addExam()}>Thêm</button>
                    )}
                </div>
            </div>
            <AddUserModal
                isOpen={isUserModalOpen}
                onClose={closeAddUser}
                handleAddUserSuscess={handleAddUserSuscess}
            />
        </div>
    );
};

AddExamModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    timeSlot: PropTypes.number,
    handleAddExamSuscess: PropTypes.func.isRequired,
    isEditMode: PropTypes.bool,
    examId: PropTypes.number,
    patientData: PropTypes.object,
    comorbiditiesOptions: PropTypes.array,
    specialtyOptions: PropTypes.array,
}

export default AddExamModal;