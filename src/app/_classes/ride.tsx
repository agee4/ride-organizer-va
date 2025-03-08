// ride.tsx

import { ReactElement } from "react"
import { Driver, DriverDisplay } from "./driver"
import { Passenger, PassengerDisplay } from "./passenger"

export class Ride {
  public driver: Driver
  public passengers: Passenger[]
  public valid: boolean

  constructor({driver, passengers = []}:
    {
      driver: Driver,
      passengers: Passenger[]
    }
  ) {
    this.driver = driver
    this.passengers = passengers
    this.valid = driver.seats >= passengers.length
  }

  getDriver(): Driver {
    return this.driver
  }

  getPassengerList(): Passenger[] {
    return (this.passengers || [])
  }

  addPassenger(passenger: Passenger): boolean {
    if (this.passengers.length <= this.driver.seats) {
      this.passengers.push(passenger)
      return true
    } else {
      return false
    }
  }

  display(): ReactElement {
    return <RideComponent driver={this.driver} passengers={this.passengers} />
  }
}

interface RideProps {
  driver: Driver,
  passengers: Passenger[]
}

const RideComponent = ({driver, passengers}: RideProps) => {
  let valid = driver.seats >= passengers.length
  return (
    <div className={"p-2 my-1 rounded-md " + ((valid) ? "bg-neutral-500" : "bg-red-500")}>
      <h3 className="m-1 font-bold text-lg">{driver.name}</h3>
      <ul className="m-1">
        {driver.display([DriverDisplay.ADDRESS, DriverDisplay.NOTES])}
        <ul className="m-1">
          <li className="text-center">Seats Left: {driver.seats-passengers.length}</li>
          {!valid && <li className="text-center">"TOO MANY PASSENGERS!"</li>}
          {passengers.map((item, index) => (
            <li key={index}>
              {item.display([PassengerDisplay.NAME, PassengerDisplay.ADDRESS, PassengerDisplay.NOTES])}
            </li>
          ))}
          {Array.from({length : (driver.seats-passengers.length)}, (_, index) => (
            <li key={index}>
              <div className="p-2 my-1 rounded-md bg-black dark:bg-white">
              </div>
            </li>
          ))}
        </ul>
      </ul>
  </div>
  )
}

export enum RideSort {
  NAME = "name",
  ADDRESS = "address",
  SEATS = "seats",
  SEATS_LEFT = "seats left"
}

export const sortRides = (list: Ride[], sort?: RideSort) => {
  switch (sort) {
    case RideSort.ADDRESS:
      list.sort((a,b) => a.driver.address.localeCompare(b.driver.address, undefined, {numeric: true}))
      break
    case RideSort.SEATS:
      list.sort((a,b) => b.driver.seats - a.driver.seats)
      break
    case RideSort.SEATS_LEFT:
      list.sort((a,b) => (b.driver.seats - b.passengers.length) - (a.driver.seats - a.passengers.length))
      break
    case RideSort.NAME:
    default: list.sort((a,b) => a.driver.name.localeCompare(b.driver.name))
  }
}