import { message } from 'antd';
import { PropTypes } from 'prop-types';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import { getThirdDigitFromLeft } from '@/utils/numberSeries';
import { checkOutExamination, checkOutParaclinical, updateExamination, updateListPayParaclinicals } from '@/services/doctorService';
import './PayModal.scss';
import { PAYMENT_METHOD, STATUS_BE } from '@/constant/value';

const PayModal = ({ isOpen, onClose, onPaySusscess, examId, type, patientData }) => {
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD.CASH);
    const [insurance, setInsurance] = useState('');
    const [insuranceCoverage, setInsuranceCoverage] = useState(null);
    const [special, setSpecial] = useState('normal');
    const [data, setData] = useState({
        infouser: { firstName: '', lastName: '', cid: '' },
        infostaff: { firstName: '', lastName: '', position: '' },
        price: 0,
        description: '',
        paraclinicalItems: []
    });

    // Use useEffect to set initial data when component mounts or patientData changes
    useEffect(() => {
        if (!isOpen || !patientData) return;

        let newSpecial = 'normal';
        let newData = {};

        if (type === 'examination') {
            newSpecial = patientData?.special || 'normal';
            newData = {
                infouser: {
                    firstName: patientData?.userExaminationData?.firstName,
                    lastName: patientData?.userExaminationData?.lastName,
                    cid: patientData?.userExaminationData?.cid,
                },
                infostaff: {
                    firstName: patientData?.examinationStaffData?.staffUserData?.firstName,
                    lastName: patientData?.examinationStaffData?.staffUserData?.lastName,
                    position: patientData?.examinationStaffData?.position,
                },
                price: patientData?.examinationStaffData?.price,
                description: 'Khám bệnh',
            };

            setInsurance(patientData?.insuaranceCode || '');
            setInsuranceCoverage(patientData?.insuranceCoverage || null);
        } else {
            newSpecial = patientData?.special || 'normal';
            newData = {
                infouser: {
                    firstName: patientData?.userExaminationData?.firstName,
                    lastName: patientData?.userExaminationData?.lastName,
                    cid: patientData?.userExaminationData?.cid,
                },
                // infostaff: {
                //     firstName: patientData?.doctorParaclinicalData?.staffUserData?.firstName,
                //     lastName: patientData?.doctorParaclinicalData?.staffUserData?.lastName,
                //     position: patientData?.doctorParaclinicalData?.position,
                // },
                price: patientData?.totalParaclinicalPrice,
                paraclinicalItems: patientData?.paraclinicalItems,
            };

            setInsurance(patientData?.insuaranceCode || '');
            setInsuranceCoverage(patientData?.insuranceCoverage || null);
        }

        setSpecial(newSpecial);
        setData(newData);
    }, [isOpen, patientData, type]);

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

    const handlePay = async () => {
        try {
            let paymentData = {};

            if (type === 'examination') {
                paymentData = {
                    id: examId,
                    insuranceCoverage: insuranceCoverage || null,
                    insuaranceCode: insurance,
                    status: STATUS_BE.PAID,
                    payment: paymentMethod
                };
                if (paymentMethod === PAYMENT_METHOD.CASH) {
                    const response = await updateExamination(paymentData);
                    if (response.EC === 0 && response.DT.includes(1)) {
                        message.success('Cập nhật bệnh nhân thành công!');
                        onPaySusscess();
                        resetForm();
                        onClose();
                    } else {
                        message.error('Cập nhật bệnh nhân thất bại!');
                    }
                } else {
                    let response = await checkOutExamination(paymentData);
                    if (response.data.EC === 0) {
                        window.location.href = response?.data?.DT?.shortLink;
                    } else {
                        message.error(response.data.EM);
                    }
                }

            } else if (type === 'paraclinical') {
                try {
                    const ids = patientData.paraclinicalItems.map(item => item.id);
                    if (paymentMethod === PAYMENT_METHOD.CASH) {
                        const response = await updateListPayParaclinicals({ ids });

                        if (response.EC === 0) {
                            message.success('Cập nhật bệnh nhân thành công');
                            onPaySusscess();
                            resetForm();
                            onClose();
                        } else {
                            message.error('Cập nhật bệnh nhân thất bại');
                        }
                    } else {
                        const response = await checkOutParaclinical({ ids });

                        if (response.data.EC === 0) {
                            window.location.href = response?.data?.DT?.shortLink;
                        } else {
                            message.error(response.data.EM);
                        }
                    }
                } catch (error) {
                    message.error('Cập nhật bệnh nhân thất bại!');
                }
            }

        } catch (error) {
            console.log(error);
            message.error('Cập nhật bệnh nhân thất bại!');
        }
    };

    const resetForm = () => {
        setInsurance('');
        setInsuranceCoverage(null);
    };

    const handleInsuaranceChange = (e) => {
        const newInsurance = e.target.value;
        setInsurance(newInsurance);

        if (newInsurance.length === 10) {
            setInsuranceCoverage(getThirdDigitFromLeft(newInsurance));
        } else {
            setInsuranceCoverage(null);
        }
    };

    const SpecialText = ({ special }) => {
        let specialClass = '';
        let specialText = '';

        switch (special) {
            case 'normal':
                specialClass = 'special';
                specialText = '';
                break;
            case 'old':
                specialClass = 'special-old';
                specialText = 'Người già';
                break;
            case 'children':
                specialClass = 'special-children';
                specialText = 'Trẻ em';
                break;
            case 'disabled':
                specialClass = 'special-disabled';
                specialText = 'Người tàn tật';
                break;
            case 'pregnant':
                specialClass = 'special-pregnant';
                specialText = 'P.nữ mang thai';
                break;
            default:
                specialClass = 'special';
        }

        return <p className={`special ${specialClass}`}>{specialText}</p>;
    };

    if (!isOpen) return null;

    return (
        <div className="payment-container">
            <div className="payment-content">
                <div className='payment-header'>
                    Thanh toán tiền khám
                </div>

                <div className='row'>
                    <div className='col-12 d-flex flex-row'>
                        <div className='col-3'>
                            <p style={{ fontWeight: "400" }}>Bệnh nhân:</p>
                        </div>
                        <div className='col-8'>
                            <p>{data.infouser.lastName + ' ' + data.infouser.firstName}</p>
                        </div>
                    </div>
                    <div className='col-12 d-flex flex-row mt-3'>
                        <div className='col-3 d-flex align-items-center'>
                            <p style={{ fontWeight: "400" }}>CCCD/CMND:</p>
                        </div>
                        <div className='col-3'>
                            <p>{data.infouser.cid}</p>
                        </div>
                        <div className='col-1' />
                        <div className='col-2 d-flex align-items-center'>
                            <p style={{ fontWeight: "400" }}>Ưu tiên:</p>
                        </div>
                        <div className='col-3'>
                            {SpecialText({ special })}
                        </div>
                    </div>
                    <hr className='mt-4' />
                    {type === 'examination' ? (
                        <>
                            <div className='col-12 d-flex flex-row'>
                                <div className='col-3 d-flex align-items-center'>
                                    <p style={{ fontWeight: "400" }}>Bác sĩ:</p>
                                </div>
                                <div className='col-8'>
                                    <p>{data.infostaff.position + ' ' + data.infostaff.lastName + ' ' + data.infostaff.firstName}</p>
                                </div>
                            </div>
                            <div className='col-12 d-flex flex-row mt-3'>
                                <div className='col-3 d-flex align-items-center'>
                                    <p style={{ fontWeight: "400" }}>Mô tả:</p>
                                </div>
                                <div className='col-8' style={{ color: "#008EFF", fontWeight: '600' }}>
                                    <p>{data.description}</p>
                                </div>
                            </div>
                            <hr className='mt-4' />
                        </>
                    ) : (
                        <>
                            {data?.paraclinicalItems.length > 0 && data.paraclinicalItems.map((item, index) => (
                                <div className='col-12 d-flex flex-column mb-3 pres-item' key={index}>
                                    <div className='col-12 d-flex align-items-center'>
                                        <p style={{ fontWeight: "500", color: "#007BFF" }}>Cận lâm sàng: {item?.paracName}</p>
                                    </div>
                                    <div className='col-12 mt-2 mb-1 d-flex align-items-start'>
                                        <div className='col-3'>
                                            <p className='text-start' style={{
                                                width: "100%",
                                                wordWrap: "break-word",
                                                overflowWrap: "break-word",
                                                whiteSpace: "normal"
                                            }}>Bác sĩ: {item?.doctorInfo?.doctorName}</p>
                                        </div>
                                        <div className='col-6 d-flex align-items-center'>
                                            <p className='text-end' style={{ fontWeight: "400", width: '100%' }}>Phòng: {item?.roomInfo?.name}</p>
                                        </div>
                                        <div className='col-1' />
                                        <div className='col-2 d-flex align-items-center'>
                                            <p>Giá: {formatCurrency(item?.price)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                    <div className='col-12 d-flex flex-row mt-3 mb-2'>
                        <div className='col-3 d-flex align-items-center'>
                            <p style={{ fontWeight: "400" }}>Số BHYT:</p>
                        </div>
                        <div className='col-3'>
                            <input className='input-add-exam' style={{ width: "93%" }} maxLength={10}
                                type='text' value={insurance} onChange={handleInsuaranceChange}
                                placeholder='Nhập số BHYT...' />
                        </div>
                        <div className='col-1' />
                        <div className='col-2 d-flex align-items-center'>
                            <p style={{ fontWeight: "400" }}>Mức hưởng:</p>
                        </div>
                        <div className='col-2 d-flex align-items-center'>
                            <p>
                                {insuranceCoverage === 0 ? '' : insuranceCoverage}
                            </p>
                        </div>
                    </div>
                    <div className='col-12 d-flex flex-row mt-3'>
                        <div className='col-3 d-flex align-items-center'>
                            <p style={{ fontWeight: "400" }}>Giá khám:</p>
                        </div>
                        <div className='col-3'>
                            <p>{formatCurrency(data.price)}</p>
                        </div>
                        <div className='col-1' />
                        <div className='col-5 d-flex'>
                            {+patientData?.status === STATUS_BE.PAID ? <div>Đã thanh toán</div> :
                                <>
                                    <label className='me-5'>
                                        <input
                                            className='radio'
                                            type="radio"
                                            value={PAYMENT_METHOD.CASH}
                                            checked={paymentMethod === PAYMENT_METHOD.CASH}
                                            onChange={() => setPaymentMethod(PAYMENT_METHOD.CASH)}
                                        />
                                        Tiền mặt
                                    </label>
                                    <label className='ms-4' >
                                        <input
                                            className='radio'
                                            type="radio"
                                            value={PAYMENT_METHOD.MOMO}
                                            checked={paymentMethod === PAYMENT_METHOD.MOMO}
                                            onChange={() => setPaymentMethod(PAYMENT_METHOD.MOMO)}
                                        />
                                        Chuyển khoản
                                    </label>
                                </>}
                        </div>
                    </div>
                </div>
                <div className='payment-footer mt-4'>
                    <button className="close-user-btn" onClick={onClose}>Đóng</button>
                    {+patientData?.status === STATUS_BE.PAID ? <></>
                        :
                        <button className='payment-btn' onClick={handlePay}>Hoàn thành</button>
                    }
                </div>
            </div>
        </div>
    )

}

PayModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onPaySusscess: PropTypes.func.isRequired,
    special: PropTypes.string,
    examId: PropTypes.number,
    patientData: PropTypes.object,
    type: PropTypes.string
}

export default PayModal;