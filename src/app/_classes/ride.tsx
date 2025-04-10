// ride.tsx

import { ReactElement, useState } from "react";
import { Driver, DriverDisplay } from "./driver";
import { Passenger, PassengerDisplay } from "./passenger";
import { College, RideTimes } from "./person";

export class Ride {
  private driver: Driver;
  private passengers: Map<string, Passenger>;
  private invalid: string[] = [];

  constructor({
    driver,
    passengers,
  }: {
    driver: Driver;
    passengers: Map<string, Passenger>;
  }) {
    this.driver = driver;
    this.passengers = passengers;
    this.updateValid();
  }

  static from(ride: Ride) {
    return new Ride({
      driver: ride.driver,
      passengers: ride.passengers,
    });
  }

  getCopy(): Ride {
    const driver = this.driver;
    const passengers = this.passengers;
    return new Ride({ driver, passengers });
  }

  getDriver(): Driver {
    return this.driver;
  }

  getPassengers(): Map<string, Passenger> {
    return this.passengers;
  }

  getEmail(): string {
    return this.driver.getEmail();
  }

  addPassenger(passenger: Passenger): boolean {
    this.passengers.set(passenger.getEmail(), passenger);
    return true;
  }

  getInvalid(): string[] {
    return this.invalid;
  }

  getSeatsLeft(): number {
    return this.getDriver().getSeats() - this.getPassengers().size;
  }

  display(): ReactElement {
    return <RideComponent data={this} />;
  }

  validate(passenger: Passenger): boolean {
    if (
      passenger.getCollege() != this.getDriver().getCollege() &&
      passenger.getCollege() != College.OTHER &&
      this.getDriver().getCollege() != College.OTHER
    )
      return false;
    if (
      this.getDriver()
        .getRides()
        .filter(
          (x) =>
            passenger.getRides().includes(x) ||
            passenger.getBackup().includes(x)
        ).length <= 0
    )
      return false;
    return true;
  }

  updateValid(): boolean {
    this.invalid = [];
    if (this.getSeatsLeft() < 0)
      this.invalid.push("TOO MANY PASSENGERS!");
    for (const passenger of this.getPassengers().values()) {
      if (
        passenger.getCollege() != this.getDriver().getCollege() &&
        passenger.getCollege() != College.OTHER &&
        this.getDriver().getCollege() != College.OTHER
      )
        this.invalid.push(passenger.getName() + " ATTENDS A DIFFERENT COLLEGE");
      if (
        this.getDriver()
          .getRides()
          .filter(
            (x) =>
              passenger.getRides().includes(x) ||
              passenger.getBackup().includes(x)
          ).length <= 0
      )
        this.invalid.push(passenger.getName() + " HAS NO RIDE OVERLAP");
    }
    return this.invalid.length == 0;
  }
}

interface RideProps {
  data: Ride;
}

const RideComponent = ({ data }: RideProps) => {
  const [showDriverDetail, setShowDriverDetail] = useState<boolean>(true);
  const toggleDriverDetail = () => {
    setShowDriverDetail(!showDriverDetail);
  };
  const [showPassengers, setShowPassengers] = useState<boolean>(true);
  const togglePassengers = () => {
    setShowPassengers(!showPassengers);
  };

  const valid = data.updateValid();
  return (
    <div className="my-1 rounded-md bg-orange-300 p-2 dark:bg-orange-700">
      <div className="flex flex-row place-content-between">
        <h3 className="m-1 text-lg font-bold">{data.getDriver().getName()}</h3>
        <button className="m-1 text-lg font-bold" onClick={toggleDriverDetail}>
          {showDriverDetail ? <span>&and;</span> : <span>&or;</span>}
        </button>
      </div>
      <ul className="m-1">
        {data
          .getDriver()
          .display([
            DriverDisplay.ADDRESS,
            DriverDisplay.COLLEGE,
            DriverDisplay.NOTES,
          ])}
        <div
          className={"rounded-md " + (!valid ? "bg-red-500" : "bg-neutral-500")}
        >
          <ul className="m-1">
            <li className="text-center">
              <button
                className="rounded-md bg-neutral-300 p-1 dark:bg-neutral-700"
                onClick={togglePassengers}
              >
                Seats Left: {data.getSeatsLeft()}/{data.getDriver().getSeats()}
              </button>
            </li>
            {!valid && (
              <details className="text-center">
                <summary>
                  {data.getInvalid().length} WARNING
                  {data.getInvalid().length != 1 && "S"}!
                </summary>
                <ul className="text-center">
                  {data.getInvalid().map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </details>
            )}
            {showPassengers && (
              <>
                {Array.from(data.getPassengers()).map(([key, value]) => (
                  <li key={key}>
                    {value.display([
                      PassengerDisplay.NAME,
                      PassengerDisplay.ADDRESS,
                      PassengerDisplay.COLLEGE,
                      PassengerDisplay.NOTES,
                    ])}
                  </li>
                ))}
                {Array.from({ length: data.getSeatsLeft() }, (_, index) => (
                  <li key={index}>
                    <div className="my-1 w-full rounded-md bg-white p-2 dark:bg-black"></div>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      </ul>
    </div>
  );
};

export enum RideSort {
  NAME = "name",
  ADDRESS = "address",
  SEATS = "seats",
  FIRST = "first",
  SECOND = "second",
  THIRD = "third",
  FRIDAY = "friday",
}

export const sortRides = (
  list: Ride[],
  sort?: RideSort | undefined
): Ride[] => {
  switch (sort) {
    case RideSort.NAME:
      list.sort((a, b) =>
        a.getDriver().getName().localeCompare(b.getDriver().getName())
      );
      break;
    case RideSort.ADDRESS:
      list.sort((a, b) =>
        a.getDriver().getAddress().localeCompare(b.getDriver().getAddress())
      );
      break;
    case RideSort.SEATS:
      list.sort(
        (a, b) =>
          b.getSeatsLeft() -
          a.getSeatsLeft()
      );
      break;
    case RideSort.FIRST:
      list.sort(
        (a, b) =>
          +b.getDriver().getRides().includes(RideTimes.FIRST) -
          +a.getDriver().getRides().includes(RideTimes.FIRST)
      );
      break;
    case RideSort.SECOND:
      list.sort(
        (a, b) =>
          +b.getDriver().getRides().includes(RideTimes.SECOND) -
          +a.getDriver().getRides().includes(RideTimes.SECOND)
      );
      break;
    case RideSort.THIRD:
      list.sort(
        (a, b) =>
          +b.getDriver().getRides().includes(RideTimes.THIRD) -
          +a.getDriver().getRides().includes(RideTimes.THIRD)
      );
      break;
    case RideSort.FRIDAY:
      list.sort(
        (a, b) =>
          +b.getDriver().getRides().includes(RideTimes.FRIDAY) -
          +a.getDriver().getRides().includes(RideTimes.FRIDAY)
      );
      break;
    default:
  }
  return list;
};

export const filterRides = (
  list: Ride[],
  filter: (RideTimes | College | undefined)[] | undefined
): Ride[] => {
  if (filter) {
    if (filter.length > 0) {
      let newlist = [...list];
      for (const f of filter) {
        if (Object.values(RideTimes).includes(f as RideTimes)) {
          newlist = [...newlist].filter((x) =>
            x
              .getDriver()
              .getRides()
              .includes(f as RideTimes)
          );
        } else if (Object.values(College).includes(f as College)) {
          newlist = [...newlist].filter(
            (x) => x.getDriver().getCollege() === f
          );
        }
      }
      return newlist;
    }
  }
  return list;
};

export type RideReducerAction =
  | { type: "create"; ride: Ride }
  | { type: "delete"; ride: Ride }
  | { type: "set"; rides: Map<string, Ride> };

export const rideReducer = (
  rideCollection: Map<string, Ride>,
  action: RideReducerAction
) => {
  switch (action.type) {
    case "create": {
      return new Map([
        ...rideCollection.entries(),
        [action.ride.getDriver().getEmail(), action.ride],
      ]);
    }
    case "delete": {
      const newCollection = new Map([...rideCollection.entries()]);
      newCollection.delete(action.ride.getDriver().getEmail());
      return newCollection;
    }
    case "set": {
      return action.rides;
    }
    default:
      throw Error("Unknown action");
  }
};
