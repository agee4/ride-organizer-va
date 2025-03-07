"use client"

import { ChangeEvent, ReactElement, useEffect, useState } from "react"

enum RideTimes {
  FRIDAY = "Friday",
  FIRST = "First",
  SECOND = "Second",
  THIRD = "Third",
}

class Person {
  public name: string
  public rides: RideTimes[]
  public address: string
  public college: string
  public notes?: string

  constructor(name: string, rides: RideTimes[], address: string, college: string, notes?: string) {
    this.name = name
    this.rides = rides
    this.address = address
    this.college = college
    this.notes = notes
  }
}

enum Year {
  FRESHMAN = "Freshman",
  SOPHOMORE = "Sophomore",
  JUNIOR = "Junior",
  SENIOR = "Senior",
  OTHER = "Other"
}

class Passenger extends Person {
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

enum PassengerDisplay {
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

const PassengerComponent = ({name, rides, address, college, year, backup, notes, display}: PassengerProps) => {
  return (
    <div className="p-2 my-1 rounded-md bg-cyan-200 dark:bg-cyan-800">
      <h3 className="m-1 font-bold text-lg">{name}</h3>
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

class Driver extends Person {
  public seats: number

  constructor({ name, rides, address, college, seats, notes }:
    {
      name: string,
      rides: RideTimes[],
      address: string,
      college: string,
      seats: number,
      notes?: string
    }
  ) {
    super(name, rides, address, college, notes)
    this.seats = seats
  }

  display(show?: DriverDisplay[]): ReactElement {
    return <DriverComponent
    name={this.name}
    rides={this.rides}
    address={this.address}
    college={this.college}
    seats={this.seats}
    notes={this.notes}
    display={show}
  />
  }
}

enum DriverDisplay {
  ADDRESS,
  COLLEGE,
  SEATS
}

interface DriverProps {
  name: string,
  rides: RideTimes[],
  address: string,
  college: string,
  seats: number,
  notes?: string,
  display?: DriverDisplay[]
}

const DriverComponent = ({name, rides, address, college, seats, notes, display}: DriverProps) => {
  return (
    <div className="p-2 my-1 rounded-md bg-orange-300 dark:bg-orange-700">
      <h3 className="m-1 font-bold text-lg">{name}</h3>
      <ul className="m-1">
        {(!display || display.includes(DriverDisplay.ADDRESS)) && <li>Addr: {address}</li>}
        {(!display || display.includes(DriverDisplay.COLLEGE)) && <li>Coll: {college}</li>}
        {(!display || display.includes(DriverDisplay.SEATS)) && <li>Seats: {seats}</li>}
        <ul className="flex flex-row flex-wrap">
          {rides.map((item, index) => (
            <li
              className="rounded-md bg-neutral-200 p-1 mr-1 dark:bg-neutral-800"
              key={index}
            >
              {item}
            </li>
          ))}
        </ul>
        {notes && <ul className="mt-1">
          <li><span className="p-1 rounded-md bg-orange-400 :dark:bg-orange-600">{notes}</span></li>
        </ul>}
      </ul>
    </div>
  )
}

class Ride {
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
          <li>Addr: {driver.address}</li>
          <ul className="flex flex-row flex-wrap">
            {driver.rides.map((item, index) => (
              <li
                className="rounded-md bg-neutral-200 p-1 mr-1 dark:bg-neutral-800"
                key={index}
              >
                {item}
              </li>
            ))}
          </ul>
          {driver.notes && <ul className="mt-1">
            <li><span className="p-1 rounded-md bg-orange-500">{driver.notes}</span></li>
          </ul>}
          <ul className="m-1">
            <li className="text-center">Seats Left: {driver.seats-passengers.length}</li>
            {!valid && <li className="text-center">"TOO MANY PASSENGERS!"</li>}
            {passengers.map((item, index) => (
              <li key={index}>
                {item.display([PassengerDisplay.ADDRESS, PassengerDisplay.NOTES])}
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

enum PassengerSort {
  NAME = "name",
  FIRST = "first",
  SECOND = "second",
  THIRD = "third",
  FRIDAY = "friday"
}

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [passengerList, setPassengerList] = useState<Passenger[]>([])
  const [driverList, setDriverList] = useState<Driver[]>([])
  const [rideList, setRideList] = useState<Ride[]>([])
  const [passengerSort, setPassengerSort] = useState<PassengerSort>(PassengerSort.NAME)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0])
    } else {
      setSelectedFile(null)
    }
  }

  useEffect(() => {
    setPassengerList([
      new Passenger({
        name:"Passenger 1",
        rides:[RideTimes.FRIDAY,RideTimes.FIRST],
        address:"292 Tustin Field Dr",
        college:"UCI",
        year:Year.OTHER,
        backup:[RideTimes.SECOND]
      }),
      new Passenger({
        name:"Passenger 2",
        rides:[RideTimes.SECOND],
        address:"53 Dartmouth",
        college:"UCI",
        year:Year.SENIOR,
        backup:[RideTimes.THIRD],
        notes:"test"
      }),
      new Passenger({
        name:"Passenger 3",
        rides:[RideTimes.THIRD],
        address:"287 Berkeley Ave",
        college:"UCI",
        year:Year.JUNIOR,
        notes:"idk"
      }),
      new Passenger({
        name:"Passenger 4",
        rides:[RideTimes.FRIDAY],
        address:"112 Stanford Ct",
        college:"UCI",
        year:Year.SOPHOMORE
      }),
      new Passenger({
        name:"Passenger 5",
        rides:[RideTimes.FRIDAY, RideTimes.SECOND],
        address:"112 Stanford Ct",
        college:"UCI",
        backup:[RideTimes.FIRST, RideTimes.THIRD],
        year:Year.SOPHOMORE
      })
    ])

    setDriverList([
      new Driver({
        name:"Driver 1",
        rides:[RideTimes.FRIDAY,RideTimes.FIRST],
        address:"292 Tustin Field Dr",
        college:"UCI",
        seats:4,
        notes:"note"
      })
    ])
  }, [])
  
  useEffect(() => {
    if (passengerList[0] && driverList[0]) {
      setRideList([
        new Ride({
          driver:driverList[0],
          passengers:[passengerList[0],passengerList[1],passengerList[2],passengerList[3]]
        })
      ])
    }
  }, [passengerList, driverList])

  const sortPassengers = () => {
    switch (passengerSort) {
      case PassengerSort.FIRST:
        passengerList.sort(
          (a,b) => +(b.rides.includes(RideTimes.FIRST)) * 2 - +(a.rides.includes(RideTimes.FIRST)) * 2 +
          (b.backup ? +(b.backup.includes(RideTimes.FIRST)) : 0) - (a.backup ? +(a.backup.includes(RideTimes.FIRST)) : 0)
        )
        break
      case PassengerSort.SECOND:
        passengerList.sort(
          (a,b) => +(b.rides.includes(RideTimes.SECOND)) * 2 - +(a.rides.includes(RideTimes.SECOND)) * 2 +
          (b.backup ? +(b.backup.includes(RideTimes.SECOND)) : 0) - (a.backup ? +(a.backup.includes(RideTimes.SECOND)) : 0)
        )
        break
      case PassengerSort.THIRD:
        passengerList.sort(
          (a,b) => +(b.rides.includes(RideTimes.THIRD)) * 2 - +(a.rides.includes(RideTimes.THIRD)) * 2 +
          (b.backup ? +(b.backup.includes(RideTimes.THIRD)) : 0) - (a.backup ? +(a.backup.includes(RideTimes.THIRD)) : 0)
        )
        break
      case PassengerSort.FRIDAY:
        passengerList.sort((a,b) => +(b.rides.includes(RideTimes.FRIDAY)) - +(a.rides.includes(RideTimes.FRIDAY)))
        break
      case PassengerSort.NAME:
      default: passengerList.sort((a,b) => a.name.localeCompare(b.name))
    }
  }

  const swapPassengerSort = () => {
    switch (passengerSort) {
      case PassengerSort.NAME: setPassengerSort(PassengerSort.FIRST)
      sortPassengers()
      break
      case PassengerSort.FIRST: setPassengerSort(PassengerSort.SECOND)
      sortPassengers()
      break
      case PassengerSort.SECOND: setPassengerSort(PassengerSort.THIRD)
      sortPassengers()
      break
      case PassengerSort.THIRD: setPassengerSort(PassengerSort.FRIDAY)
      sortPassengers()
      break
      case PassengerSort.FRIDAY: setPassengerSort(PassengerSort.NAME)
      sortPassengers()
      break
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1>rides</h1>
        <p>
          Function: Upload a sheet (either file or google sheet integration),
          process sheet into passengers/drivers/rides
        </p>
        <form>
          <label
            className="block text-neutral-500"
            htmlFor="uploadridessheet"
          >
            Choose a sheet to upload
          </label>
          <input
            id="uploadridessheet"
            type="file"
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv,.ods,.gsheet"
          />
        </form>
        <button
          className="rounded-full border px-2 disabled:text-neutral-500"
          disabled={!selectedFile}
          /* onClick={} */
        >
          Upload
        </button>
        <button
          className="rounded-full border px-2 disabled:text-neutral-500"
          onClick={swapPassengerSort}
        >
          Sort Passengers by {passengerSort}
        </button>
        <div className="flex flex-row w-full justify-evenly">
          <ul>
            <h2>Passengers</h2>
            {passengerList.map((item, index) => (
              <li key={index}>{item.display()}</li>
            ))}
          </ul>
          <ul>
            <h2>Driver</h2>
            {driverList.map((item, index) => (
              <li key={index}>{item.display()}</li>
            ))}
          </ul>
          <ul>
            <h2>Ride</h2>
            {rideList.map((item, index) => (
              <li key={index}>{item.display()}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
    
  )
}