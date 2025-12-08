"use client";
import React, { useState } from "react";
// 1. Import Link từ react-router-dom
import { Link } from "react-router-dom"; 
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import logo_Web from "../../../assets/logos/LogoChu.svg";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Đăng ký email:", email);
    setEmail("");
  };

  return (
    // 2. Đổi bg-black thành bg-text-main (màu xanh đen đậm theme của bạn)
    <footer className="bg-text-main text-white py-16 border-t border-primary/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* Left Side - Logo and Form */}
          <div className="space-y-4">
            <img
              src={logo_Web}
              alt="Heart2Heart Logo"
              className="h-20 w-auto brightness-0 invert" // Làm logo trắng nếu cần thiết
            />
            <h3 className="text-2xl font-bold">Tham Gia Bản Tin</h3>
            <form onSubmit={handleSubmit} className="flex max-w-lg">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn"
                // Text màu đen main để dễ đọc trên nền trắng
                className="px-4 py-3 rounded-l-full w-full text-text-main bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                // 3. Đổi nút màu vàng thành màu Primary, hover Primary Light
                className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-r-full flex items-center whitespace-nowrap transition-colors duration-200"
              >
                Đăng ký <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Right Side - Slogan and Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Slogan */}
            <div className="sm:col-span-3">
              <h2 className="text-3xl font-heavy mb-1">Cùng Nhau Khám Phá,</h2>
              <h2 className="text-3xl font-heavy text-primary-light">
                Cùng Nhau Hiểu Biết Thêm Về ĐHQG-HCM
              </h2>
            </div>

            {/* Thông tin liên hệ */}
            <div>
              <h3 className="text-xl font-bold mb-4 border-b-2 border-primary w-fit pb-1">Thông Tin</h3>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-start">
                  <MapPin className="mr-2 h-5 w-5 text-primary-light mt-1 flex-shrink-0" />
                  <span>Phường Linh Trung, TP. Thủ Đức, TP. HCM.</span>
                </li>
                <li className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-primary-light flex-shrink-0" />
                  <span>(+84)375 022 156</span>
                </li>
                <li className="flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-primary-light flex-shrink-0" />
                  <span>myvnu@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Liên kết - SỬ DỤNG LINK THAY CHO A */}
            <div>
              <h3 className="text-xl font-bold mb-4 border-b-2 border-primary w-fit pb-1">Liên Kết</h3>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <Link
                    to="/forum"
                    className="text-white hover:text-primary-light transition-colors"
                  >
                    Diễn đàn
                  </Link>
                </li>
                <li>
                  <Link
                    to="/maps"
                    className="text-white hover:text-primary-light transition-colors"
                  >
                    Bản đồ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/news"
                    className="text-white hover:text-primary-light transition-colors"
                  >
                    Tin tức
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-white hover:text-primary-light transition-colors"
                  >
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kết nối - Mạng xã hội (Vẫn dùng thẻ a vì link ra ngoài) */}
            <div>
              <h3 className="text-xl font-bold mb-4 border-b-2 border-primary w-fit pb-1">Kết Nối</h3>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-primary-light transition-colors"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-primary-light transition-colors"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-primary-light transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Copyright Line */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Heart2Heart. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;