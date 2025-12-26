import api from "./api";
import type {
  DashboardNewItemsResponse,
  DashboardOverviewResponse,
  Period
} from "../types/dashboard";

export const dashboardService = {

  getOverView(): Promise<DashboardOverviewResponse> {
    return api.get("/dashboard/overview").then((res) => res.data);
  },

  getNewItems(period: Period): Promise<DashboardNewItemsResponse> {
    return api.get("/dashboard/new-items", {params: period}).then((res) => res.data);
  },
};