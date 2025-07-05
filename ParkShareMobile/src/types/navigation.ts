export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  SpotDetail: { spotId: string };
  Booking: { spotId: string };
  Bookings: undefined;
  Map: undefined;
  Search: undefined;
  AddSpot: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Map: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
}; 