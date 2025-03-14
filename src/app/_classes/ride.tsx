// ride.tsx

import { ReactElement } from "react";
import { Driver, DriverDisplay } from "./driver";
import { Passenger, PassengerDisplay } from "./passenger";

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
      this.passengers.set(passenger.name, passenger);
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
        {data.driver.display([DriverDisplay.ADDRESS, DriverDisplay.COLLEGE, DriverDisplay.NOTES])}
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
  NAME = "name",
  ADDRESS = "driver address",
  SEATS = "seats",
  SEATS_LEFT = "seats left",
}

export const sortRides = (list: Ride[], sort?: RideSort) => {
  switch (sort) {
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
    case RideSort.NAME:
    default:
      list.sort((a, b) => a.driver.name.localeCompare(b.driver.name));
  }
};
