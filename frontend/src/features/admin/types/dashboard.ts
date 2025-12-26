export interface DashboardOverviewData {
  totalBuildings: number;
  totalPlaces: number;
  totalUsers: number;
}

export interface DashboardOverviewResponse {
  message: string;
  data: DashboardOverviewData;
}

export interface Period {
    startDate: string;
    endDate: string;
}

export interface DashboardNewItemsData {
  period: Period;
  newNews: number;
  newPosts: number;
  newIncidents: number;
}

export interface DashboardNewItemsResponse {
  message: string;
  data: DashboardNewItemsData;
}
