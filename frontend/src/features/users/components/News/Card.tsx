import React from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const Card = ({ id, title, image, date, contentMarkdown = "" }) => {
  const formattedDate = new Date(date);

  const extractImage = (markdown: string) => {
    const match = markdown.match(/!\[.*?\]\((.*?)\)/);
    return match ? match[1] : null;
  };

  const displayImage =
    image || (contentMarkdown ? extractImage(contentMarkdown) : null);

  return (
    <Link
      to={`/users/news/${id}`}
      className="block rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 bg-white group"
    >
      <div className="relative w-full h-56 overflow-hidden bg-gray-100">
        <img
          src={
            displayImage || "https://via.placeholder.com/400x300?text=No+Image"
          }
          alt="News Thumbnail"
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/400x300?text=Image+Error";
          }}
        />
      </div>

      <div className="flex items-center px-4 py-4 text-gray-700">
        <div className="text-center mr-2 flex-shrink-0">
          <p className="text-3xl font-bold leading-none">
            {formattedDate.getDate().toString().padStart(2, "0")}
          </p>
          <p className="text-xs text-gray-500">
            {`${(formattedDate.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-${formattedDate.getFullYear()}`}
          </p>
        </div>

        <div className="w-px h-12 bg-gray-300 mx-4 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-red-600 transition-colors">
            <ReactMarkdown
              allowedElements={["strong", "em", "span"]}
              unwrapDisallowed={true} // Loại bỏ thẻ p bọc ngoài để line-clamp hoạt động
            >
              {title}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;
