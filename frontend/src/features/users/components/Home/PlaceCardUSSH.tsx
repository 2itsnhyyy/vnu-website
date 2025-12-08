import React from 'react'
import USSH from '../../../../assets/images/users/USSH.svg';

const PlaceCardUSSH = () => {
  return (
    <div className="relative w-auto h-96 overflow-hidden">
      <img 
        src={USSH} 
        alt="Trường Đại học Khoa học Xã hội và Nhân văn"
        className="absolute inset-0 w-120 h-full object-cover object-top z-100" 
      />
      
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-info-bg z-10 flex flex-col justify-center p-4">
          <h2 className="font-[Brushwell] text-3xl mb-1 text-text-main text-right">Trường Đại học Khoa học Xã hội và Nhân văn</h2>
          <p className="font-bold text-6xl text-white text-right">“NỮ NHÂN QUỐC”</p>
      </div>
    </div>

  );
}

export default PlaceCardUSSH;