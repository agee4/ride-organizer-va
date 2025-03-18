// person.tsx

export enum RideTimes {
  FRIDAY = "Friday",
  FIRST = "First",
  SECOND = "Second",
  THIRD = "Third",
}

export enum College {
  UCI = "UCI",
  CSULB = "CSULB",
  BIOLA = "Biola",
  CHAPMAN = "Chapman",
  OTHER = "Other",
}

export class Person {
  public name: string;
  public rides: RideTimes[];
  public address: string;
  public college: string;
  public notes?: string;

  constructor(
    name: string,
    rides: RideTimes[],
    address: string,
    college: string,
    notes?: string
  ) {
    this.name = name;
    this.rides = rides;
    this.address = address;
    this.college = college;
    this.notes = notes;
  }

  getName(): string {
    return this.name;
  }

  getAddress(): string {
    return this.address;
  }

  getCollege(): string {
    return this.college;
  }

  getNotes(): string {
    return this.notes ? this.notes : "";
  }
}

export const CollegeTag = ({ data }: { data: College }) => {
  let color;
  switch (data) {
    case College.UCI:
      color = " text-amber-300 bg-blue-700";
      break;
    case College.CSULB:
      color = " text-black bg-amber-500";
      break;
    case College.BIOLA:
      color = " text-black bg-red-500";
      break;
    case College.CHAPMAN:
      color = " text-red-500 bg-black";
      break;
    default:
      color = "bg-neutral-200 dark:bg-neutral-800";
  }

  return (
    <span className={"rounded-md p-1 mr-1 font-bold" + color}>{data}</span>
  );
};

/* export type ListReducerAction<T> =
  | { type: "create"; item: T }
  | { type: "delete"; item: T }
  | { type: "set"; list: T[] };

export const listReducer = (
  list: [],
  action: { type: "create"; item: Person }
  | { type: "delete"; item: Person }
  | { type: "set"; list: Person[] }
) => {
  switch (action.type) {
    case "create": {
      return [...list, action.item];
    }
    case "delete": {
      return [...list].filter((x) => x !== action.item);
    }
    case "set": {
      return action.list;
    }
    default:
      throw Error("Unknown action");
  }
}; */