// src/components/Instruction.jsx
import React from "react";
import { Table, Button, Typography } from "antd";
import { Link } from "react-router-dom";
import "./Instruction.scss";

const { Title, Paragraph } = Typography;

const Instruction = () => {
    // Dữ liệu cho tài khoản và vai trò
    const data = [
        {
            key: "1",
            role: "Quản trị viên",
            description: "Quản lý toàn bộ hệ thống, bao gồm người dùng và nội dung.",
            email: "admin@gmail.com",
            password: "123456",
        },
        {
            key: "2",
            role: "Bác sĩ",
            description: "Khám bệnh tạo đơn thuốc, tạo đơn cận lâm sàn.",
            email: "doctorCuong@gmail.com",
            password: "123456",
        },
        {
            key: "3",
            role: "Bác sĩ cận lâm sàn",
            description: "Thêm kết quả xét nghiệm.",
            email: "doctorLan@gmail.com",
            password: "123456",
        },
        {
            key: "4",
            role: "Tiếp nhận",
            description: "Quản lý lịch hẹn, tạo phiếu khám bệnh.",
            email: "receptionist@gmail.com",
            password: "123456",
        },
        {
            key: "5",
            role: "Thanh toán",
            description: "Thanh toán.",
            email: "accountant@gmail.com",
            password: "123456",
        },
        {
            key: "5",
            role: "Dược sĩ",
            description: "Xem đơn thuốc, thanh toán.",
            email: "pharmarDuong@gmail.com",
            password: "123456",
        },
        {
            key: "6",
            role: "Người dùng",
            description: "Sử dụng website.",
            email: "ladat01626362980@gmail.com",
            password: "123456",
        },
    ];

    // Cột của bảng
    const columns = [
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Mật khẩu",
            dataIndex: "password",
            key: "password",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
        },

    ];

    return (
        <div className="instruction">
            <div className="user-guide">
                <Title level={2} style={{ color: "#00B5F1" }}><strong>Hướng dẫn sử dụng</strong></Title>
                <p>Hiện tại, website đang được triển khai phiên bản miễn phí nhằm giới thiệu sản phẩm, với một số tính năng hạn chế (chỉ hỗ trợ xem, chưa kích hoạt các chức năng thêm, xóa, chỉnh sửa). Kết nối backend có thể mất đến 2 phút để hoàn tất. Để trải nghiệm đầy đủ tính năng vui lòng truy cập repository GitHub.</p>

                <Title level={4} style={{ color: "#00B5F1", marginTop: "40px" }}>
                    Các tài khoản đăng nhập vào hệ thống
                </Title>
                <Table columns={columns} dataSource={data} pagination={false} />
            </div>
        </div>
    );
};

export default Instruction;
