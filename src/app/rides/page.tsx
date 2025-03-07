"use client"

import { ChangeEvent, FC, ReactElement, useState } from "react"

enum RideTimes {
  FRIDAY = "Friday",
  FIRST = "First",
  SECOND = "Second",
  THIRD = "Third",
}

enum Year {
  FRESHMAN = "Freshman",
  SOPHOMORE = "Sophomore",
  JUNIOR = "Junior",
  SENIOR = "Senior",
  OTHER = "Other"
}

class Person {
  public name: string
  public rides: Array<RideTimes>
  public address: string
  public college: string
  public notes?: string

  constructor(name: string, rides: Array<RideTimes>, address: string, college: string, notes?: string) {
    this.name = name
    this.rides = rides
    this.address = address
    this.college = college
    this.notes = notes
  }
}

class Passenger extends Person {
  public year: Year
  public backup?: Array<RideTimes>

  constructor(
    { name, rides, address, college, year, backup, notes }:
    {
      name: string,
      rides: Array<RideTimes>,
      address: string,
      college: string,
      year: Year,
      backup?: Array<RideTimes>,
      notes?: string}) {
    super(name, rides, address, college, notes)
    this.year = year
    this.backup = backup
  }

  display(): ReactElement {
    return <PassengerComponent
    name={this.name}
    rides={this.rides}
    address={this.address}
    college={this.college}
    year={this.year}
    backup={this.backup}
    notes={this.notes}
  />
  }
}

interface PassengerProps {
  name: string,
  rides: Array<RideTimes>,
  address: string,
  college: string,
  year: string,
  backup?: Array<RideTimes>,
  notes?: string
}

const PassengerComponent = ({name, rides, address, college, year, backup, notes}: PassengerProps) => {
  return (
    <div className="p-2 my-1 rounded-md bg-cyan-200 dark:bg-cyan-800">
      <h3 className="m-1 font-bold text-lg">{name}</h3>
      <ul className="m-1">
        <li>Addr: {address}</li>
        <li>Coll: {college}</li>
        <li>Year: {year}</li>
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
        {notes && <li>Notes:<br />{notes}</li>}
      </ul>
    </div>
  )
}

class Driver extends Person {
  public seats: number
  public backup?: Array<RideTimes>

  constructor(
    { name, rides, address, college, seats, notes }:
    {
      name: string,
      rides: Array<RideTimes>,
      address: string,
      college: string,
      seats: number,
      notes?: string
    }
  ) {
    super(name, rides, address, college, notes)
    this.seats = seats
  }

  display(): ReactElement {
    return <DriverComponent
    name={this.name}
    rides={this.rides}
    address={this.address}
    college={this.college}
    seats={this.seats}
    notes={this.notes}
  />
  }
}

interface DriverProps {
  name: string,
  rides: Array<RideTimes>,
  address: string,
  college: string,
  seats: number,
  notes?: string
}

const DriverComponent = ({name, rides, address, college, seats, notes}: DriverProps) => {
  return (
    <div className="p-2 my-1 rounded-md bg-orange-300 dark:bg-orange-700">
      <h3 className="m-1 font-bold text-lg">{name}</h3>
      <ul className="m-1">
        <li>Addr: {address}</li>
        <li>Coll: {college}</li>
        <li>Seats: {seats}</li>
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
        {notes && <li>Notes:<br />{notes}</li>}
      </ul>
    </div>
  )
}

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0])
    } else {
      setSelectedFile(null)
    }
  }

  let PassengerList: Passenger[] = [
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
    })
  ]

  let DriverList: Driver[] = [
    new Driver({
      name:"Driver 1",
      rides:[RideTimes.FRIDAY,RideTimes.FIRST],
      address:"292 Tustin Field Dr",
      college:"UCI",
      seats:4,
      notes:"note"
    })
  ]

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
        <div className="flex flex-row w-full justify-evenly">
          <ul>
            <h2>Passengers</h2>
            {PassengerList.map((item, index) => (
              <li key={index}>{item.display()}</li>
            ))}
          </ul>
          <ul>
            <h2>Driver</h2>
            {DriverList.map((item, index) => (
              <li key={index}>{item.display()}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
    
  )
}