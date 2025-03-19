// passenger.tsx

import { ReactElement } from "react";
import { College, CollegeTag, Person, RideTimes } from "./person";

export enum Year {
  FRESHMAN = "Freshman",
  SOPHOMORE = "Sophomore",
  JUNIOR = "Junior",
  SENIOR = "Senior",
  OTHER = "Other",
}

export const YearTag = ({ data }: { data: Year }) => {
  let color;
  switch (data) {
    case Year.FRESHMAN:
      color = " text-blue-700 bg-yellow-300";
      break;
    case Year.SOPHOMORE:
      color = " text-green-800 bg-red-500";
      break;
    case Year.JUNIOR:
      color = " text-red-800 bg-green-500";
      break;
    case Year.SENIOR:
      color = " text-yellow-300 bg-blue-700";
      break;
    default:
      color = " bg-neutral-200 dark:bg-neutral-800";
  }

  return (
    <span className={"rounded-md p-1 mr-1 font-bold" + color}>{data}</span>
  );
};

export class Passenger extends Person {
  public year: Year;
  public backup?: RideTimes[];

  constructor({
    email,
    name,
    rides,
    address,
    college,
    year,
    backup,
    phone,
    notes,
  }: {
    email: string;
    name: string;
    rides: RideTimes[];
    address: string;
    college: College;
    year: Year;
    backup?: RideTimes[];
    phone?: string;
    notes?: string;
  }) {
    super(email, name, rides, address, college, phone, notes);
    this.year = year;
    this.backup = backup;
  }

  getYear(): Year {
    return this.year;
  }

  display(show?: PassengerDisplay[]): ReactElement {
    return <PassengerComponent data={this} display={show} />;
  }
}

export enum PassengerDisplay {
  NAME,
  ADDRESS,
  COLLEGE,
  YEAR,
  NOTES,
}

interface PassengerProps {
  data: Passenger;
  display?: PassengerDisplay[];
}

export const PassengerComponent = ({ data, display }: PassengerProps) => {
  return (
    <div className="p-2 my-1 rounded-md bg-cyan-200 dark:bg-cyan-800 max-w-[248px]">
      {(!display || display.includes(PassengerDisplay.NAME)) && (
        <h3 className="m-1 font-bold text-lg">{data.name}</h3>
      )}
      <ul className="m-1">
        {(!display ||
          display.includes(PassengerDisplay.ADDRESS) ||
          display.includes(PassengerDisplay.COLLEGE)) && (
          <li>
            {(!display || display.includes(PassengerDisplay.COLLEGE)) && (
              <CollegeTag data={data.college as College} />
            )}
            {(!display || display.includes(PassengerDisplay.ADDRESS)) && (
              <span>{data.address}</span>
            )}
          </li>
        )}
        {(!display || display.includes(PassengerDisplay.YEAR)) && (
          <li>
            <YearTag data={data.year} />
          </li>
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
          {data.backup &&
            data.backup.map((item, index) => (
              <li
                className="rounded-md bg-neutral-400 p-1 mr-1 dark:bg-neutral-600"
                key={index}
              >
                {item}
              </li>
            ))}
        </ul>
        {(!display || display.includes(PassengerDisplay.NOTES)) &&
          data.notes && (
            <ul className="mt-1">
              <li>
                <span className="p-1 rounded-md bg-cyan-400 dark:bg-cyan-600">
                  {data.notes}
                </span>
              </li>
            </ul>
          )}
      </ul>
    </div>
  );
};

export enum PassengerSort {
  "" = "",
  FIRST = "first",
  SECOND = "second",
  THIRD = "third",
  FRIDAY = "friday",
  NAME = "name",
  ADDRESS = "address",
}

export const sortPassengers = (
  list: Passenger[],
  sort: PassengerSort
): Passenger[] => {
  switch (sort) {
    case PassengerSort.ADDRESS:
      list.sort((a, b) => a.address.localeCompare(b.address));
      break;
    case PassengerSort.FIRST:
      list.sort(
        (a, b) =>
          +b.rides.includes(RideTimes.FIRST) * 2 -
          +a.rides.includes(RideTimes.FIRST) * 2 +
          (b.backup ? +b.backup.includes(RideTimes.FIRST) : 0) -
          (a.backup ? +a.backup.includes(RideTimes.FIRST) : 0)
      );
      break;
    case PassengerSort.SECOND:
      list.sort(
        (a, b) =>
          +b.rides.includes(RideTimes.SECOND) * 2 -
          +a.rides.includes(RideTimes.SECOND) * 2 +
          (b.backup ? +b.backup.includes(RideTimes.SECOND) : 0) -
          (a.backup ? +a.backup.includes(RideTimes.SECOND) : 0)
      );
      break;
    case PassengerSort.THIRD:
      list.sort(
        (a, b) =>
          +b.rides.includes(RideTimes.THIRD) * 2 -
          +a.rides.includes(RideTimes.THIRD) * 2 +
          (b.backup ? +b.backup.includes(RideTimes.THIRD) : 0) -
          (a.backup ? +a.backup.includes(RideTimes.THIRD) : 0)
      );
      break;
    case PassengerSort.FRIDAY:
      list.sort(
        (a, b) =>
          +b.rides.includes(RideTimes.FRIDAY) -
          +a.rides.includes(RideTimes.FRIDAY)
      );
      break;
    case PassengerSort.NAME:
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
  }
  return list;
};

export type PassengerReducerAction =
  | { type: "create"; passenger: Passenger }
  | { type: "delete"; passenger: Passenger }
  | { type: "set"; passengers: Map<string, Passenger> };

export const passengerReducer = (
  passengerCollection: Map<string, Passenger>,
  action: PassengerReducerAction
) => {
  switch (action.type) {
    case "create": {
      return new Map([...passengerCollection.entries()]).set(
        action.passenger.getEmail(),
        action.passenger
      );
    }
    case "delete": {
      let newCollection = new Map([...passengerCollection.entries()]);
      newCollection.delete(action.passenger.getEmail());
      return newCollection;
    }
    case "set": {
      return action.passengers;
    }
    default:
      throw Error("Unknown action");
  }
};
