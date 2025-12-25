import Issues from "../../pages/Main/Issues/Issues";
import IssueDetails from "../../pages/Main/Issues/IssueDetails";

const IssuesRouters = [
  {
    path: "issues",
    children: [
      { path: "", element: <Issues /> },          
      { path: ":incidentId", element: <IssueDetails /> }, 
    ],
  },
];

export default IssuesRouters;