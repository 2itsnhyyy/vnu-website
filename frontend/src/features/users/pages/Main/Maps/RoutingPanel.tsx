import { useState, useEffect } from "react";
import { X, ArrowUpDown, MapPin, Navigation } from "lucide-react";
import { mapService } from "../../../api/services/mapService";

interface RoutingPanelProps {
  onFindRoute: (start: any, end: any) => void;
  onClose: () => void;
  startPlace?: any;
  endPlace?: any;
}

export default function RoutingPanel({
  onFindRoute,
  onClose,
  startPlace,
  endPlace,
}: RoutingPanelProps) {
  const [startQuery, setStartQuery] = useState(startPlace?.name || "");
  const [endQuery, setEndQuery] = useState("");
  const [startObj, setStartObj] = useState<any>(startPlace || null);
  const [endObj, setEndObj] = useState<any>(null);

  useEffect(() => {
    if (startPlace) {
      setStartQuery(startPlace.name || "");
      setStartObj(startPlace);
    }
  }, [startPlace]);

  useEffect(() => {
    if (endPlace) {
      setEndQuery(endPlace.name || "");
      setEndObj(endPlace);
    }
  }, [endPlace]);

  const [suggestions, setSuggestions] = useState<{
    type: "start" | "end";
    list: any[];
  } | null>(null);

  const [searchHistory, setSearchHistory] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("place_search_history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {}, 500);
    return () => clearTimeout(timer);
  }, [startQuery, endQuery]);

  const handleSearch = async (text: string, type: "start" | "end") => {
    if (type === "start") setStartQuery(text);
    else setEndQuery(text);

    if (text.length > 1) {
      try {
        const results = await mapService.searchPlaces(text);
        setSuggestions({ type, list: results });
      } catch (e) {
        console.error(e);
      }
    } else {
      setSuggestions(null);
    }
  };

  const addToHistory = (place: any) => {
    const newHistory = [
      place,
      ...searchHistory.filter((p) => p.placeId !== place.placeId),
    ].slice(0, 10);
    setSearchHistory(newHistory);
    try {
      localStorage.setItem("place_search_history", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save search history:", e);
    }
  };

  const selectPlace = (place: any, type: "start" | "end") => {
    if (type === "start") {
      setStartQuery(place.name);
      setStartObj(place);
    } else {
      setEndQuery(place.name);
      setEndObj(place);
    }
    addToHistory(place);
    setSuggestions(null);
  };

  const handleSwap = () => {
    setStartQuery(endQuery);
    setEndQuery(startQuery);
    const temp = startObj;
    setStartObj(endObj);
    setEndObj(temp);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mt-3 w-full relative font-sans animate-in fade-in slide-in-from-top-2 duration-300 border border-gray-100 flex flex-col ">
      <div className="flex justify-between items-center mb-4">
        <h3 className="m-0 text-sm text-gray-800 flex items-center gap-2 font-bold uppercase tracking-wide">
          <Navigation size={16} className="text-blue-600" fill="currentColor" />
          Tìm đường
        </h3>
        <button
          onClick={onClose}
          className="bg-transparent border-none cursor-pointer p-1 rounded-full flex items-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-3 relative flex-1 overflow-hidden ">
        <div className="flex flex-row gap-2 items-center">
          <div className="flex-1 h-full flex flex-col gap-2">
            <div className="relative flex items-center group">
              <div className="absolute left-3 w-2.5 h-2.5 rounded-full border-[3px] border-gray-400 bg-white z-10"></div>
              <input
                className="w-full py-2.5 pl-9 pr-3 rounded bg-gray-50 border border-gray-200 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 font-medium text-gray-700"
                placeholder="Chọn điểm đi..."
                value={startQuery}
                onChange={(e) => handleSearch(e.target.value, "start")}
                onFocus={() => {
                  if (!startQuery || startQuery.length <= 1) {
                    setSuggestions({ type: "start", list: searchHistory });
                  }
                }}
              />
            </div>

            <div className="relative flex items-center group">
              <div className="absolute left-3 w-2.5 h-2.5 rounded-full bg-red-500 z-10 shadow-sm"></div>
              <input
                className="w-full py-2.5 pl-9 pr-3 rounded bg-gray-50 border border-gray-200 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 font-medium text-gray-700"
                placeholder="Chọn điểm đến..."
                value={endQuery}
                onChange={(e) => handleSearch(e.target.value, "end")}
                onFocus={() => {
                  if (!endQuery || endQuery.length <= 1) {
                    setSuggestions({ type: "end", list: searchHistory });
                  }
                }}
              />
            </div>
          </div>
          <button
            onClick={handleSwap}
            className="  bg-white border border-gray-200 rounded-full w-8 h-8 flex justify-center items-center cursor-pointer text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all z-20"
            title="Đổi chiều"
          >
            <ArrowUpDown size={16} strokeWidth={2.5} />
          </button>
        </div>

        {(suggestions ||
          (startQuery.length <= 1 &&
            endQuery.length <= 1 &&
            searchHistory.length > 0)) && (
          <div
            className="bg-white  rounded-lg shadow-lg flex-1 overflow-y-auto py-1 mt-1 min-h-0"
            style={{ zIndex: 9999 }}
          >
            {(suggestions ? suggestions.list : searchHistory).map((p) => (
              <div
                key={p.placeId || Math.random()}
                onClick={() => {
                  const type =
                    suggestions?.type ||
                    (startQuery.length <= 1 ? "start" : "end");
                  selectPlace(p, type);
                }}
                className="px-4 py-3 border-b border-gray-50 cursor-pointer  flex items-center justify-center text-gray-700 hover:bg-blue-50 transition-colors last:border-none group"
              >
                <MapPin
                  size={16}
                  className="mr-3 mt-0.5 text-gray-400 shrink-0 group-hover:text-blue-500"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-sm text-gray-800 truncate group-hover:text-blue-700">
                    {p.name}
                  </span>
                  {p.address && p.address !== p.name && (
                    <span className="text-xs text-gray-500 truncate mt-0.5">
                      {p.address}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end shrink-0">
        <button
          onClick={() => onFindRoute(startObj, endObj)}
          disabled={!startObj || !endObj}
          className="bg-blue-600 text-white border-none py-2 px-6 rounded-lg text-sm font-semibold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none transition-all duration-200 flex items-center gap-2 shadow-md shadow-blue-200"
        >
          <Navigation size={16} fill="currentColor" className="text-blue-100" />
        </button>
      </div>
    </div>
  );
}
