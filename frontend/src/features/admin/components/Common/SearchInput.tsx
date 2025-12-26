import React, { type ForwardedRef } from "react";
import { SearchOutlined } from "@ant-design/icons";

interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  inputRef?: ForwardedRef<HTMLInputElement>;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  inputRef,
  placeholder = "Tìm kiếm ...",
  ...props
}) => (
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
      <SearchOutlined className="text-[18px]" />
    </span>

    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      className="h-10 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-0"
      {...props}
    />
  </div>
);

export default SearchInput;
