"use client";

import { ChangeEvent, useEffect, useReducer, useRef, useState } from "react";
import { read, utils, writeFile } from "xlsx";
import { College, RideTimes } from "../_classes/person";
import { Passenger, passengerReducer, Year } from "../_classes/passenger";
import { Driver, driverReducer } from "../_classes/driver";
import { RideManager } from "../_components/_ride_manager/ride_manager";
import { PeopleManager } from "../_components/_people_manager/people_manager";
import { Ride, rideReducer } from "../_classes/ride";

export default function Page() {
  const fileSelectorRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };
  const [saveSheetName, setSaveSheetName] = useState<string>("ridesheet");
  const updateSaveSheetName = (event: ChangeEvent<HTMLInputElement>) => {
    setSaveSheetName(event.target.value);
  };

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
  const toggleDisplay = () => {
    setRMdisplay(!rmDisplay);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileSelectorRef.current) fileSelectorRef.current.value = "";
  };

  const clearPeople = () => {
    passengerDispatch({
      type: "set",
      passengers: new Map<string, Passenger>(),
    });
    driverDispatch({ type: "set", drivers: new Map<string, Driver>() });
  };

  const loadSheet = async () => {
    clearPeople();
    const f = selectedFile
      ? selectedFile
      : await fetch("/placeholdersheet.xlsx");
    const ab = await f.arrayBuffer();

    const wb = read(ab);
    const passengertemp = new Map<string, Passenger>();
    const drivertemp = new Map<string, Driver>();

    for (const wsn of wb.SheetNames) {
      const ws = wb.Sheets[wsn];
      const data: any[] = utils.sheet_to_json(ws);
      if (wsn.toLocaleLowerCase().trim().includes("passenger")) {
        let mainrideneeds = [];
        let backuprideneeds = [];
        for (const x of data) {
          mainrideneeds = [];
          backuprideneeds = [];
          if (x.Rides)
            for (const ride of x.Rides.split(",")) {
              if (ride.toLocaleLowerCase().trim().includes("friday")) {
                mainrideneeds.push(RideTimes.FRIDAY);
              } else if (ride.toLocaleLowerCase().trim().includes("first")) {
                mainrideneeds.push(RideTimes.FIRST);
              } else if (ride.toLocaleLowerCase().trim().includes("second")) {
                mainrideneeds.push(RideTimes.SECOND);
              } else if (ride.toLocaleLowerCase().trim().includes("third")) {
                mainrideneeds.push(RideTimes.THIRD);
              }
            }
          if (x["Backup Rides"])
            for (const ride of x["Backup Rides"].split(", ")) {
              if (ride.toLocaleLowerCase().trim().includes("first")) {
                backuprideneeds.push(RideTimes.FIRST);
              } else if (ride.toLocaleLowerCase().trim().includes("second")) {
                backuprideneeds.push(RideTimes.SECOND);
              } else if (ride.toLocaleLowerCase().trim().includes("third")) {
                backuprideneeds.push(RideTimes.THIRD);
              }
            }
          const newpassenger = new Passenger({
            email: x["Email Address"] ? x["Email Address"] : "",
            name: x.Name ? x.Name : "",
            rides: mainrideneeds,
            address: x.Address ? x.Address : "",
            college: x.College ? (x.College as College) : College.OTHER,
            year: x.Year ? (x.Year as Year) : Year.OTHER,
            backup: backuprideneeds,
            phone: x["Phone Number"],
            notes: x.Notes,
          });

          passengertemp.set(newpassenger.getEmail(), newpassenger);
        }
        passengerDispatch({
          type: "set",
          passengers: passengertemp,
        });
      } else if (wsn.toLocaleLowerCase().trim().includes("driver")) {
        let rides = [];
        for (const x of data) {
          rides = [];
          for (const ride of x.Rides.split(",")) {
            if (ride.toLocaleLowerCase().trim().includes("friday")) {
              rides.push(RideTimes.FRIDAY);
            } else if (ride.toLocaleLowerCase().trim().includes("first")) {
              rides.push(RideTimes.FIRST);
            } else if (ride.toLocaleLowerCase().trim().includes("second")) {
              rides.push(RideTimes.SECOND);
            } else if (ride.toLocaleLowerCase().trim().includes("third")) {
              rides.push(RideTimes.THIRD);
            }
          }
          const newdriver = new Driver({
            email: x["Email Address"] ? x["Email Address"] : "",
            name: x.Name ? x.Name : "",
            rides: rides,
            seats: x.Seats ? x.Seats : 0,
            address: x.Address ? x.Address : "",
            college: x.College ? (x.College as College) : College.OTHER,
            phone: x["Phone Number"],
            notes: x.Notes,
          });
          drivertemp.set(newdriver.getEmail(), newdriver);
        }
        driverDispatch({
          type: "set",
          drivers: drivertemp,
        });
      }
    }
    for (const wsn of wb.SheetNames) {
      if (wsn.toLocaleLowerCase().trim().includes("ride")) {
        const ws = wb.Sheets[wsn];
        const data: any[] = utils.sheet_to_json(ws);
        for (const x of data) {
          const rdriver = drivertemp.get(
            x.Driver.slice(x.Driver.indexOf("(") + 1, x.Driver.indexOf(")"))
          );
          const rpassengers = new Map<string, Passenger>();
          for (const k in x) {
            if (k.toLocaleLowerCase().trim().includes("passenger"))
              for (const rpassengerstring of x[k].split(",")) {
                const rpassengeremail = rpassengerstring.slice(
                  rpassengerstring.indexOf("(") + 1,
                  rpassengerstring.indexOf(")")
                );
                const rpassenger = passengertemp.get(rpassengeremail);
                if (rpassenger) {
                  rpassengers.set(rpassengeremail, rpassenger);
                }
              }
          }
          if (rdriver && true)
            rideDispatch({
              type: "create",
              ride: new Ride({
                driver: rdriver,
                passengers: rpassengers,
              }),
            });
        }
      }
    }
  };
  const saveSheet = () => {
    const wb = utils.book_new();
    const passengerJSON = [];
    for (const passenger of passengerCollection.values()) {
      passengerJSON.push({
        "Email Address": passenger.getEmail(),
        Name: passenger.getName(),
        "Phone Number": passenger.getPhone(),
        Rides: passenger.getRides().toLocaleString(),
        Address: passenger.getAddress(),
        College: passenger.getCollege(),
        Year: passenger.getYear(),
        "Backup Rides": passenger.getBackup().toLocaleString(),
        Notes: passenger.getNotes(),
      });
    }
    const ws_p = utils.json_to_sheet(passengerJSON);
    utils.book_append_sheet(wb, ws_p, "Passengers");
    const driverJSON = [];
    for (const driver of driverCollection.values()) {
      driverJSON.push({
        "Email Address": driver.getEmail(),
        Name: driver.getName(),
        "Phone Number": driver.getPhone(),
        Seats: driver.getSeats(),
        College: driver.getCollege(),
        Rides: driver.getRides().toLocaleString(),
        Address: driver.getAddress(),
        Notes: driver.getNotes(),
      });
    }
    const ws_d = utils.json_to_sheet(driverJSON);
    utils.book_append_sheet(wb, ws_d, "Drivers");
    if (rideCollection.size > 0) {
      const rideJSON = [];
      for (const ride of rideCollection.values()) {
        const rideRecord: Record<string, string | number> = {};
        rideRecord["Driver"] =
          ride.getDriver().getName() + "(" + ride.getDriver().getEmail() + ")";
        Array.from(ride.getPassengers().values()).forEach(
          (value, index) =>
            (rideRecord["Passenger " + (index + 1)] =
              value.getName() + "(" + value.getEmail() + ")")
        );
        rideJSON.push(rideRecord);
      }
      const ws_r = utils.json_to_sheet(rideJSON);
      utils.book_append_sheet(wb, ws_r, "Rides");
    }
    writeFile(
      wb,
      (saveSheetName.length > 1 ? saveSheetName : "savedsheet") + ".xlsx"
    );
  };

  useEffect(() => {
    const storedPassengersString = localStorage.getItem("passengers");
    const storedPassengerCollection = new Map<string, Passenger>();
    if (storedPassengersString) {
      const storedPassengerJSON = JSON.parse(storedPassengersString);
      for (const x in storedPassengerJSON) {
        storedPassengerCollection.set(
          x,
          new Passenger({
            email: storedPassengerJSON[x]["email"],
            name: storedPassengerJSON[x]["name"],
            rides: storedPassengerJSON[x]["rides"],
            address: storedPassengerJSON[x]["address"],
            college: storedPassengerJSON[x]["college"],
            year: storedPassengerJSON[x]["year"],
            backup: storedPassengerJSON[x]["backup"],
            phone: storedPassengerJSON[x]["phone"],
            notes: storedPassengerJSON[x]["notes"],
          })
        );
      }
      passengerDispatch({ type: "set", passengers: storedPassengerCollection });
    }
    const storedDriversString = localStorage.getItem("drivers");
    const storedDriverCollection = new Map<string, Driver>();
    if (storedDriversString) {
      const storedDriverJSON = JSON.parse(storedDriversString);
      for (const x in storedDriverJSON) {
        storedDriverCollection.set(
          x,
          new Driver({
            email: storedDriverJSON[x]["email"],
            name: storedDriverJSON[x]["name"],
            seats: storedDriverJSON[x]["seats"],
            rides: storedDriverJSON[x]["rides"],
            address: storedDriverJSON[x]["address"],
            college: storedDriverJSON[x]["college"],
            phone: storedDriverJSON[x]["phone"],
            notes: storedDriverJSON[x]["notes"],
          })
        );
      }
      driverDispatch({ type: "set", drivers: storedDriverCollection });
    }
    const storedRidesString = localStorage.getItem("rides");
    if (storedRidesString) {
      const storedRidesJSON = JSON.parse(storedRidesString);
      const storedRidesCollection = new Map<string, Ride>();
      for (const driverEmail in storedRidesJSON) {
        const assignedPassengerCollection = new Map<string, Passenger>();
        for (const passengerEmail of storedRidesJSON[driverEmail]) {
          const rp = storedPassengerCollection.get(passengerEmail);
          if (rp) assignedPassengerCollection.set(passengerEmail, rp);
        }
        const d = storedDriverCollection.get(driverEmail);
        if (d)
          storedRidesCollection.set(
            driverEmail,
            new Ride({
              driver: d,
              passengers: assignedPassengerCollection,
            })
          );
      }
      rideDispatch({ type: "set", rides: storedRidesCollection });
    }
  }, []);

  useEffect(() => {
    const storage: Record<string, Passenger> = {};
    for (const [key, value] of passengerCollection) storage[key] = value;
    localStorage.setItem("passengers", JSON.stringify(storage));
  }, [passengerCollection]);
  useEffect(() => {
    const storage: Record<string, Driver> = {};
    for (const [key, value] of driverCollection) storage[key] = value;
    localStorage.setItem("drivers", JSON.stringify(storage));
  }, [driverCollection]);
  useEffect(() => {
    const storage: Record<string, string[]> = {};
    for (const [key, value] of rideCollection) {
      storage[key] = Array.from(value.getPassengers().keys());
    }
    localStorage.setItem("rides", JSON.stringify(storage));
  }, [rideCollection]);

  return (
    <div className="grid min-h-[calc(100vh-132px)] grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <h1>rides</h1>
        <div>
          <label className="block">
            <span className="text-neutral-500">Choose a sheet to upload:</span>
            <br />
            <input
              className="file:rounded-sm file:border file:px-2"
              type="file"
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv,.ods,.gsheet"
              ref={fileSelectorRef}
            />
            {selectedFile && (
              <button className="rounded-full border px-2" onClick={clearFile}>
                Clear
              </button>
            )}
          </label>
          <div className="flex flex-row">
            <button
              className="rounded-full border px-2 disabled:text-neutral-500"
              onClick={loadSheet}
            >
              Load Data
            </button>
            <button className="rounded-full border px-2" onClick={clearPeople}>
              Clear Data
            </button>
          </div>
        </div>

        <div>
          <button className="rounded-full border px-2" onClick={toggleDisplay}>
            {rmDisplay ? "Manage People" : "Manage Rides"}
          </button>

          <div className={rmDisplay ? "w-full" : "hidden"}>
            <RideManager
              originPassengers={passengerCollection}
              originDrivers={driverCollection}
              originRides={rideCollection}
              rideCallback={rideDispatch}
            />
          </div>
          <div className={rmDisplay ? "hidden" : "w-full"}>
            <PeopleManager
              passengerCollection={passengerCollection}
              driverCollection={driverCollection}
              passengerCallback={passengerDispatch}
              driverCallback={driverDispatch}
            />
          </div>
          <div>
            <div className="flex flex-row">
              <input
                className="rounded-sm border"
                type="text"
                value={saveSheetName}
                placeholder="Set Sheet Name"
                onChange={updateSaveSheetName}
              />
              .xlsx
            </div>
            <button className="rounded-full border px-2" onClick={saveSheet}>
              Save Data to Sheet
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
