// passenger.tsx

import { ReactElement } from "react"
import { Person, RideTimes } from "./person"

export enum Year {
  FRESHMAN = "Freshman",
  SOPHOMORE = "Sophomore",
  JUNIOR = "Junior",
  SENIOR = "Senior",
  OTHER = "Other"
}

export class Passenger extends Person {
  public year: Year
  public backup?: RideTimes[]

  constructor({ name, rides, address, college, year, backup, notes }:
    {
      name: string,
      rides: RideTimes[],
      address: string,
      college: string,
      year: Year,
      backup?: RideTimes[],
      notes?: string}) {
    super(name, rides, address, college, notes)
    this.year = year
    this.backup = backup
  }

  display(show?: PassengerDisplay[]): ReactElement {
    return <PassengerComponent
    name={this.name}
    rides={this.rides}
    address={this.address}
    college={this.college}
    year={this.year}
    backup={this.backup}
    notes={this.notes}
    display={show}
  />
  }
}

export enum PassengerDisplay {
  NAME,
  ADDRESS,
  COLLEGE,
  YEAR,
  NOTES
}

interface PassengerProps {
  name: string,
  rides: RideTimes[],
  address: string,
  college: string,
  year: string,
  backup?: RideTimes[],
  notes?: string
  display?: PassengerDisplay[]
}

export const PassengerComponent = ({name, rides, address, college, year, backup, notes, display}: PassengerProps) => {
  return (
    <div className="p-2 my-1 rounded-md bg-cyan-200 dark:bg-cyan-800">
      {(!display || display.includes(PassengerDisplay.NAME)) &&
        <h3 className="m-1 font-bold text-lg">{name}</h3>
      }
      <ul className="m-1">
        {(!display || display.includes(PassengerDisplay.ADDRESS)) && <li>Addr: {address}</li>}
        {(!display || display.includes(PassengerDisplay.COLLEGE)) && <li>Coll: {college}</li>}
        {(!display || display.includes(PassengerDisplay.YEAR)) && <li>Year: {year}</li>}
        <ul className="flex flex-row flex-wrap">
          {rides.map((item, index) => (
            <li
              className="rounded-md bg-neutral-200 p-1 mr-1 dark:bg-neutral-800"
              key={index}
            >
              {item}
            </li>
          ))}
          {backup && backup.map((item, index) => (
            <li
              className="rounded-md bg-neutral-400 p-1 mr-1 dark:bg-neutral-600"
              key={index}
            >
              {item}
            </li>
          ))}
        </ul>
        {(!display || display.includes(PassengerDisplay.NOTES)) && notes && <ul className="mt-1">
          <li><span className="p-1 rounded-md bg-cyan-400 dark:bg-cyan-600">{notes}</span></li>
        </ul>}
      </ul>
    </div>
  )
}

export enum PassengerSort {
  NAME = "name",
  ADDRESS = "address",
  FIRST = "first",
  SECOND = "second",
  THIRD = "third",
  FRIDAY = "friday"
}

export const sortPassengers = (list: Passenger[], sort: PassengerSort) => {
  switch (sort) {
    case PassengerSort.ADDRESS:
      list.sort((a,b) => a.address.localeCompare(b.address, undefined, {numeric: true}))
      break
    case PassengerSort.FIRST:
      list.sort(
        (a,b) => +(b.rides.includes(RideTimes.FIRST)) * 2 - +(a.rides.includes(RideTimes.FIRST)) * 2 +
        (b.backup ? +(b.backup.includes(RideTimes.FIRST)) : 0) - (a.backup ? +(a.backup.includes(RideTimes.FIRST)) : 0)
      )
      break
    case PassengerSort.SECOND:
      list.sort(
        (a,b) => +(b.rides.includes(RideTimes.SECOND)) * 2 - +(a.rides.includes(RideTimes.SECOND)) * 2 +
        (b.backup ? +(b.backup.includes(RideTimes.SECOND)) : 0) - (a.backup ? +(a.backup.includes(RideTimes.SECOND)) : 0)
      )
      break
    case PassengerSort.THIRD:
      list.sort(
        (a,b) => +(b.rides.includes(RideTimes.THIRD)) * 2 - +(a.rides.includes(RideTimes.THIRD)) * 2 +
        (b.backup ? +(b.backup.includes(RideTimes.THIRD)) : 0) - (a.backup ? +(a.backup.includes(RideTimes.THIRD)) : 0)
      )
      break
    case PassengerSort.FRIDAY:
      list.sort((a,b) => +(b.rides.includes(RideTimes.FRIDAY)) - +(a.rides.includes(RideTimes.FRIDAY)))
      break
    case PassengerSort.NAME:
    default: list.sort((a,b) => a.name.localeCompare(b.name))
  }
}