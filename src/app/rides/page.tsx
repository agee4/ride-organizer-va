"use client";

import { ChangeEvent, useRef, useState } from "react";
import { read, utils, writeFile } from "xlsx";
import { College, CRUD, RideTimes } from "../_classes/person";
import { Passenger, Year } from "../_classes/passenger";
import { Driver } from "../_classes/driver";
import { RideManager } from "../_components/ride_manager";
import { PeopleManager } from "../_components/people_manager";

interface PassengerParse {
  Timestamp: number;
  "Email Address": string;
  Name: string;
  "Phone Number": string;
  Rides: string;
  Address: string;
  College: string;
  Year: string;
  "Backup Rides": string;
  Notes: string;
}

interface DriverParse {
  Timestamp: number;
  Name: string;
  "Phone Number": string;
  Seats: number;
  Rides: string;
  Address: string;
  College: string;
  Notes: string;
  "Email Address": string;
}

export default function Page() {
  const fileSelectorRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [passengerList, setPassengerList] = useState<Passenger[]>([]);
  const [driverList, setDriverList] = useState<Driver[]>([]);

  const [rmDisplay, setRMdisplay] = useState(false);

  const debug = true;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const usePlaceholder = () => {
    setSelectedFile(null);
    if (fileSelectorRef.current) fileSelectorRef.current.value = "";
    setPassengerList([]);
    setDriverList([]);
  };

  const crudPassenger = (passenger: Passenger, operation: CRUD) => {
    switch (operation) {
      case CRUD.CREATE:
        setPassengerList([...passengerList, passenger]);
        break;
      case CRUD.DELETE:
        setPassengerList([...passengerList].filter((x) => x !== passenger));
        break;
      default:
    }
  };
  const crudDriver = (driver: Driver, operation: CRUD) => {
    switch (operation) {
      case CRUD.CREATE:
        setDriverList([...driverList, driver]);
        break;
      case CRUD.DELETE:
        setDriverList([...driverList].filter((x) => x !== driver));
        break;
      default:
    }
  };

  const loadTest = () => {
    {
      (async () => {
        const f = selectedFile
          ? selectedFile
          : await fetch("/placeholdersheet.xlsx");
        const ab = await f.arrayBuffer();

        const wb = read(ab);

        const passengersws = wb.Sheets[wb.SheetNames[0]];
        const passengerdata: PassengerParse[] =
          utils.sheet_to_json<PassengerParse>(passengersws);
        let filepassengers: Passenger[] = [];
        let mainrideneeds = [];
        let backuprideneeds = [];
        for (let x of passengerdata) {
          mainrideneeds = [];
          backuprideneeds = [];
          if (x["Rides"])
            for (let ride of x.Rides.split(", "))
              switch (ride) {
                case "Friday Bible Study 7:00pm":
                  mainrideneeds.push(RideTimes.FRIDAY);
                  break;
                case "Sunday First Service 8:00am":
                  mainrideneeds.push(RideTimes.FIRST);
                  break;
                case "Sunday Second Service 9:30am":
                  mainrideneeds.push(RideTimes.SECOND);
                  break;
                case "Sunday Third Service 11:30am":
                  mainrideneeds.push(RideTimes.THIRD);
                  break;
              }
          if (x["Backup Rides"])
            for (let ride of x["Backup Rides"].split(", "))
              switch (ride) {
                case "Sunday First Service 8:00am":
                  backuprideneeds.push(RideTimes.FIRST);
                  break;
                case "Sunday Second Service 9:30am":
                  backuprideneeds.push(RideTimes.SECOND);
                  break;
                case "Sunday Third Service 11:30am":
                  backuprideneeds.push(RideTimes.THIRD);
                  break;
              }
          filepassengers.push(
            new Passenger({
              name: x.Name ? x.Name : "",
              rides: mainrideneeds,
              address: x.Address ? x.Address : "",
              college: x.College ? (x.College as College) : College.OTHER,
              year: x.Year ? (x.Year as Year) : Year.OTHER,
              backup: backuprideneeds,
              notes: x.Notes,
            })
          );
        }
        setPassengerList(filepassengers);

        const driverws = wb.Sheets[wb.SheetNames[1]];
        const driverdata: DriverParse[] =
          utils.sheet_to_json<DriverParse>(driverws);
        let filedrivers: Driver[] = [];
        let rides = [];
        for (let x of driverdata) {
          rides = [];
          for (let ride of x.Rides.split(", "))
            switch (ride) {
              case "Friday Bible Study 7:00pm":
                rides.push(RideTimes.FRIDAY);
                break;
              case "Sunday First Service 8:00am":
                rides.push(RideTimes.FIRST);
                break;
              case "Sunday Second Service 9:30am":
                rides.push(RideTimes.SECOND);
                break;
              case "Sunday Third Service 11:30am":
                rides.push(RideTimes.THIRD);
                break;
            }
          filedrivers.push(
            new Driver({
              name: x.Name ? x.Name : "",
              rides: rides,
              seats: x.Seats ? x.Seats : 0,
              address: x.Address ? x.Address : "",
              college: x.College ? (x.College as College) : College.OTHER,
              notes: x.Notes,
            })
          );
        }
        setDriverList(filedrivers);
      })();
    }
  };
  const toggleDisplay = () => {
    setRMdisplay(!rmDisplay);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[calc(100vh-132px)] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1>rides</h1>
        <p>
          Function: Upload a sheet (either file or google sheet integration),
          process sheet into passengers/drivers/rides
        </p>

        <div>
          <label className="block">
            <span className="text-neutral-500">Choose a sheet to upload:</span>
            <br />
            <input
              className="file:rounded-full file:border file:px-2"
              type="file"
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv,.ods,.gsheet"
              ref={fileSelectorRef}
            />
          </label>
          <div className="flex flex-row">
            <button
              className="rounded-full border px-2 disabled:text-neutral-500"
              onClick={loadTest}
            >
              Load
            </button>
            <button
              className="rounded-full border px-2"
              onClick={usePlaceholder}
            >
              Clear
            </button>
          </div>
          <p>Using {selectedFile ? selectedFile.name : "placeholder sheet"}</p>
        </div>

        <button className="rounded-full border px-2" onClick={toggleDisplay}>
          {rmDisplay ? "Manage Passengers and Drivers" : "Manage Rides"}
        </button>

        <div className={rmDisplay ? "w-full" : "hidden"}>
          <RideManager passengerList={passengerList} driverList={driverList} />
        </div>
        <div className={rmDisplay ? "hidden" : "w-full"}>
          <PeopleManager
            passengerList={passengerList}
            driverList={driverList}
            passengerCallback={crudPassenger}
            driverCallback={crudDriver}
          />
        </div>
      </main>
    </div>
  );
}
