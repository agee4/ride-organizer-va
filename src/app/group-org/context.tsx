import { createContext } from "react";
import { Assignable } from "./Assignable";
import { Group } from "./Group";

export const GroupOrganizerContext = createContext<{
  assignableCollection: Map<string, Assignable>;
  unassignedCollection: Map<string, Assignable>;
  groupCollection: Map<string, Group>;
  selectMode: boolean;
} | null>(null);