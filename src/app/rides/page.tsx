"use client";

import { ChangeEvent, useReducer, useRef, useState } from "react";
import { read, utils, writeFile } from "xlsx";
import { College, RideTimes } from "../_classes/person";
import { Passenger, passengerReducer, Year } from "../_classes/passenger";
import { Driver, driverReducer } from "../_classes/driver";
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

  const [passengerList, passengerDispatch] = useReducer(passengerReducer, []);
  const [driverList, driverDispatch] = useReducer(driverReducer, []);

  const [rmDisplay, setRMdisplay] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const usePlaceholderSheet = () => {
    setSelectedFile(null);
    if (fileSelectorRef.current) fileSelectorRef.current.value = "";
    passengerDispatch({ type: "set", passengerlist: [] });
    driverDispatch({ type: "set", driverlist: [] });
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
          passengerDispatch({
            type: "create",
            passenger: new Passenger({
              name: x.Name ? x.Name : "",
              rides: mainrideneeds,
              address: x.Address ? x.Address : "",
              college: x.College ? (x.College as College) : College.OTHER,
              year: x.Year ? (x.Year as Year) : Year.OTHER,
              backup: backuprideneeds,
              notes: x.Notes,
            }),
          });
        }

        const driverws = wb.Sheets[wb.SheetNames[1]];
        const driverdata: DriverParse[] =
          utils.sheet_to_json<DriverParse>(driverws);
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
          driverDispatch({
            type: "create",
            driver: new Driver({
              name: x.Name ? x.Name : "",
              rides: rides,
              seats: x.Seats ? x.Seats : 0,
              address: x.Address ? x.Address : "",
              college: x.College ? (x.College as College) : College.OTHER,
              notes: x.Notes,
            }),
          });
        }
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
              onClick={usePlaceholderSheet}
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
          <RideManager
            originPassengerList={passengerList}
            originDriverList={driverList}
          />
        </div>
        <div className={rmDisplay ? "hidden" : "w-full"}>
          <PeopleManager
            passengerList={passengerList}
            driverList={driverList}
            passengerCallback={passengerDispatch}
            driverCallback={driverDispatch}
          />
        </div>
      </main>
    </div>
  );
}
