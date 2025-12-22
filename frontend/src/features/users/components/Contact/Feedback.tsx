import React, { useState } from "react";
import fb from "../../../../assets/images/users/fb.png";
import { CheckCircle, X } from "lucide-react";

export default function Feedback() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.message) {
            alert("Vui lòng điền đầy đủ các trường bắt buộc!");
            return;
        }
        console.log("Form submitted:", formData);
        setShowModal(true);
        setFormData({
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: ""
        });
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="w-full bg-white px-4 md:px-10 py-16">
            {showModal && (
                <div className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-[scale-in_0.3s_ease-out]">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-100 rounded-full p-3">
                                <CheckCircle size={48} className="text-green-500" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-center text-[#0A2647] mb-2">
                            Gửi thành công!
                        </h3>
                        <p className="text-center text-gray-600 mb-6">
                            Cảm ơn bạn đã gửi phản hồi. Chúng tôi sẽ phản hồi lại bạn trong thời gian sớm nhất!
                        </p>
                        <button
                            onClick={closeModal}
                            className="w-full bg-[#4169E1] hover:bg-[#3555c7] text-white font-semibold py-3 rounded-lg transition-colors duration-300"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            <div className="w-[700px] h-[2px] bg-[var(--color-surface-dim)] mb-14 mx-auto"></div>
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="w-full">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0A2647] mb-8">
                        Gửi phản hồi
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[#0A2647] font-medium mb-2">
                                Tên người dùng<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Tên người dùng"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[#0A2647] font-medium mb-2">
                                    Địa chỉ email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Địa chỉ email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-[#0A2647] font-medium mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Số điện thoại"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[#0A2647] font-medium mb-2">
                                Chủ đề
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Chủ đề"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-[#0A2647] font-medium mb-2">
                                Lời nhắn<span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Lời nhắn"
                                required
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="bg-[#4169E1] hover:bg-[#3555c7] text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 uppercase tracking-wide"
                        >
                            GỬI PHẢN HỒI
                        </button>
                    </div>
                </div>

                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-xl">
                        <img
                            src={fb}
                            alt="Students studying together"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
            <div className="w-[700px] h-[2px] bg-[var(--color-surface-dim)] mt-20 mx-auto"></div>
        </div>
    );
}