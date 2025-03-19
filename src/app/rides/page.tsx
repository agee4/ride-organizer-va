"use client";

import { ChangeEvent, useCallback, useReducer, useRef, useState } from "react";
import { read, utils, writeFile } from "xlsx";
import { College, RideTimes } from "../_classes/person";
import { Passenger, passengerReducer, Year } from "../_classes/passenger";
import { Driver, driverReducer } from "../_classes/driver";
import { RideManager } from "../_components/ride_manager";
import { PeopleManager } from "../_components/people_manager";
import { Ride, rideReducer } from "../_classes/ride";

export default function Page() {
  const fileSelectorRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [passengerCollection, passengerDispatch] = useReducer(
    passengerReducer,
    new Map<string, Passenger>()
  );
  const [driverCollection, driverDispatch] = useReducer(
    driverReducer,
    new Map<string, Driver>()
  );
  const [rideCollection, rideDispatch] = useReducer(
    rideReducer,
    new Map<string, Ride>()
  );

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
    passengerDispatch({
      type: "set",
      passengers: new Map<string, Passenger>(),
    });
    driverDispatch({ type: "set", drivers: new Map<string, Driver>() });
  };

  const loadSheet = async () => {
    const f = selectedFile
      ? selectedFile
      : await fetch("/placeholdersheet.xlsx");
    const ab = await f.arrayBuffer();

    const wb = read(ab);

    for (let wsn of wb.SheetNames) {
      const ws = wb.Sheets[wsn];
      const data: any[] = utils.sheet_to_json(ws);
      if (wsn.toLocaleLowerCase().trim().includes("passenger")) {
        let mainrideneeds = [];
        let backuprideneeds = [];
        for (let x of data) {
          mainrideneeds = [];
          backuprideneeds = [];
          if (x.Rides)
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
              email: x["Email Address"] ? x["Email Address"] : "",
              name: x.Name ? x.Name : "",
              rides: mainrideneeds,
              address: x.Address ? x.Address : "",
              college: x.College ? (x.College as College) : College.OTHER,
              year: x.Year ? (x.Year as Year) : Year.OTHER,
              backup: backuprideneeds,
              phone: x["Phone Number"],
              notes: x.Notes,
            }),
          });
        }
      } else if (wsn.toLocaleLowerCase().trim().includes("driver")) {
        let rides = [];
        for (let x of data) {
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
              email: x["Email Address"] ? x["Email Address"] : "",
              name: x.Name ? x.Name : "",
              rides: rides,
              seats: x.Seats ? x.Seats : 0,
              address: x.Address ? x.Address : "",
              college: x.College ? (x.College as College) : College.OTHER,
              phone: x["Phone Number"],
              notes: x.Notes,
            }),
          });
        }
      } else if (wsn.toLocaleLowerCase().trim().includes("ride")) {
      }
    }
  };
  const saveSheet = useCallback(() => {
    const wb = utils.book_new();
    let passengerJSON = [];
    for (let passenger of passengerCollection.values()) {
      passengerJSON.push({
        Email: passenger.getEmail(),
        Name: passenger.name,
        Rides: passenger.rides.toLocaleString(),
        Address: passenger.address,
        College: passenger.college,
        Year: passenger.year,
        "Backup Rides": passenger.backup?.toLocaleString(),
        Notes: passenger.notes,
      });
    }
    const ws_p = utils.json_to_sheet(passengerJSON);
    utils.book_append_sheet(wb, ws_p, "Passengers");
    let driverJSON = [];
    for (let driver of driverCollection.values()) {
      driverJSON.push({
        Email: driver.getEmail(),
        Name: driver.name,
        Seats: driver.seats,
        Rides: driver.rides.toLocaleString(),
        Address: driver.address,
        College: driver.college,
        Notes: driver.notes,
      });
    }
    console.log(driverJSON);
    const ws_d = utils.json_to_sheet(driverJSON);
    utils.book_append_sheet(wb, ws_d, "Drivers");
    if (rideCollection.size > 0) {
      let rideJSON = [];
      for (let ride of rideCollection.values()) {
        rideJSON.push({
          ride: ride.passengers,
        });
      }
      const ws_r = utils.json_to_sheet(rideJSON);
      utils.book_append_sheet(wb, ws_r, "Rides");
    }
    writeFile(wb, "ridesheet.xlsx");
  }, [passengerCollection, driverCollection]);
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
              onClick={loadSheet}
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
            originPassengers={passengerCollection}
            originDrivers={driverCollection}
            rideCallback={rideDispatch}
          />
        </div>
        <div className={rmDisplay ? "hidden" : "w-full"}>
          <PeopleManager
            passengerCollection={[...passengerCollection.values()]}
            driverCollection={[...driverCollection.values()]}
            passengerCallback={passengerDispatch}
            driverCallback={driverDispatch}
          />
        </div>
        <button onClick={saveSheet}>Save File</button>
      </main>
    </div>
  );
}
