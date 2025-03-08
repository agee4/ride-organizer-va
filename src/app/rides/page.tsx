"use client"

import { ChangeEvent, useEffect, useState } from "react"
import { RideTimes } from "../_classes/person"
import { Passenger, PassengerSort, sortPassengers, Year } from "../_classes/passenger"
import { Driver, DriverSort, sortDrivers } from "../_classes/driver"
import { Ride, RideSort, sortRides } from "../_classes/ride"

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [passengerList, setPassengerList] = useState<Passenger[]>([])
  const [driverList, setDriverList] = useState<Driver[]>([])
  const [rideList, setRideList] = useState<Ride[]>([])
  const [passengerSort, setPassengerSort] = useState<PassengerSort>()
  const [driverSort, setDriverSort] = useState<DriverSort>()
  const [rideSort, setRideSort] = useState<RideSort>()
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

  const updateRideSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setRideSort(event.target.value as RideSort)
    if (debug) console.log("Set Ride sort to: " + event.target.value)
      const sortedlist = [...rideList]
    sortRides(sortedlist, event.target.value as RideSort)
    setRideList(sortedlist)
  }

  const loadTest = () => {
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
        address:"135 Cornell",
        college:"UCI",
        backup:[RideTimes.FIRST, RideTimes.THIRD],
        year:Year.FRESHMAN
      })
    ])

    setDriverList([
      new Driver({
        name:"Driver 1",
        rides:[RideTimes.FRIDAY,RideTimes.FIRST],
        address:"ABC Street",
        college:"UCI",
        seats:4,
        notes:"note"
      }),
      new Driver({
        name:"Driver 2",
        rides:[RideTimes.FRIDAY],
        address:"292 Tustin Field Dr",
        college:"UCI",
        seats:3,
        notes:"note"
      }),
      new Driver({
        name:"Driver 3",
        rides:[RideTimes.THIRD],
        address:"1",
        college:"UCI",
        seats:6,
        notes:"note"
      })
    ])
  }

  const clearTest = () => {
    setPassengerList([])
    setDriverList([])
    setRideList([])
  }
  
  useEffect(() => {
    if (driverList[0]) {
      const newList = [...rideList]
      for (let driver of driverList) {
        let exists = false
        for (let ride of rideList) {
          if (JSON.stringify(ride.driver) == JSON.stringify(driver)) {
            exists = true
            break
          }
        }
        if (!exists) {
          if (debug) console.log("nothing found")
          newList.push(new Ride({driver:driver,passengers:[]}))
        }
      }
      setRideList(/* [
        new Ride({
          driver:driverList[0],
          passengers:[passengerList[0],passengerList[1],passengerList[2],passengerList[3]]
        })
      ] */newList)
    }
  }, [passengerList, driverList])

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1>rides</h1>
        <p>
          Function: Upload a sheet (either file or google sheet integration),
          process sheet into passengers/drivers/rides
        </p>

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

        {debug && <div className="flex flex-col">
          <button onClick={loadTest}>Load</button>
          <button onClick={clearTest}>Clear</button>
        </div>}

        <div className="flex flex-row w-full justify-evenly">
          <ul className="p-2 rounded-md border border-cyan-500">
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
          </ul>

          <ul className="p-2 rounded-md border border-orange-500">
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
          </ul>

          <ul className="p-2 rounded-md border border-neutral-500">
            <h2>Rides</h2>
            <label>
              <span className="text-neutral-500">Sort by: </span>
              <select
                className="rounded-sm border"
                defaultValue={rideSort}
                onChange={updateRideSort}
              >
                {Object.values(RideSort).map((option) => (
                  <option className="dark:text-black" key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            {rideList.map((item, index) => (
              <li key={index}>{item.display()}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
    
  )
}