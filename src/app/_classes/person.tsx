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
  private email: string;
  private phone?: string;
  public name: string;
  public rides: RideTimes[];
  public address: string;
  public college: College;
  public notes?: string;

  constructor(
    email: string,
    name: string,
    rides: RideTimes[],
    address: string,
    college: College,
    phone?: string,
    notes?: string
  ) {
    this.email = email;
    this.phone = phone;
    this.name = name;
    this.rides = rides;
    this.address = address;
    this.college = college;
    this.notes = notes;
  }

  getEmail(): string {
    return this.email;
  }

  getPhone(): string | undefined {
    return this.phone;
  }

  getName(): string {
    return this.name;
  }

  setName(updatedname: string): string {
    this.name = updatedname;
    return this.name;
  }

  getAddress(): string {
    return this.address;
  }

  setAddress(updatedaddress: string): string {
    this.address = updatedaddress;
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
      color = " bg-neutral-200 dark:bg-neutral-800";
  }

  return (
    <span className={"mr-1 rounded-md p-1 font-bold" + color}>{data}</span>
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
