import React from "react";
import IU from "../../../../assets/images/users/IU.svg";

const PlaceCardIU = () => {
  return (
    <div className="relative w-auto h-96 overflow-hidden">
      <div className="absolute bottom-0 right-0 w-full h-1/2 bg-info-bg z-10 flex flex-col justify-center p-4">
        <h2 className="font-[Brushwell] text-3xl mb-1 text-text-main text-left">
          Trường Đại học Quốc tế
        </h2>
        <p className="font-bold text-6xl text-white text-left">
          “HỒNG LÂU MỘNG”
        </p>
      </div>
      <img
        src={IU}
        alt="Trường Đại học Quốc tế"
        className="absolute inset-0 w-230 h-full object-cover object-top z-100 translate-x-85"
      />
    </div>
  );
};

export default PlaceCardIU;
