// driver.tsx

import { ReactElement } from "react";
import { College, CollegeTag, Person, RideTimes } from "./person";

export class Driver extends Person {
  private seats: number;

  constructor({
    email,
    name,
    rides,
    address,
    college,
    seats,
    phone,
    notes,
  }: {
    email: string;
    name: string;
    rides: RideTimes[];
    address: string;
    college: College;
    seats: number;
    phone?: string;
    notes?: string;
  }) {
    super(email, name, rides, address, college, phone, notes);
    this.seats = seats;
  }

  getSeats(): number {
    return this.seats;
  }

  setSeats(updatedseats: number): number {
    this.seats = updatedseats;
    return this.seats;
  }

  equals(other: Driver): boolean {
    if (
      this.getEmail() != other.getEmail() ||
      this.getName() != other.getName() ||
      this.getRides() != other.getRides() ||
      this.getAddress() != other.getAddress() ||
      this.getCollege() != other.getCollege() ||
      this.getSeats() != other.getSeats() ||
      this.getPhone() != other.getPhone() ||
      this.getNotes() != other.getNotes()
    )
      return false;
    else return true;
  }

  display(show?: DriverDisplay[]): ReactElement {
    return <DriverComponent data={this} display={show} />;
  }
}

export enum DriverDisplay {
  NAME,
  ADDRESS,
  COLLEGE,
  SEATS,
  NOTES,
}

interface DriverProps {
  data: Driver;
  display?: DriverDisplay[];
}

const DriverComponent = ({ data, display }: DriverProps) => {
  return (
    <div className="my-1 max-w-[496px] rounded-md bg-orange-300 p-2 dark:bg-orange-700">
      {(!display || display.includes(DriverDisplay.NAME)) && (
        <h3 className="m-1 text-lg font-bold">{data.getName()}</h3>
      )}
      <ul className="m-1">
        {(!display ||
          display.includes(DriverDisplay.ADDRESS) ||
          display.includes(DriverDisplay.COLLEGE)) && (
          <li>
            {(!display || display.includes(DriverDisplay.COLLEGE)) && (
              <CollegeTag data={data.getCollege()} />
            )}
            {(!display || display.includes(DriverDisplay.ADDRESS)) && (
              <span>{data.getAddress()}</span>
            )}
          </li>
        )}
        {(!display || display.includes(DriverDisplay.SEATS)) && (
          <li>Seats: {data.getSeats()}</li>
        )}
        <ul className="flex flex-row flex-wrap">
          {data.getRides().map((item, index) => (
            <li
              className="mr-1 rounded-md bg-neutral-200 p-1 dark:bg-neutral-800"
              key={index}
            >
              {item}
            </li>
          ))}
        </ul>
        {(!display || display.includes(DriverDisplay.NOTES)) &&
          data.getNotes() && (
            <ul className="mt-1">
              <li>
                <textarea
                  className="rounded-md bg-orange-400 p-1 dark:bg-orange-600"
                  defaultValue={data.getNotes()}
                />
              </li>
            </ul>
          )}
      </ul>
    </div>
  );
};

export interface NewDriverData {
  email: string;
  name: string;
  address: string;
  college?: College;
  seats: number;
  service?: RideTimes;
  friday?: boolean;
  phone?: string;
  notes?: string;
}

export enum DriverSort {
  NAME = "name",
  ADDRESS = "address",
  FIRST = "first",
  SECOND = "second",
  THIRD = "third",
  FRIDAY = "friday",
}

export const sortDrivers = (list: Driver[], sort?: DriverSort): Driver[] => {
  switch (sort) {
    case DriverSort.ADDRESS:
      list.sort((a, b) => a.getAddress().localeCompare(b.getAddress()));
      break;
    case DriverSort.FIRST:
      list.sort(
        (a, b) =>
          +b.getRides().includes(RideTimes.FIRST) -
          +a.getRides().includes(RideTimes.FIRST)
      );
      break;
    case DriverSort.SECOND:
      list.sort(
        (a, b) =>
          +b.getRides().includes(RideTimes.SECOND) -
          +a.getRides().includes(RideTimes.SECOND)
      );
      break;
    case DriverSort.THIRD:
      list.sort(
        (a, b) =>
          +b.getRides().includes(RideTimes.THIRD) -
          +a.getRides().includes(RideTimes.THIRD)
      );
      break;
    case DriverSort.FRIDAY:
      list.sort(
        (a, b) =>
          +b.getRides().includes(RideTimes.FRIDAY) -
          +a.getRides().includes(RideTimes.FRIDAY)
      );
      break;
    case DriverSort.NAME:
      list.sort((a, b) => a.getName().localeCompare(b.getName()));
      break;
    default:
  }
  return list;
};

export const filterDrivers = (
  list: Driver[],
  filter: (RideTimes | College | undefined)[] | undefined
): Driver[] => {
  if (filter) {
    if (filter.length > 0) {
      let newlist = [...list];
      for (const f of filter) {
        if (Object.values(RideTimes).includes(f as RideTimes)) {
          newlist = [...newlist].filter((x) =>
            x.getRides().includes(f as RideTimes)
          );
        } else if (Object.values(College).includes(f as College)) {
          newlist = [...newlist].filter((x) => x.getCollege() === f);
        }
      }
      return newlist;
    }
  }
  return list;
};

export type DriverReducerAction =
  | { type: "create"; driver: Driver }
  | { type: "delete"; driver: Driver }
  | { type: "set"; drivers: Map<string, Driver> };

export const driverReducer = (
  driverCollection: Map<string, Driver>,
  action: DriverReducerAction
) => {
  switch (action.type) {
    case "create": {
      return new Map([...driverCollection.entries()]).set(
        action.driver.getEmail(),
        action.driver
      );
    }
    case "delete": {
      const newCollection = new Map([...driverCollection.entries()]);
      newCollection.delete(action.driver.getEmail());
      return newCollection;
    }
    case "set": {
      return action.drivers;
    }
    default:
      throw Error("Unknown action");
  }
};
