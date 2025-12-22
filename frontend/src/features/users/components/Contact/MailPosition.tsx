import React from "react";
import { Mail, MapPin } from "lucide-react";

export default function MailPosition() {
    return (
        <div className="w-full bg-white px-4 md:px-10 py-10 flex flex-col gap-10">

            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-20 md:gap-60">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-[#E4F1FF] p-4 rounded-full">
                        <Mail size={36} className="text-[#6096C8]" />
                    </div>
                    <p className="text-[18px] md:text-[20px] font-bold mt-3 text-[#547593]">
                        Gửi mail cho chúng tôi
                    </p>
                    <p className="text-[14px] md:text-[16px] font-medium mt-1 text-[#547593]">
                        Hãy thoải mái gửi email <br /> cho chúng tôi qua
                    </p>
                    <a 
                        href="mailto:anhanhse2@gmail.com"
                        className="text-[16px] md:text-[17px] font-semibold mt-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                    >
                        VNU3D@gmail.com
                    </a>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="bg-[#E4F1FF] p-4 rounded-full">
                        <MapPin size={36} className="text-[#6096C8]" />
                    </div>
                    <p className="text-[18px] md:text-[20px] font-bold mt-3 text-[#547593]">
                        Địa chỉ
                    </p>
                    <p className="text-[14px] md:text-[16px] font-medium mt-1 leading-relaxed text-[#547593]">
                        Nhà Điều Hành ĐHQG-HCM, <br />
                        Phường Linh Trung, <br />
                        TP. Thủ Đức, TP. HCM
                    </p>
                </div>
            </div>

            <div className="w-full">
                <iframe
                    src="https://maps.google.com/maps?q=10.869916,106.796505&hl=vi&z=17&ie=UTF8&iwloc=&output=embed&markers=10.869916,106.796505"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-xl shadow-lg"
                ></iframe>
            </div>
        </div>
    );
}
