"use client"

import { ChangeEvent, FormEvent, useState } from "react"
import { RideTimes } from "../_classes/person"
import { Passenger, PassengerSort, sortPassengers, Year } from "../_classes/passenger"
import { Driver, DriverSort, sortDrivers } from "../_classes/driver"
import { RideManager } from "../_components/ride_manager"

interface NewPassengerData {
  name: string,
  address: string,
  service?: RideTimes,
  friday?: RideTimes,
  notes?: string
}

interface NewDriverData {
  name: string,
  address: string,
  seats: number,
  service?: RideTimes,
  friday?: RideTimes,
  notes?: string
}

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [passengerList, setPassengerList] = useState<Passenger[]>([])
  const [driverList, setDriverList] = useState<Driver[]>([])

  const [passengerSort, setPassengerSort] = useState<PassengerSort>(PassengerSort.NAME)
  const [driverSort, setDriverSort] = useState<DriverSort>(DriverSort.NAME)

  const [newPassengerData, setNewPassengerData] = useState<NewPassengerData>({
    name: "",
    address: "",
    notes: ""
  })
  const [newDriverData, setNewDriverData] = useState<NewDriverData>({
    name: "",
    address: "",
    seats: 0,
    notes: ""
  })
  
  const debug = true

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0])
    } else {
      setSelectedFile(null)
    }
  }

  const updatePassengerSort = (event: ChangeEvent<HTMLSelectElement>) => {  
    setPassengerSort(event.target.value as PassengerSort)
    if (debug) console.log("Set Passenger sort to: " + event.target.value)
    const sortedlist = [...passengerList]
    sortPassengers(sortedlist, event.target.value as PassengerSort)
    setPassengerList(sortedlist)
  }
  const updateDriverSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setDriverSort(event.target.value as DriverSort)
    if (debug) console.log("Set Driver sort to: " + event.target.value)
      const sortedlist = [...driverList]
    sortDrivers(sortedlist, event.target.value as DriverSort)
    setDriverList(sortedlist)
  }

  const loadTest = () => {
    const testpassengers = [
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
        address:"135 Cornell",
        college:"UCI",
        backup:[RideTimes.FIRST, RideTimes.THIRD],
        year:Year.FRESHMAN
      })
    ]
    sortPassengers(testpassengers, passengerSort)
    setPassengerList(testpassengers)
    

    const testdrivers = [
      new Driver({
        name:"Driver 1",
        rides:[RideTimes.FRIDAY,RideTimes.FIRST],
        address:"ABC Street",
        college:"UCI",
        seats:4,
        notes:"note"
      }),/* 
      new Driver({
        name:"Driver 2",
        rides:[RideTimes.FRIDAY],
        address:"292 Tustin Field Dr",
        college:"UCI",
        seats:3,
      }),
      new Driver({
        name:"Driver 3",
        rides:[RideTimes.THIRD],
        address:"1",
        college:"UCI",
        seats:6,
        notes:"funne"
      }) */
    ]
    sortDrivers(testdrivers, driverSort)
    setDriverList(testdrivers)
  }
  const clearTest = () => {
    setPassengerList([])
    setDriverList([])
  }

  const updateNewPassenger = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    /* if (debug) console.log(name + " " + value) */
    setNewPassengerData({...newPassengerData, [name]: value})
  }
  const addNewPassenger = (event: FormEvent) => {
    event.preventDefault()
    const newPassengerRides = []
    if (newPassengerData.friday) newPassengerRides.push(newPassengerData.friday)
    if (newPassengerData.service) newPassengerRides.push(newPassengerData.service)
    setPassengerList([...passengerList, new Passenger({
      name:newPassengerData.name,
      rides:newPassengerRides,
      address:newPassengerData.address,
      college:"UCI",
      year:Year.OTHER,
      notes:newPassengerData.notes
    })])
  }
  const updateNewDriver = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    /* if (debug) console.log(name + " " + value) */
    setNewDriverData({...newDriverData, [name]: value})
  }
  const addNewDriver = (event: FormEvent) => {
    event.preventDefault()
    const newDriverRides = []
    if (newDriverData.friday) newDriverRides.push(newDriverData.friday)
    if (newDriverData.service) newDriverRides.push(newDriverData.service)
    setDriverList([...driverList, new Driver({
      name:newDriverData.name,
      address:newDriverData.address,
      seats:newDriverData.seats,
      rides:newDriverRides,
      college:"UCI",
      notes:newDriverData.notes
    })])
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
          <label className="block">
            <span className="text-neutral-500">Choose a sheet to upload:</span>
            <br />
            <input
              type="file"
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv,.ods,.gsheet"
            />
          </label>
          <button
            className="rounded-full border px-2 disabled:text-neutral-500"
            disabled={!selectedFile}
            /* onClick={} */
          >
            Upload
          </button>
        </form>

        <RideManager
          passengerList={passengerList}
          driverList={driverList}
        />

        {debug && <div className="flex flex-col">
          <button onClick={loadTest}>Load Defaults</button>
          <button onClick={clearTest}>Clear</button>
        </div>}

        <div className="flex flex-row w-full justify-evenly">
          <ul className="p-2 rounded-md border border-cyan-500 bg-cyan-50 dark:bg-cyan-950 max-h-1/2 overflow-auto">
            <h2>Passengers</h2>
            <label>
              <span className="text-neutral-500">Sort by: </span>
              <select
                className="rounded-sm border"
                value={passengerSort}
                onChange={updatePassengerSort}
              >
                {Object.values(PassengerSort).map((option) => (
                  <option className="dark:text-black" key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            {passengerList.map((item, index) => (
              <li key={index}>{item.display()}</li>
            ))}
            <form className="p-2 flex flex-col rounded-md border border-cyan-500 bg-cyan-200 dark:bg-cyan-800">
              <label>Create new Passenger</label>
              <input
                className="rounded-sm border"
                type="text"
                name="name"
                value={newPassengerData.name}
                placeholder="Name"
                required
                onChange={updateNewPassenger}
              />
              <input
                className="rounded-sm border"
                type="text"
                name="address"
                value={newPassengerData.address}
                placeholder="Address"
                required
                onChange={updateNewPassenger}
              />
              <div className="block">
                <input
                  type="radio"
                  name="service"
                  id="first"
                  value={RideTimes.FIRST}
                  onChange={updateNewPassenger}
                />
                <label htmlFor="first">First</label>
                <input
                  type="radio"
                  name="service"
                  id="second"
                  value={RideTimes.SECOND}
                  onChange={updateNewPassenger}
                />
                <label htmlFor="second">Second</label>
                <input
                  type="radio"
                  name="service"
                  id="third"
                  value={RideTimes.THIRD}
                  onChange={updateNewPassenger}
                />
                <label htmlFor="third">Third</label>
                <input
                  type="checkbox"
                  name="friday"
                  id="friday"
                  value={RideTimes.FRIDAY}
                  onChange={updateNewPassenger}
                />
                <label htmlFor="friday">Friday</label>
              </div>
              <input
                className="rounded-sm border"
                type="text"
                name="notes"
                value={newPassengerData.notes}
                placeholder="Notes"
                onChange={updateNewPassenger}
              />
              <br />
              <button onClick={addNewPassenger}>Submit</button>
            </form>
          </ul>

          <ul className="p-2 rounded-md border border-orange-500 bg-orange-50 dark:bg-orange-950">
            <h2>Drivers</h2>
            <label>
              <span className="text-neutral-500">Sort by: </span>
              <select
                className="rounded-sm border"
                defaultValue={driverSort}
                onChange={updateDriverSort}
              >
                {Object.values(DriverSort).map((option) => (
                  <option className="dark:text-black" key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            {driverList.map((item, index) => (
              <li key={index}>{item.display()}</li>
            ))}
            <form className="p-2 flex flex-col rounded-md border border-orange-500 bg-orange-200 dark:bg-orange-800">
              <label>Create new Driver</label>
              <input
                className="rounded-sm border"
                type="text"
                name="name"
                value={newDriverData.name}
                placeholder="Name"
                required
                onChange={updateNewDriver}
              />
              <input
                className="rounded-sm border"
                type="text"
                name="address"
                value={newDriverData.address}
                placeholder="Address"
                required
                onChange={updateNewDriver}
              />
              <input
                className="rounded-sm border"
                type="number"
                name="seats"
                value={newDriverData.seats}
                min="0"
                placeholder="Seats"
                required
                onChange={updateNewDriver}
              />
              <div className="block">
                <input
                  type="radio"
                  name="service"
                  id="first"
                  value={RideTimes.FIRST}
                  onChange={updateNewDriver}
                />
                <label htmlFor="first">First</label>
                <input
                  type="radio"
                  name="service"
                  id="second"
                  value={RideTimes.SECOND}
                  onChange={updateNewDriver}
                />
                <label htmlFor="second">Second</label>
                <input
                  type="radio"
                  name="service"
                  id="third"
                  value={RideTimes.THIRD}
                  onChange={updateNewDriver}
                />
                <label htmlFor="third">Third</label>
                <input
                  type="checkbox"
                  name="friday"
                  id="friday"
                  value={RideTimes.FRIDAY}
                  onChange={updateNewDriver}
                />
                <label htmlFor="friday">Friday</label>
              </div>
              <input
                className="rounded-sm border"
                type="text"
                name="notes"
                value={newDriverData.notes}
                placeholder="Notes"
                onChange={updateNewDriver}
              />
              <br />
              <button onClick={addNewDriver}>Submit</button>
            </form>
          </ul>
        </div>
      </main>
    </div>
    
  )
}