import React, { useState } from 'react';
import { faqs, type FaqType } from '../../../../../assets/images/users/assets'
import FaqItem from './FaqItem';

const FaqList: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="container mx-auto px-30 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Câu hỏi<br />thường gặp
          </h2>
          <p className="text-gray-600 mb-4">
            Bạn chưa rõ cách xem bản đồ, tra cứu thông tin hoặc gửi phản hồi?
          </p>
          <p className="text-gray-600">
            Xem ngay các câu hỏi thường gặp bên dưới:
          </p>
        </div>

        <div>
          <ul className="space-y-4">
            {faqs.map((item: FaqType, index: number) => (
              <li
                key={index}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FaqItem 
                  item={item} 
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FaqList;