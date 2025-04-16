// person.tsx
// Contains the basic Person class extended by Passenger and Driver, along with other basic enums used by derived classes/objects

/**Enum for standardized ride times:
 * "Friday" Bible Study at 7pm,
 * "First" Service on Sunday at 8am,
 * "Second" Service on Sunday at 9:30am,
 * "Third" Service on Sunday at 11am */
export enum RideTimes {
  FRIDAY = "Friday",
  FIRST = "First",
  SECOND = "Second",
  THIRD = "Third",
}

/**Enum for main colleges */
export enum College {
  UCI = "UCI",
  CSULB = "CSULB",
  BIOLA = "Biola",
  CHAPMAN = "Chapman",
  OTHER = "Other",
}

/**pseudo-interface class Person, extended by Passenger & Driver
 * Has universal attributes such as email (ID), name, etc.
 */
export class Person {
  private email: string;
  private phone?: string;
  private name: string;
  private rides: RideTimes[];
  private address: string;
  private college: College;
  private notes?: string;

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

  getRides(): RideTimes[] {
    return this.rides;
  }

  getAddress(): string {
    return this.address;
  }

  setAddress(updatedaddress: string): string {
    this.address = updatedaddress;
    return this.address;
  }

  getCollege(): College {
    return this.college;
  }

  setCollege(updatedcollege: string): string {
    this.college = updatedcollege as College;
    return this.college;
  }

  getNotes(): string {
    return this.notes ? this.notes : "";
  }
}

/**JSX component for stylistically displaying College
 * Used in People/Ride display components */
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

/**ListReducerAction with generic type parameter */
export type ListReducerAction<T> =
  | { type: "create"; item: T }
  | { type: "delete"; item: T }
  | { type: "set"; list: T[] };

/**Factory function that returns a valid listReducer for lists of type T*/
export function listReducer<T>() {
  return (itemList: [], action: ListReducerAction<T>) => {
    switch (action.type) {
      case "create": {
        return [...itemList, action.item];
      }
      case "delete": {
        return [...itemList].filter((x) => x !== action.item);
      }
      case "set": {
        return action.list;
      }
      default:
        throw Error("Unknown action");
    }
  };
}

/**MapReducerAction with generic type parameters */
export type MapReducerAction<k, V> =
  | { type: "create"; key: k; value: V }
  | { type: "delete"; key: k }
  | { type: "replace"; map: Map<k, V> };

/**Factory function that returns a valid mapReducer for maps of key type k and value type V*/
export function mapReducer<k, V>() {
  return (itemMap: Map<k, V>, action: MapReducerAction<k, V>) => {
    switch (action.type) {
      case "create": {
        return new Map([...itemMap.entries()]).set(action.key, action.value);
      }
      case "delete": {
        const newCollection = new Map([...itemMap.entries()]);
        newCollection.delete(action.key);
        return newCollection;
      }
      case "replace": {
        return action.map;
      }
      default:
        throw Error("Unknown action");
    }
  };
}
