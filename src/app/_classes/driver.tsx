// driver.tsx

import { ReactElement } from "react";
import { Person, RideTimes } from "./person";

export class Driver extends Person {
  public seats: number;

  constructor({
    name,
    rides,
    address,
    college,
    seats,
    notes,
  }: {
    name: string;
    rides: RideTimes[];
    address: string;
    college: string;
    seats: number;
    notes?: string;
  }) {
    super(name, rides, address, college, notes);
    this.seats = seats;
  }

  getSeats(): number {
    return this.seats;
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
    <div className="p-2 my-1 rounded-md bg-orange-300 dark:bg-orange-700 max-w-[248px]">
      {(!display || display.includes(DriverDisplay.NAME)) && (
        <h3 className="m-1 font-bold text-lg">{data.name}</h3>
      )}
      <ul className="m-1">
        {(!display || display.includes(DriverDisplay.ADDRESS)) && (
          <li>Addr: {data.address}</li>
        )}
        {(!display || display.includes(DriverDisplay.COLLEGE)) && (
          <li>Coll: {data.college}</li>
        )}
        {(!display || display.includes(DriverDisplay.SEATS)) && (
          <li>Seats: {data.seats}</li>
        )}
        <ul className="flex flex-row flex-wrap">
          {data.rides.map((item, index) => (
            <li
              className="rounded-md bg-neutral-200 p-1 mr-1 dark:bg-neutral-800"
              key={index}
            >
              {item}
            </li>
          ))}
        </ul>
        {(!display || display.includes(DriverDisplay.NOTES)) && data.notes && (
          <ul className="mt-1">
            <li>
              <span className="p-1 rounded-md bg-orange-400 :dark:bg-orange-600">
                {data.notes}
              </span>
            </li>
          </ul>
        )}
      </ul>
    </div>
  );
};

export enum DriverSort {
  NAME = "name",
  ADDRESS = "address",
  FIRST = "first",
  SECOND = "second",
  THIRD = "third",
  FRIDAY = "friday",
}

export const sortDrivers = (list: Driver[], sort?: DriverSort) => {
  switch (sort) {
    case DriverSort.ADDRESS:
      list.sort((a, b) => a.address.localeCompare(b.address));
      break;
    case DriverSort.FIRST:
      list.sort(
        (a, b) =>
          +b.rides.includes(RideTimes.FIRST) -
          +a.rides.includes(RideTimes.FIRST)
      );
      break;
    case DriverSort.SECOND:
      list.sort(
        (a, b) =>
          +b.rides.includes(RideTimes.SECOND) -
          +a.rides.includes(RideTimes.SECOND)
      );
      break;
    case DriverSort.THIRD:
      list.sort(
        (a, b) =>
          +b.rides.includes(RideTimes.THIRD) -
          +a.rides.includes(RideTimes.THIRD)
      );
      break;
    case DriverSort.FRIDAY:
      list.sort(
        (a, b) =>
          +b.rides.includes(RideTimes.FRIDAY) -
          +a.rides.includes(RideTimes.FRIDAY)
      );
      break;
    case DriverSort.NAME:
    default:
      list.sort((a, b) => a.name.localeCompare(b.name));
  }
};
