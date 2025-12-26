import { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Polyline from "@arcgis/core/geometry/Polyline";
import Polygon from "@arcgis/core/geometry/Polygon";
import Point from "@arcgis/core/geometry/Point";
import Search from "@arcgis/core/widgets/Search";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import { ArrowUpDown } from "lucide-react";
import "@arcgis/core/assets/esri/themes/light/main.css";

import { mapService } from "../../../api/services/mapService";
import { addMeshToLayer, addPrismToLayer } from "./render";
import RoutingPanel from "./RoutingPanel";
import BuildingInfoPanel from "./BuildingInfoPanel";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function MapView() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const searchWidgetDiv = useRef<HTMLDivElement>(null);
  const viewRef = useRef<SceneView | null>(null);
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null);
  const routeLayerRef = useRef<GraphicsLayer | null>(null);
  const highlightLayerRef = useRef<GraphicsLayer | null>(null);
  const searchWidgetRef = useRef<Search | null>(null);

  const placesCacheRef = useRef<Record<string, any>>({});

  const [buildings, setBuildings] = useState<any[]>([]);
  const [viewState, setViewState] = useState({
    center: { lat: 10.8709, lon: 106.8023 },
    zoom: 18,
    heading: 0,
    tilt: 65,
  });

  const debouncedCenter = useDebounce(viewState.center, 500);
  const debouncedZoom = useDebounce(viewState.zoom, 500);
  const debouncedHeading = useDebounce(viewState.heading, 500);
  const debouncedTilt = useDebounce(viewState.tilt, 500);

  const [isRoutingMode, setIsRoutingMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [routingStartPlace, setRoutingStartPlace] = useState<any>(null);
  const [routingEndPlace, setRoutingEndPlace] = useState<any>(null);
  const renderedIds = useRef<Set<number>>(new Set());
  const renderedPlaceIds = useRef<Set<number>>(new Set());
  const placesLayerRef = useRef<GraphicsLayer | null>(null);
  useEffect(() => {
    if (!mapDiv.current) return;

    const map = new Map({ basemap: "osm", ground: "world-elevation" });

    const view = new SceneView({
      container: mapDiv.current,
      map,
      camera: {
        position: { longitude: 106.8023, latitude: 10.8709, z: 300 },
        tilt: 65,
      },
      environment: {
        lighting: {
          directShadowsEnabled: true,
          ambientOcclusionEnabled: true,
        } as any,
      },
      ui: {
        components: ["attribution", "navigation-toggle", "compass", "zoom"],
      },
    });

    const graphicsLayer = new GraphicsLayer({
      elevationInfo: { mode: "relative-to-ground" },
    });
    const routeLayer = new GraphicsLayer({
      elevationInfo: { mode: "on-the-ground" },
    });
    const highlightLayer = new GraphicsLayer({
      elevationInfo: { mode: "on-the-ground" },
    });
    const placesLayer = new GraphicsLayer({
      elevationInfo: { mode: "on-the-ground" },
    });
    map.addMany([graphicsLayer, routeLayer, highlightLayer, placesLayer]);

    viewRef.current = view;
    graphicsLayerRef.current = graphicsLayer;
    routeLayerRef.current = routeLayer;
    highlightLayerRef.current = highlightLayer;
    placesLayerRef.current = placesLayer;

    const customSource: any = {
      name: "Dữ liệu nội bộ",
      placeholder: "Tìm kiếm địa điểm trong ĐHQG",
      maxResults: 5,
      maxSuggestions: 5,
      getSuggestions: async (params: any) => {
        const term = params?.suggestTerm ?? params?.searchTerm ?? "";
        if (!term || term.trim().length === 0) return [];
        try {
          const places = await mapService.searchPlaces(term.trim());
          return places.map((p: any) => {
            const id = String(p.placeId ?? p.id ?? p.name);
            placesCacheRef.current[id] = p;
            return {
              key: id,
              text: p.name,
              sourceIndex: params.sourceIndex,
            };
          });
        } catch (e) {
          return [];
        }
      },
      getResults: async (params: any) => {
        const suggestResult = params?.suggestResult;
        const key =
          suggestResult?.key != null
            ? String(suggestResult.key)
            : String(params?.searchTerm ?? "");

        let p: any = null;

        try {
          const placeId = Number(key);
          p = await mapService.getPlace(placeId);
        } catch (e) {
          // Error fetching place details
        }

        if (!p) return [];

        let geometry: Point | Polygon;

        highlightLayerRef.current?.removeAll();
        const geomType = p.boundaryGeom?.type?.toLowerCase();
        if (
          geomType === "polygon" &&
          p.boundaryGeom?.coordinates &&
          Array.isArray(p.boundaryGeom.coordinates[0])
        ) {
          geometry = new Polygon({
            rings: p.boundaryGeom.coordinates[0],
            spatialReference: { wkid: 4326 },
          });

          const highlightGraphic = new Graphic({
            geometry,
            symbol: {
              type: "simple-fill",
              color: [26, 115, 232, 0.25],
              outline: {
                color: [26, 115, 232, 1],
                width: 2,
              },
            } as any,
          });
          highlightLayerRef.current?.add(highlightGraphic);
        } else {
          const lon = p.location?.lon || p.coordinates?.[0] || 106.8023;
          const lat = p.location?.lat || p.coordinates?.[1] || 10.8709;
          geometry = new Point({
            longitude: lon,
            latitude: lat,
            spatialReference: { wkid: 4326 },
          });
        }

        const graphic = new Graphic({
          geometry,
          attributes: { name: p.name, ...p },
          symbol: {
            type: "simple-marker",
            style: "circle",
            color: [255, 255, 255, 0.01],
            outline: { width: 0 },
          } as any,
        });
        if (geometry.type === "polygon" && geometry.extent) {
          view.goTo(
            { target: geometry.extent.expand(1.1), tilt: 60 },
            { duration: 1000 }
          );
        } else if (geometry.type === "point") {
          view.goTo(
            { target: geometry, zoom: 19, tilt: 65 },
            { duration: 1000 }
          );
        }

        return [
          {
            feature: graphic,
            name: p.name,
          },
        ];
      },
    };

    if (searchWidgetDiv.current) {
      const search = new Search({
        view: view,
        container: searchWidgetDiv.current,
        includeDefaultSources: false,
        sources: [customSource],
        locationEnabled: false,
        popupEnabled: false,
        resultGraphicEnabled: true,
      });
      search.on("search-clear", () => {
        highlightLayerRef.current?.removeAll();
      });

      search.on("select-result", async (event: any) => {
        const result = event.result;
        if (result?.feature?.attributes) {
          const attrs = result.feature.attributes;
          if (attrs.placeId) {
            try {
              const place = await mapService.getPlace(attrs.placeId);
              if (place) {
                setSelectedItem({
                  name: place.name,
                  description: place.description,
                  placeName: place.placeName,
                  image: place.image,
                  placeId: place.placeId,
                  address: place.address,
                  openTime: place.openTime,
                  closeTime: place.closeTime,
                  phone: place.phone,
                  type: "place",
                });
              }
            } catch (e) {
              // Error fetching place
            }
          }
        }
      });

      searchWidgetRef.current = search;
    }

    view.on("click", async (event: any) => {
      const response = await view.hitTest(event);
      const graphicResults = response.results.filter(
        (r: any) => r.type === "graphic" && r.graphic
      ) as any[];

      if (graphicResults.length === 0) {
        setSelectedItem(null);
        highlightLayerRef.current?.removeAll();
        return;
      }

      let graphicHit = graphicResults.find(
        (r: any) => r.graphic?.attributes?.buildingId
      );

      if (!graphicHit) {
        graphicHit = graphicResults.find(
          (r: any) =>
            r.graphic?.attributes?.placeId && !r.graphic?.attributes?.buildingId
        );
      }

      if (!graphicHit) {
        graphicHit = graphicResults[0];
      }

      if (graphicHit?.graphic) {
        const graphic = graphicHit.graphic;
        const attributes = graphic.attributes || {};

        if (attributes.buildingId) {
          setSelectedItem({
            name: attributes.name,
            description: attributes.description,
            floors: attributes.floors,
            placeName: attributes.placeName,
            image: attributes.imageUrl || attributes.image,
            buildingId: attributes.buildingId,
            placeId: attributes.placeId,
            type: "building",
          });
        } else if (attributes.placeId || attributes.name) {
          highlightLayerRef.current?.removeAll();

          const geometry = graphic.geometry;
          if (geometry && geometry.type === "polygon") {
            const highlightGraphic = new Graphic({
              geometry: geometry as Polygon,
              symbol: {
                type: "simple-fill",
                color: [26, 115, 232, 0.25],
                outline: {
                  color: [26, 115, 232, 1],
                  width: 2,
                },
              } as any,
            });
            highlightLayerRef.current?.add(highlightGraphic);

            const polygon = geometry as Polygon;
            if (polygon.extent && viewRef.current) {
              viewRef.current.goTo(
                { target: polygon.extent.expand(1.1), tilt: 60 },
                { duration: 1000 }
              );
            }
          } else if (geometry && geometry.type === "point" && viewRef.current) {
            viewRef.current.goTo(
              { target: geometry, zoom: 19, tilt: 65 },
              { duration: 1000 }
            );
          }
          setSelectedItem({
            name: attributes.name,
            description: attributes.description,
            placeName: attributes.placeName,
            image: attributes.image,
            placeId: attributes.placeId,
            address: attributes.address,
            openTime: attributes.openTime,
            closeTime: attributes.closeTime,
            phone: attributes.phone,
            type: "place",
          });
        }
      }
    });

    const handle = reactiveUtils.watch(
      () => [view.center, view.zoom, view.camera],
      () => {
        if (
          !view.center ||
          view.center.latitude == null ||
          view.center.longitude == null
        )
          return;
        const currentZoom = typeof view.zoom === "number" ? view.zoom : 18;
        const currentHeading =
          typeof view.camera?.heading === "number" ? view.camera.heading : 0;
        const currentTilt =
          typeof view.camera?.tilt === "number" ? view.camera.tilt : 65;
        setViewState({
          center: {
            lat: view.center.latitude as number,
            lon: view.center.longitude as number,
          },
          zoom: currentZoom,
          heading: currentHeading,
          tilt: currentTilt,
        });
      }
    );

    return () => {
      handle.remove();
      view.destroy();
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await mapService.getBuildings(
          debouncedCenter.lat,
          debouncedCenter.lon,
          Math.floor(debouncedZoom),
          debouncedHeading,
          debouncedTilt
        );
        setBuildings((prev) => {
          const ids = new Set(prev.map((b) => b.buildingId));
          const news = data.filter((b: any) => !ids.has(b.buildingId));
          return [...prev, ...news];
        });
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, [debouncedCenter, debouncedZoom, debouncedHeading, debouncedTilt]);

  useEffect(() => {
    if (!graphicsLayerRef.current || buildings.length === 0) return;
    const layer = graphicsLayerRef.current;

    buildings.forEach((building) => {
      if (renderedIds.current.has(building.buildingId)) return;

      building.objects3d?.forEach((obj: any) => {
        if (obj.objectType === 1 && obj.bodies) {
          obj.bodies.forEach((body: any) =>
            body.prisms?.forEach((p: any) =>
              addPrismToLayer(p, building, layer)
            )
          );
        }
        if (obj.objectType === 0 && obj.meshes) {
          obj.meshes.forEach((mesh: any) =>
            addMeshToLayer(mesh, building, layer)
          );
        }
      });
      renderedIds.current.add(building.buildingId);
    });
  }, [buildings]);

  useEffect(() => {
    const loadPlaces = async () => {
      if (!placesLayerRef.current) return;
      try {
        const places = await mapService.getAllPlaces();
        const layer = placesLayerRef.current;

        places.forEach((place: any) => {
          if (renderedPlaceIds.current.has(place.placeId)) return;

          let geometry: Polygon | Point | null = null;

          const geomType = place.boundaryGeom?.type?.toLowerCase();
          if (
            geomType === "polygon" &&
            place.boundaryGeom?.coordinates &&
            Array.isArray(place.boundaryGeom.coordinates[0])
          ) {
            geometry = new Polygon({
              rings: place.boundaryGeom.coordinates[0],
              spatialReference: { wkid: 4326 },
            });
          } else {
            return;
          }

          if (!geometry) return;

          const placeGraphic = new Graphic({
            geometry,
            symbol: {
              type: "simple-fill",
              color: [255, 255, 255, 0.01],
              outline: {
                color: [255, 255, 255, 0],
                width: 0,
              },
            } as any,
            attributes: {
              name: place.name,
              placeId: place.placeId,
              description: place.description,
              address: place.address,
              image: place.image,
              openTime: place.openTime,
              closeTime: place.closeTime,
              phone: place.phone,
            },
          });

          layer.add(placeGraphic);
          renderedPlaceIds.current.add(place.placeId);
        });
      } catch (e) {
        console.error(e);
      }
    };

    loadPlaces();
  }, []);

  const handleFindRoute = async (start: any, end: any) => {
    try {
      const cacheKey = `route_${start.placeId}_${end.placeId}`;

      const cachedData = localStorage.getItem(cacheKey);
      let res: any;

      if (cachedData) {
        try {
          res = JSON.parse(cachedData);
        } catch (e) {
          localStorage.removeItem(cacheKey);
        }
      }

      if (!res) {
        res = await mapService.findPath(start.placeId, end.placeId);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(res));
        } catch (e) {
          console.error(e);
        }
      }

      const coords = res?.path?.pathGeometry?.coordinates;

      if (coords && routeLayerRef.current && viewRef.current) {
        routeLayerRef.current.removeAll();
        const polyline = new Polyline({
          paths: coords,
          spatialReference: { wkid: 4326 },
        });

        const outlineGraphic = new Graphic({
          geometry: polyline,
          symbol: {
            type: "simple-line",
            color: [255, 255, 255, 1],
            width: 6,
            join: "round",
            cap: "round",
          } as any,
        });

        const mainGraphic = new Graphic({
          geometry: polyline,
          symbol: {
            type: "simple-line",
            color: [26, 115, 232, 1],
            width: 4,
            join: "round",
            cap: "round",
          } as any,
        });

        routeLayerRef.current.addMany([outlineGraphic, mainGraphic]);
        if (polyline.extent) {
          viewRef.current.goTo(
            { target: polyline.extent.expand(1.4), tilt: 50 },
            { duration: 1000 }
          );
        }
      }
    } catch (error) {
      alert("Không tìm thấy đường đi!");
    }
  };

  const handleClearRoute = () => {
    routeLayerRef.current?.removeAll();
    setIsRoutingMode(false);
    setRoutingStartPlace(null);
  };

  const handleClosePanel = () => {
    setSelectedItem(null);
    highlightLayerRef.current?.removeAll();
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-gray-50">
      <div className="absolute top-4 right-4 z-50 w-[360px] flex flex-col pointer-events-none position-relative">
        <div
          className={`bg-white rounded-lg shadow-md flex items-center p-0.5 h-12 overflow-hidden pointer-events-auto transition-shadow hover:shadow-lg ${
            isRoutingMode ? "hidden" : ""
          }`}
        >
          <div className="flex-1 h-full custom-esri-search-wrapper">
            <div ref={searchWidgetDiv} className="w-full h-full"></div>
          </div>

          <div className="w-px h-6 bg-gray-200 mx-2"></div>

          <button
            onClick={() => setIsRoutingMode(!isRoutingMode)}
            className="bg-transparent border-none cursor-pointer p-2 flex items-center justify-center outline-none hover:bg-gray-50 transition-colors group mr-1"
            title="Chỉ đường"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isRoutingMode
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-transparent text-blue-600 group-hover:bg-blue-50"
              }`}
            >
              <ArrowUpDown size={18} />
            </div>
          </button>
        </div>

        <div className="pointer-events-auto h-full">
          {isRoutingMode && (
            <RoutingPanel
              onFindRoute={handleFindRoute}
              onClose={handleClearRoute}
              startPlace={routingStartPlace}
              endPlace={routingEndPlace}
            />
          )}
        </div>
      </div>

      <div ref={mapDiv} className="w-full h-full outline-none" />

      {selectedItem && (
        <BuildingInfoPanel
          building={selectedItem.type === "building" ? selectedItem : undefined}
          place={selectedItem.type === "place" ? selectedItem : undefined}
          onClose={handleClosePanel}
          onSetAsEnd={(place) => {
            setRoutingEndPlace(place);
            setIsRoutingMode(true);
            handleClosePanel();
          }}
        />
      )}

      <style>{`
        .custom-esri-search-wrapper .esri-search {
            box-shadow: none !important;
            border: none !important;
            outline: none !important;
            width: 100% !important;
        }
        .custom-esri-search-wrapper .esri-search * {
            outline: none !important;
        }
        .custom-esri-search-wrapper .esri-search__container {
            border: none !important;
            outline: none !important;
            background: transparent !important;
        }

        .custom-esri-search-wrapper .esri-search__input {
            border: none !important;

            outline: none !important;
            background: transparent !important;
            height: 44px !important;
            font-family: inherit;
            font-size: 14px;
            color: #333;
        }
        .custom-esri-search-wrapper .esri-search__input:focus {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }
        .custom-esri-search-wrapper .esri-search__submit-button {
            border-left: none !important;
            border: none !important;
            outline: none !important;
            display: none;
        }
        .custom-esri-search-wrapper .esri-widget--button {
            background: transparent !important;
            border: none !important;
            outline: none !important;
        }
        .custom-esri-search-wrapper .esri-menu {
             margin-top: 8px;
             border-radius: 8px;
             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
             border: 1px solid #eee;
             z-index: 100;
        }
      `}</style>
    </div>
  );
}
