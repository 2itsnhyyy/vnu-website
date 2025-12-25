import Places from "../../pages/Places";
import AddPlace from "../../pages/Places/addPlace/index";
import EditPlace from "../../pages/Places/editPlace/index";
// import ViewPlace from "../../pages/Places/viewPlace/index";


const PlacesRouters = [
  {
    path: "places",
    element: <Places />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
  {
    path: "places/add",
    element: <AddPlace />,
  },
  {
    path: "places/edit/:placeId",
    element: <EditPlace />,
  },
  // {
  //   path: "places/:id",
  //   element: <ViewPlace />,
  // },
];

export default PlacesRouters;
