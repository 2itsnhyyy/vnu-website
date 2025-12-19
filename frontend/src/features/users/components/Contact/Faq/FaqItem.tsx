import React from 'react';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';

interface FaqItemProps {
  item: {
    question: string;
    content: string;
  };
  isOpen: boolean;
  onToggle: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ item, isOpen, onToggle }) => {
  return (
    <div className="p-4 lg:p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
      <div
        className="flex items-center justify-between gap-4"
        onClick={onToggle}
      >
        <h4 className="text-base lg:text-xl font-semibold text-gray-800 transition-colors duration-200 flex-1">
          {item.question}
        </h4>
        <button
          className={`w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-full transition-all duration-300 flex-shrink-0 ${
            isOpen 
              ? 'bg-blue-600 text-white' 
              : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {isOpen ? <AiOutlineMinus size={20} /> : <AiOutlinePlus size={20} />}
        </button>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
          {item.content}
        </p>
      </div>
    </div>
  );
};

export default FaqItem;