"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { read, utils, writeFile } from "xlsx";
import { RideTimes } from "../_classes/person";
import {
  Passenger,
  PassengerSort,
  sortPassengers,
  Year,
} from "../_classes/passenger";
import { Driver, DriverSort, sortDrivers } from "../_classes/driver";
import { RideManager } from "../_components/ride_manager";

interface NewPassengerData {
  name: string;
  address: string;
  service?: RideTimes;
  friday?: RideTimes;
  notes?: string;
}

interface AddPassengerFormProps {
  passengerCallback: (newpassenger: Passenger) => void;
}

const AddPassengerForm = ({ passengerCallback }: AddPassengerFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [newPassengerData, setNewPassengerData] = useState<NewPassengerData>({
    name: "",
    address: "",
    notes: "",
  });
  const [rideSelect, setRideSelect] = useState<RideTimes>();

  const updateFormInput = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewPassengerData({ ...newPassengerData, [name]: value });
  };
  const updateFormSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setRideSelect(value as RideTimes)
    setNewPassengerData({ ...newPassengerData, [name]: value });
  };
  const addNewPassenger = (event: FormEvent) => {
    event.preventDefault();
    if (
      !newPassengerData.name ||
      newPassengerData.name.localeCompare("") == 0
    ) return;
    if (
      !newPassengerData.address ||
      newPassengerData.address.localeCompare("") == 0
    ) return;
    else {
      const newPassengerRides = [];
      if (newPassengerData.friday)
        newPassengerRides.push(newPassengerData.friday);
      if (newPassengerData.service)
        newPassengerRides.push(newPassengerData.service);
      passengerCallback(
        new Passenger({
          name: newPassengerData.name,
          rides: newPassengerRides,
          address: newPassengerData.address,
          college: "UCI",
          year: Year.OTHER,
          notes: newPassengerData.notes,
        })
      );
      setNewPassengerData({
        name: "",
        address: "",
        notes: "",
      })
      formRef.current?.reset();
      setRideSelect(undefined);
    }
  };
  return (
    <form
      className="my-1 p-2 flex flex-col rounded-md border border-cyan-500 bg-cyan-200 dark:bg-cyan-800"
      onSubmit={addNewPassenger}
      ref={formRef}
    >
      <label>Create new Passenger</label>
      <input
        className="rounded-sm border"
        type="text"
        name="name"
        value={newPassengerData.name}
        placeholder="Name"
        required
        minLength={1}
        onChange={updateFormInput}
      />
      <input
        className="rounded-sm border"
        type="text"
        name="address"
        value={newPassengerData.address}
        placeholder="Address"
        required
        minLength={1}
        onChange={updateFormInput}
      />
      <div className="block">
        <select
          name="service"
          value={rideSelect}
          onChange={updateFormSelect}
        >
          <option
            className="dark:text-black"
          >
            --choose a ride--
          </option>
          <option
            className="dark:text-black"
            value={RideTimes.FIRST}
          >
            First
          </option>
          <option
            className="dark:text-black"
            value={RideTimes.SECOND}
          >
            Second
          </option>
          <option
            className="dark:text-black"
            value={RideTimes.THIRD}
          >
            Third
          </option>
        </select>
        <input
          type="checkbox"
          name="friday"
          id="friday"
          value={RideTimes.FRIDAY}
          onChange={updateFormInput}
        />
        <label htmlFor="friday">Friday</label>
      </div>
      <input
        className="rounded-sm border"
        type="text"
        name="notes"
        value={newPassengerData.notes}
        placeholder="Notes"
        onChange={updateFormInput}
      />
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};

interface NewDriverData {
  name: string;
  address: string;
  seats: number;
  service?: RideTimes;
  friday?: RideTimes;
  notes?: string;
}

interface AddDriverFormProps {
  driverCallback: (newdriver: Driver) => void;
}

const AddDriverForm = ({ driverCallback }: AddDriverFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [newDriverData, setNewDriverData] = useState<NewDriverData>({
    name: "",
    address: "",
    seats: 0,
    notes: "",
  });
  const [rideSelect, setRideSelect] = useState<RideTimes>();

  const updateFormInput = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewDriverData({ ...newDriverData, [name]: value });
  };
  const updateFormSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setRideSelect(value as RideTimes)
    setNewDriverData({ ...newDriverData, [name]: value });
  };
  const addNewDriver = (event: FormEvent) => {
    event.preventDefault();
    if (!newDriverData.name || newDriverData.name.localeCompare("") == 0) return;
    if (
      !newDriverData.address ||
      newDriverData.address.localeCompare("") == 0
    ) return;
    if (!newDriverData.seats || newDriverData.seats < 1) {
      alert("Please add at least one seat");
      return;
    }
    const newDriverRides = [];
    if (newDriverData.friday) newDriverRides.push(newDriverData.friday);
    if (newDriverData.service) newDriverRides.push(newDriverData.service);
    driverCallback(
      new Driver({
        name: newDriverData.name,
        rides: newDriverRides,
        seats: newDriverData.seats,
        address: newDriverData.address,
        college: "UCI",
        notes: newDriverData.notes,
      })
    );
    setNewDriverData({
      name: "",
      address: "",
      seats: 0,
      notes: "",
    })
    formRef.current?.reset();
    setRideSelect(undefined);
  };
  return (
    <form
      className="my-1 p-2 flex flex-col rounded-md border border-orange-500 bg-orange-200 dark:bg-orange-800"
      onSubmit={addNewDriver}
      ref={formRef}
    >
      <label>Create new Driver</label>
      <input
        className="rounded-sm border"
        type="text"
        name="name"
        value={newDriverData.name}
        placeholder="Name"
        required
        minLength={1}
        onChange={updateFormInput}
      />
      <input
        className="rounded-sm border"
        type="text"
        name="address"
        value={newDriverData.address}
        placeholder="Address"
        required
        minLength={1}
        onChange={updateFormInput}
      />
      <input
        className="rounded-sm border"
        type="number"
        name="seats"
        value={newDriverData.seats}
        min="1"
        placeholder="Seats"
        required
        onChange={updateFormInput}
      />
      <div className="block">
        <select
          name="service"
          value={rideSelect}
          onChange={updateFormSelect}
        >
          <option
            className="dark:text-black"
          >
            --choose a ride--
          </option>
          <option
            className="dark:text-black"
            value={RideTimes.FIRST}
          >
            First
          </option>
          <option
            className="dark:text-black"
            value={RideTimes.SECOND}
          >
            Second
          </option>
          <option
            className="dark:text-black"
            value={RideTimes.THIRD}
          >
            Third
          </option>
        </select>
        <input
          type="checkbox"
          name="friday"
          id="friday"
          value={RideTimes.FRIDAY}
          onChange={updateFormInput}
        />
        <label htmlFor="friday">Friday</label>
      </div>
      <input
        className="rounded-sm border"
        type="text"
        name="notes"
        value={newDriverData.notes}
        placeholder="Notes"
        onChange={updateFormInput}
      />
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};

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
  Notes: string;
  "Email Address": string;
}

export default function Page() {
  const fileSelectorRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [passengerList, setPassengerList] = useState<Passenger[]>([]);
  const [driverList, setDriverList] = useState<Driver[]>([]);

  const [passengerSort, setPassengerSort] = useState<PassengerSort>(
    PassengerSort.NAME
  );
  const [driverSort, setDriverSort] = useState<DriverSort>(DriverSort.NAME);

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
    setSelectedFile(null)
    if (fileSelectorRef.current) fileSelectorRef.current.value = "";
    setPassengerList([]);
    setDriverList([]);
  }

  const updatePassengerSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setPassengerSort(event.target.value as PassengerSort);
    if (debug) console.log("Set Passenger sort to: " + event.target.value);
    const sortedlist = [...passengerList];
    sortPassengers(sortedlist, event.target.value as PassengerSort);
    setPassengerList(sortedlist);
  };
  const updateDriverSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setDriverSort(event.target.value as DriverSort);
    if (debug) console.log("Set Driver sort to: " + event.target.value);
    const sortedlist = [...driverList];
    sortDrivers(sortedlist, event.target.value as DriverSort);
    setDriverList(sortedlist);
  };
  const toggleDisplay = () => {
    setRMdisplay(!rmDisplay);
  };

  const loadTest = () => {
    {
      (async () => {
        const f = selectedFile ? selectedFile : await fetch("/placeholdersheet.xlsx");
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
              name: (x.Name ? x.Name : ""),
              rides: mainrideneeds,
              address: (x.Address ? x.Address : ""),
              college: (x.College ? x.College : ""),
              year: (x.Year ? (x.Year as Year) : Year.OTHER),
              backup: backuprideneeds,
              notes: x.Notes,
            })
          );
        }

        sortPassengers(filepassengers, passengerSort);
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
              name: x.Name,
              rides: rides,
              seats: x.Seats,
              address: x.Address,
              college: "UCI",
              notes: x.Notes,
            })
          );
        }

        sortDrivers(filedrivers, driverSort);
        setDriverList(filedrivers);
      })();
    }
  };

  const addNewPassenger = (newpassenger: Passenger) => {
    setPassengerList([...passengerList, newpassenger]);
  };
  const addNewDriver = (newdriver: Driver) => {
    setDriverList([...driverList, newdriver]);
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
              <button className="rounded-full border px-2" onClick={usePlaceholder}>
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

        <div
          className={
            rmDisplay ? "hidden" : "flex flex-row w-full justify-evenly"
          }
        >
          <div className="p-2 rounded-md border border-cyan-500 bg-cyan-50 dark:bg-cyan-950">
            <h2>Passengers</h2>
            <label>
              <span className="text-neutral-500">Sort by: </span>
              <select
                className="rounded-sm border"
                value={passengerSort}
                onChange={updatePassengerSort}
              >
                {Object.values(PassengerSort).map((option) => (
                  <option
                    className="dark:text-black"
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <ul className="max-h-[50dvh] overflow-auto">
              {passengerList.map((item, index) => (
                <li key={index}>{item.display()}</li>
              ))}
            </ul>
            <AddPassengerForm passengerCallback={addNewPassenger} />
          </div>

          <div className="p-2 rounded-md border border-orange-500 bg-orange-50 dark:bg-orange-950">
            <h2>Drivers</h2>
            <label>
              <span className="text-neutral-500">Sort by: </span>
              <select
                className="rounded-sm border"
                value={driverSort}
                onChange={updateDriverSort}
              >
                {Object.values(DriverSort).map((option) => (
                  <option
                    className="dark:text-black"
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <ul className="max-h-[50dvh] overflow-auto">
              {driverList.map((item, index) => (
                <li key={index}>{item.display()}</li>
              ))}
            </ul>
            <AddDriverForm driverCallback={addNewDriver} />
          </div>
        </div>
      </main>
    </div>
  );
}
