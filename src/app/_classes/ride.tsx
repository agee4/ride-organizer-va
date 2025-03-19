// ride.tsx

import { ReactElement } from "react";
import { Driver, DriverDisplay } from "./driver";
import { Passenger, PassengerDisplay } from "./passenger";
import { RideTimes } from "./person";

export class Ride {
  public driver: Driver;
  public passengers: Map<string, Passenger>;
  public valid: boolean;

  constructor({
    driver,
    passengers,
  }: {
    driver: Driver;
    passengers: Map<string, Passenger>;
  }) {
    this.driver = driver;
    this.passengers = passengers;
    this.valid = driver.seats >= passengers.size;
  }

  getDriver(): Driver {
    return this.driver;
  }

  getPassengerList(): Map<string, Passenger> {
    return this.passengers;
  }

  addPassenger(passenger: Passenger): boolean {
    if (this.passengers.size <= this.driver.seats) {
      this.passengers.set(passenger.getEmail(), passenger);
      return true;
    } else {
      return false;
    }
  }

  display(): ReactElement {
    return <RideComponent data={this} />;
  }
}

interface RideProps {
  data: Ride;
}

const RideComponent = ({ data }: RideProps) => {
  const seatsleft = data.driver.seats - data.passengers.size;
  let valid = seatsleft >= 0;
  return (
    <div
      className={
        "p-2 my-1 rounded-md " + (valid ? "bg-neutral-500" : "bg-red-500")
      }
    >
      <h3 className="m-1 font-bold text-lg">{data.driver.name}</h3>
      <ul className="m-1">
        {data.driver.display([
          DriverDisplay.ADDRESS,
          DriverDisplay.COLLEGE,
          DriverDisplay.NOTES,
        ])}
        <ul className="m-1">
          <li className="text-center">Seats Left: {seatsleft}</li>
          {!valid && <li className="text-center">"TOO MANY PASSENGERS!"</li>}
          {Array.from(data.passengers).map(([key, value]) => (
            <li key={key}>
              {value.display([
                PassengerDisplay.NAME,
                PassengerDisplay.ADDRESS,
                PassengerDisplay.COLLEGE,
                PassengerDisplay.NOTES,
              ])}
            </li>
          ))}
          {Array.from({ length: seatsleft }, (_, index) => (
            <li key={index}>
              <div className="p-2 my-1 w-full rounded-md bg-white dark:bg-black"></div>
            </li>
          ))}
        </ul>
      </ul>
    </div>
  );
};

export enum RideSort {
  "" = "",
  FIRST = "first",
  SECOND = "second",
  THIRD = "third",
  FRIDAY = "friday",
  SEATS_LEFT = "seats left",
  NAME = "name",
  ADDRESS = "driver address",
  SEATS = "seats",
}

export const sortRides = (list: Ride[], sort?: RideSort): Ride[] => {
  switch (sort) {
    case RideSort.NAME:
      list.sort((a, b) => a.driver.name.localeCompare(b.driver.name));
      break;
    case RideSort.ADDRESS:
      list.sort((a, b) => a.driver.address.localeCompare(b.driver.address));
      break;
    case RideSort.SEATS:
      list.sort((a, b) => b.driver.seats - a.driver.seats);
      break;
    case RideSort.SEATS_LEFT:
      list.sort(
        (a, b) =>
          b.driver.seats -
          b.passengers.size -
          (a.driver.seats - a.passengers.size)
      );
      break;
    case RideSort.FIRST:
      list.sort(
        (a, b) =>
          +b.driver.rides.includes(RideTimes.FIRST) -
          +a.driver.rides.includes(RideTimes.FIRST)
      );
      break;
    case RideSort.SECOND:
      list.sort(
        (a, b) =>
          +b.driver.rides.includes(RideTimes.SECOND) -
          +a.driver.rides.includes(RideTimes.SECOND)
      );
      break;
    case RideSort.THIRD:
      list.sort(
        (a, b) =>
          +b.driver.rides.includes(RideTimes.THIRD) -
          +a.driver.rides.includes(RideTimes.THIRD)
      );
      break;
    case RideSort.FRIDAY:
      list.sort(
        (a, b) =>
          +b.driver.rides.includes(RideTimes.FRIDAY) -
          +a.driver.rides.includes(RideTimes.FRIDAY)
      );
      break;
    default:
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
      return new Map([...rideCollection.entries()]).set(
        action.ride.driver.getEmail(),
        action.ride
      );
    }
    case "delete": {
      let newCollection = new Map([...rideCollection.entries()]);
      newCollection.delete(action.ride.driver.getEmail());
      return newCollection;
    }
    case "set": {
      return action.rides;
    }
    default:
      throw Error("Unknown action");
  }
};
