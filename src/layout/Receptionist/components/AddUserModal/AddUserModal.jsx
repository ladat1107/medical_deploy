import { Col, DatePicker, Form, message, Row } from 'antd';
import './AddUserModal.scss'
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Input from '@/components/Input';
import { createUser } from '@/services/adminService';

const AddUserModal = ({ isOpen, onClose, handleAddUserSuscess}) => {

    const [form] = Form.useForm();

    const addUser = async () => {
        const data = {
            lastName: form.getFieldValue('lastName'),
            firstName: form.getFieldValue('firstName'),
            cid: form.getFieldValue('cid'),
            phoneNumber: form.getFieldValue('phone'),
            dob: form.getFieldValue('dob'),
            insuranceCode: form.getFieldValue('insuranceCode'),
            roleId: 2
        }

        if(!data.lastName || !data.firstName || !data.cid){
            message.error('Vui lòng nhập đầy đủ thông tin!')
            return
        }

        if(data.cid.length !== 12 || data.phoneNumber.length !== 10){
            message.error('Vui lòng nhập đúng định dạng!')
            return
        }

        try{
            let response = await createUser(data)
            if(response.data.EC === 0 && response.data.DT){
                message.success('Thêm người dùng thành công!')
                handleAddUserSuscess(response.data.DT)
                form.resetFields()
                onClose()
            } else {
                message.error('Thêm người dùng thất bại! ' + response.data.EM)
            }
        } catch (error) {
            console.log(error)
            message.error('Thêm người dùng thất bại!')
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

    if (!isOpen) return null

    return (
        <div className="add-user-container">
            <div className="add-user-content">
                <div className='add-user-header'>
                    Thêm người dùng mới
                </div>

                <Form
                        layout={'horizontal'}
                        form={form}
                        labelCol={{
                            span: 24,
                        }}
                        wrapperCol={{
                            span: 24,
                        }}
                        initialValues={{

                        }}
                        style={{
                            maxWidth: "100%",
                        }}
                        validateTrigger="onBlur"
                    >
                        <Row gutter={[16, 8]}>
                            <Col sm={24} lg={24}>
                                <Form.Item
                                    name={"lastName"}
                                    label="Họ và tên lót"
                                    rules={[{
                                        required: true,
                                        message: 'Họ và tên lót không được để trống!',
                                    }]}>
                                    <Input placeholder="Nhập họ và tên lót" className='input-add-user' />
                                </Form.Item>
                            </Col>
                            <Col sm={24} lg={24}>
                                <Form.Item
                                    name={"firstName"}
                                    label="Tên"
                                    rules={[{
                                        required: true,
                                        message: 'Tên không được để trống!',
                                    }]}>
                                    <Input placeholder="Nhập tên" className='input-add-user'/>
                                </Form.Item>
                            </Col>
                            <Col sm={24} lg={12}>
                                <Form.Item
                                    name={"cid"}
                                    label="Căn cước công dân"
                                    rules={[{
                                        required: true,
                                        message: 'CCCD không được để trống!',
                                    },{
                                        pattern: /^[0-9]*$/g,
                                        message: 'Vui lòng nhập số!',
                                    },{
                                        validator: (_, value) => {
                                            if (value && value.length !== 12) {
                                                return Promise.reject(new Error('Căn cước công dân phải đủ 12 ký tự!'));
                                            }
                                            return Promise.resolve();
                                        },
                                    },]}>
                                    <Input placeholder="Nhập căn cước công dân" maxLength={12} className='input-add-user'/>
                                </Form.Item>
                            </Col>
                            <Col sm={24} lg={12}>
                                <Form.Item
                                    name={"phone"}
                                    label="Số điện thoại"
                                    rules={[{
                                        pattern: /^[0-9]*$/g,
                                        message: 'Vui lòng nhập số!',
                                    },{
                                        validator: (_, value) => {
                                            if (value && value.length !== 10) {
                                                return Promise.reject(new Error('Số điện thoại phải đủ 10 ký tự!'));
                                            }
                                            return Promise.resolve();
                                        },
                                    },]}
                                >
                                    <Input placeholder="Nhập số điện thoại" maxLength={10} className='input-add-user'/>
                                </Form.Item>
                            </Col>
                            <Col sm={24} lg={12}>
                                <Form.Item
                                    name={"dob"}
                                    label="Ngày sinh">
                                    <DatePicker 
                                        inputReadOnly 
                                        showToday={false}
                                        placeholder="Chọn ngày sinh" 
                                        className='input-add-user'/>
                                </Form.Item>
                            </Col>
                            <Col sm={24} lg={12}>
                                <Form.Item
                                    name={"insuranceCode"}
                                    label="Bảo hiểm y tế"
                                    rules={[{
                                        pattern: /^[0-9]*$/g,
                                        message: 'Vui lòng nhập số!',
                                    }]}
                                >
                                    <Input placeholder="Nhập số BHYT" maxLength={10} className='input-add-user'/>
                                </Form.Item>    
                            </Col>
                        </Row>
                    </Form>

                <div className='add-user-footer mt-4'>
                    <button className="close-user-btn" onClick={onClose}>Đóng</button>
                    <button className='add-user-btn' onClick={addUser}>Thêm</button>
                </div>
            </div>
        </div>
    )
}

AddUserModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    handleAddUserSuscess: PropTypes.func.isRequired
}

export default AddUserModal