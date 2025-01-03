import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Col, Form, Input, message, Row, Tooltip } from 'antd';
import "./Login.scss";
import { handleConfirmUser, handleLogin } from '@/services/adminService';
import { useDispatch, useSelector } from 'react-redux';
import { login, addRememberLogin, removeRememberAccount } from '@/redux/authenSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROLE } from '@/constant/role';
import { PATHS } from '@/constant/path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
const Login = () => {
    const open = {
        login: "login",
        register: "register",
        forgotPassword: "forgotPassword"
    }
    let [isShow, setIsShow] = useState(open.login);
    let [form] = Form.useForm();
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const [loading, setLoading] = useState(true);
    let rememberLogins = useSelector((state) => state.authen.rememberLogin || []);
    const [showSavedAccounts, setShowSavedAccounts] = useState(false);
    const [rememberMe, setRememberMe] = useState(rememberLogins.length > 0 ? true : false);
    useEffect(() => {
        let confirmToken = queryParams.get('confirm');
        if (confirmToken !== null) {
            const fetchConfirmAsync = async () => {
                const response = await handleConfirmUser({ token: confirmToken });
                if (response?.data?.EC === 0 || response?.data?.EC === 1) {
                    message.success(response?.data?.EM);
                } else {
                    message.error(response?.data?.EM);
                }
            };
            fetchConfirmAsync();
        }
        setLoading(false);
    }, []);

    const handleSelectAccount = (account) => {
        form.setFieldsValue({
            email: account.email,
            password: account.password,
        });
    };

    const onFinish = async (values) => {
        console.log('Success:', values);
        let respone = await handleLogin(values);
        if (respone?.data?.EC === 0) {
            dispatch(login(respone.data.DT));

            if (rememberMe) {
                let remember = {
                    email: values.email,
                    password: values.password
                }
                dispatch(addRememberLogin(remember));
            }

            if (respone.data.DT.user.role) {
                if (respone.data.DT.user.role === ROLE.ADMIN) {
                    navigate(PATHS.ADMIN.DASHBOARD);
                } else if (respone.data.DT.user.role === ROLE.PATIENT) {
                    navigate(PATHS.HOME.HOMEPAGE);
                } else if (respone.data.DT.user.role === ROLE.DOCTOR) {
                    navigate(PATHS.STAFF.APPOINTMENT);
                } else if (respone.data.DT.user.role === ROLE.RECEPTIONIST) {
                    navigate(PATHS.RECEPTIONIST.DASHBOARD);
                } else if (respone.data.DT.user.role === ROLE.PHARMACIST) {
                    navigate(PATHS.RECEPTIONIST.PRESCRIBE);
                } else if (respone.data.DT.user.role === ROLE.ACCOUNTANT) {
                    navigate(PATHS.RECEPTIONIST.CASHIER);
                } else {
                    navigate(PATHS.HOME.HOMEPAGE);
                }
            }
        } else {
            message.error(respone?.data?.EM || 'Đăng nhập thất bại')
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className='login-container'>
            <div className='login-content'>
                <div className='slide'  >
                    {isShow === open.register && <Register login={() => setIsShow(open.login)} />}
                    {isShow === open.forgotPassword && <ForgotPassword login={() => setIsShow(open.login)} />}
                    {isShow === open.login && !loading &&
                        <div className='modal-login'>
                            <span className="icon-back" onClick={() => navigate(PATHS.HOME.HOMEPAGE)}><FontAwesomeIcon icon={faArrowLeft} /> </span>
                            <div className="circle-avatar" onClick={() => navigate(PATHS.HOME.HOMEPAGE)}></div>
                            <h2 className="login-title" onClick={() => navigate(PATHS.HOME.HOMEPAGE)}>Hoa Sen</h2>
                            <Form
                                name="basic"
                                form={form}
                                layout="vertical"
                                className="login-form mt-3"
                                initialValues={{
                                    email: rememberLogins[0]?.email || '',
                                    password: rememberLogins[0]?.password || '',
                                }}
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}>
                                {rememberLogins.length > 0 ?
                                    <Tooltip
                                        color='white'
                                        title={
                                            showSavedAccounts && rememberLogins.length > 0 ? (
                                                <div className="saved-accounts">
                                                    {rememberLogins.map((account, index) => (
                                                        <div
                                                            key={index}
                                                            className="saved-account-item"

                                                        >
                                                            <div onClick={() => handleSelectAccount(account)} className='text'>{account.email}</div>
                                                            <FontAwesomeIcon className='icon' icon={faXmark} onClick={() => dispatch(removeRememberAccount(account))} />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null
                                        }
                                        open={showSavedAccounts}
                                        placement="bottom"
                                        overlayClassName="saved-accounts-tooltip"
                                        onOpenChange={(visible) => setShowSavedAccounts(visible)}
                                    >

                                        <Form.Item
                                            name="email"
                                            rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
                                        >
                                            <Input
                                                className="input"
                                                placeholder="Email"
                                                onFocus={() => setShowSavedAccounts(true)}
                                                onBlur={() => setTimeout(() => setShowSavedAccounts(false), 200)}
                                                onClick={() => setShowSavedAccounts(true)}
                                            /></Form.Item>
                                    </Tooltip> : <Form.Item
                                        name="email"
                                        rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
                                    >
                                        <Input
                                            className="input"
                                            placeholder="Email"
                                        /></Form.Item>
                                }

                                <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
                                    <Input.Password className='input' placeholder='Mật khẩu' width={100} />
                                </Form.Item>
                                <Row>
                                    <Col span={12}>
                                        <Checkbox
                                            checked={rememberMe}
                                            onChange={() => setRememberMe(!rememberMe)}>
                                            Ghi nhớ tài khoản
                                        </Checkbox>
                                    </Col>
                                    <Col span={12}>
                                        <span className="forgot-password" onClick={() => setIsShow(open.forgotPassword)}>
                                            Quên mật khẩu?
                                        </span>
                                    </Col>
                                </Row>
                                <Button type="primary" htmlType="submit" className="login-button">
                                    Đăng nhập
                                </Button>
                            </Form>
                            {/* <div className='line'></div> */}
                            {/* <div className="social-login">
                            <Button icon={<FacebookOutlined />} className="facebook-button">
                                Đăng nhập với Facebook
                            </Button>
                            <Button icon={<FontAwesomeIcon icon={faGoogle} />} className="google-button">
                                Đăng nhập với Google
                            </Button>
                        </div> */}
                            <div className='register-text mt-3' onClick={() => setIsShow(open.register)}><span> <FontAwesomeIcon size='lg' className='me-2' icon={faAddressCard} /> Đăng ký tài khoản</span></div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}
export default Login;