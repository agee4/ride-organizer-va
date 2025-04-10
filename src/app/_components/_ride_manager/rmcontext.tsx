// rmcontext.tsx

import { ActionDispatch, createContext } from "react";
import { Passenger, PassengerReducerAction } from "@/app/_classes/passenger";
import { Ride, RideReducerAction } from "@/app/_classes/ride";

export const RideManagerContext = createContext<{
  unassignedCollection: Map<string, Passenger>;
  unassignedList: Passenger[];
  rideCollection: Map<string, Ride>;
  unassignedCallback: ActionDispatch<[action: PassengerReducerAction]>;
  rideCallback: ActionDispatch<[action: RideReducerAction]>;
  selectMode: boolean;
} | null>(null);
