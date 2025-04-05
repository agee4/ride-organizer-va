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
    <span className={"mr-1 rounded-md p-1 font-bold" + color}>{data}</span>
  );
};

export class Passenger extends Person {
  private year: Year;
  private backup?: RideTimes[];

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

  setYear(updatedYear: Year): Year {
    this.year = updatedYear;
    return this.year;
  }

  getBackup(): RideTimes[] {
    return this.backup || [];
  }

  equals(other: Passenger): boolean {
    if (
      this.getEmail() != other.getEmail() ||
      this.getName() != other.getName() ||
      this.getRides() != other.getRides() ||
      this.getAddress() != other.getAddress() ||
      this.getCollege() != other.getCollege() ||
      this.getYear() != other.getYear() ||
      this.getBackup() != other.getBackup() ||
      this.getPhone() != other.getPhone() ||
      this.getNotes() != other.getNotes()
    )
      return false;
    else return true;
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
    <div className="my-1 max-w-[496px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
      {(!display || display.includes(PassengerDisplay.NAME)) && (
        <h3 className="m-1 text-lg font-bold">{data.getName()}</h3>
      )}
      <ul className="m-1">
        {(!display ||
          display.includes(PassengerDisplay.ADDRESS) ||
          display.includes(PassengerDisplay.COLLEGE)) && (
          <li>
            {(!display || display.includes(PassengerDisplay.COLLEGE)) && (
              <CollegeTag data={data.getCollege()} />
            )}
            {(!display || display.includes(PassengerDisplay.ADDRESS)) && (
              <span>{data.getAddress()}</span>
            )}
          </li>
        )}
        {(!display || display.includes(PassengerDisplay.YEAR)) && (
          <li>
            <YearTag data={data.getYear()} />
          </li>
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
          {data.getBackup() &&
            data.getBackup().map((item, index) => (
              <li
                className="mr-1 rounded-md bg-neutral-400 p-1 dark:bg-neutral-600"
                key={index}
              >
                {item}
              </li>
            ))}
        </ul>
        {(!display || display.includes(PassengerDisplay.NOTES)) &&
          data.getNotes() && (
            <textarea
              className="mt-1 rounded-md bg-cyan-400 p-1 dark:bg-cyan-600"
              defaultValue={data.getNotes()}
            />
          )}
      </ul>
    </div>
  );
};

export interface NewPassengerData {
  email: string;
  name: string;
  address: string;
  college?: College;
  service?: RideTimes;
  friday?: boolean;
  backupfirst?: boolean;
  backupsecond?: boolean;
  backupthird?: boolean;
  year?: Year;
  phone?: string;
  notes?: string;
}

export enum PassengerSort {
  NAME = "name",
  ADDRESS = "address",
  FIRST = "first",
  SECOND = "second",
  THIRD = "third",
  FRIDAY = "friday",
}

export const sortPassengers = (
  list: Passenger[],
  sort: PassengerSort | undefined
): Passenger[] => {
  switch (sort) {
    case PassengerSort.ADDRESS:
      list.sort((a, b) => a.getAddress().localeCompare(b.getAddress()));
      break;
    case PassengerSort.FIRST:
      list.sort(
        (a, b) =>
          +b.getRides().includes(RideTimes.FIRST) * 2 -
          +a.getRides().includes(RideTimes.FIRST) * 2 +
          (b.getBackup() ? +b.getBackup().includes(RideTimes.FIRST) : 0) -
          (a.getBackup() ? +a.getBackup().includes(RideTimes.FIRST) : 0)
      );
      break;
    case PassengerSort.SECOND:
      list.sort(
        (a, b) =>
          +b.getRides().includes(RideTimes.SECOND) * 2 -
          +a.getRides().includes(RideTimes.SECOND) * 2 +
          (b.getBackup() ? +b.getBackup().includes(RideTimes.SECOND) : 0) -
          (a.getBackup() ? +a.getBackup().includes(RideTimes.SECOND) : 0)
      );
      break;
    case PassengerSort.THIRD:
      list.sort(
        (a, b) =>
          +b.getRides().includes(RideTimes.THIRD) * 2 -
          +a.getRides().includes(RideTimes.THIRD) * 2 +
          (b.getBackup() ? +b.getBackup().includes(RideTimes.THIRD) : 0) -
          (a.getBackup() ? +a.getBackup().includes(RideTimes.THIRD) : 0)
      );
      break;
    case PassengerSort.FRIDAY:
      list.sort(
        (a, b) =>
          +b.getRides().includes(RideTimes.FRIDAY) -
          +a.getRides().includes(RideTimes.FRIDAY)
      );
      break;
    case PassengerSort.NAME:
      list.sort((a, b) => a.getName().localeCompare(b.getName()));
      break;
    default:
  }
  return list;
};

export const filterPassengers = (
  list: Passenger[],
  filter: (RideTimes | College | undefined)[] | undefined
): Passenger[] => {
  if (filter) {
    if (filter.length > 0) {
      let newlist = [...list];
      for (const f of filter) {
        if (Object.values(RideTimes).includes(f as RideTimes)) {
          newlist = [...newlist].filter(
            (x) =>
              x.getRides().includes(f as RideTimes) ||
              x.getBackup().includes(f as RideTimes)
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
      const newCollection = new Map([...passengerCollection.entries()]);
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
