interface LocationCardProps {
  image: string;
  name: string;
  address: string;
  deadline: string;
}

 export const LocationCard: React.FC<LocationCardProps> = ({ image, name, address, deadline }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <img src={image} alt={name} className="w-full h-40 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-800 mb-1">{name}</h3>
        <p className="text-sm text-gray-500 mb-3 flex-grow">{address}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-600">Ngày cập nhật: <span className="font-semibold">{deadline}</span></span>
        </div>
        <div className="flex gap-2 mt-auto">
          <button className="flex-1 px-4 py-2 text-sm text-primary border border-gray-200 rounded hover:bg-gray-50 transition-colors hover:cursor-pointer">
            Chi tiết
          </button>
          <button className="flex-1 px-4 py-2 text-sm text-white bg-primary rounded hover:bg-primary-light transition-colors hover:cursor-pointer">
            Xem
          </button>
        </div>
      </div>
    </div>
  );
};
