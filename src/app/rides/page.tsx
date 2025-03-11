"use client";

import { ChangeEvent, FormEvent, useState } from "react";
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
  const [newPassengerData, setNewPassengerData] = useState<NewPassengerData>({
    name: "",
    address: "",
    notes: "",
  });
  const updateForm = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewPassengerData({ ...newPassengerData, [name]: value });
  };
  const addNewPassenger = (event: FormEvent) => {
    event.preventDefault();
    if (
      !newPassengerData.name ||
      newPassengerData.name.localeCompare("") == 0
    ) {
      alert("Please add a valid name");
      return;
    }
    if (
      !newPassengerData.address ||
      newPassengerData.address.localeCompare("") == 0
    ) {
      alert("Please add a valid address");
      return;
    }
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
  };
  return (
    <form className="my-1 p-2 flex flex-col rounded-md border border-cyan-500 bg-cyan-200 dark:bg-cyan-800">
      <label>Create new Passenger</label>
      <input
        className="rounded-sm border"
        type="text"
        name="name"
        value={newPassengerData.name}
        placeholder="Name"
        required
        onChange={updateForm}
      />
      <input
        className="rounded-sm border"
        type="text"
        name="address"
        value={newPassengerData.address}
        placeholder="Address"
        required
        onChange={updateForm}
      />
      <div className="block">
        <input
          type="radio"
          name="service"
          id="first"
          value={RideTimes.FIRST}
          onChange={updateForm}
        />
        <label htmlFor="first">First</label>
        <input
          type="radio"
          name="service"
          id="second"
          value={RideTimes.SECOND}
          onChange={updateForm}
        />
        <label htmlFor="second">Second</label>
        <input
          type="radio"
          name="service"
          id="third"
          value={RideTimes.THIRD}
          onChange={updateForm}
        />
        <label htmlFor="third">Third</label>
        <input
          type="checkbox"
          name="friday"
          id="friday"
          value={RideTimes.FRIDAY}
          onChange={updateForm}
        />
        <label htmlFor="friday">Friday</label>
      </div>
      <input
        className="rounded-sm border"
        type="text"
        name="notes"
        value={newPassengerData.notes}
        placeholder="Notes"
        onChange={updateForm}
      />
      <br />
      <button onClick={addNewPassenger}>Submit</button>
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
  const [newDriverData, setNewDriverData] = useState<NewDriverData>({
    name: "",
    address: "",
    seats: 0,
    notes: "",
  });
  const updateForm = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewDriverData({ ...newDriverData, [name]: value });
  };
  const addNewDriver = (event: FormEvent) => {
    event.preventDefault();
    if (!newDriverData.name || newDriverData.name.localeCompare("") == 0) {
      alert("Please add a valid name");
      return;
    }
    if (
      !newDriverData.address ||
      newDriverData.address.localeCompare("") == 0
    ) {
      alert("Please add a valid address");
      return;
    }
    if (!newDriverData.seats || newDriverData.seats < 1) {
      alert("Please add at least one seat");
      return;
    }
    const newPassengerRides = [];
    if (newDriverData.friday) newPassengerRides.push(newDriverData.friday);
    if (newDriverData.service) newPassengerRides.push(newDriverData.service);
    driverCallback(
      new Driver({
        name: newDriverData.name,
        rides: newPassengerRides,
        seats: newDriverData.seats,
        address: newDriverData.address,
        college: "UCI",
        notes: newDriverData.notes,
      })
    );
  };
  return (
    <form className="my-1 p-2 flex flex-col rounded-md border border-orange-500 bg-orange-200 dark:bg-orange-800">
      <label>Create new Driver</label>
      <input
        className="rounded-sm border"
        type="text"
        name="name"
        value={newDriverData.name}
        placeholder="Name"
        required
        onChange={updateForm}
      />
      <input
        className="rounded-sm border"
        type="text"
        name="address"
        value={newDriverData.address}
        placeholder="Address"
        required
        onChange={updateForm}
      />
      <input
        className="rounded-sm border"
        type="number"
        name="seats"
        value={newDriverData.seats}
        min="0"
        placeholder="Seats"
        required
        onChange={updateForm}
      />
      <div className="block">
        <input
          type="radio"
          name="service"
          id="first"
          value={RideTimes.FIRST}
          onChange={updateForm}
        />
        <label htmlFor="first">First</label>
        <input
          type="radio"
          name="service"
          id="second"
          value={RideTimes.SECOND}
          onChange={updateForm}
        />
        <label htmlFor="second">Second</label>
        <input
          type="radio"
          name="service"
          id="third"
          value={RideTimes.THIRD}
          onChange={updateForm}
        />
        <label htmlFor="third">Third</label>
        <input
          type="checkbox"
          name="friday"
          id="friday"
          value={RideTimes.FRIDAY}
          onChange={updateForm}
        />
        <label htmlFor="friday">Friday</label>
      </div>
      <input
        className="rounded-sm border"
        type="text"
        name="notes"
        value={newDriverData.notes}
        placeholder="Notes"
        onChange={updateForm}
      />
      <br />
      <button onClick={addNewDriver}>Submit</button>
    </form>
  );
};

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [passengerList, setPassengerList] = useState<Passenger[]>([]);
  const [driverList, setDriverList] = useState<Driver[]>([]);

  const [passengerSort, setPassengerSort] = useState<PassengerSort>(
    PassengerSort.NAME
  );
  const [driverSort, setDriverSort] = useState<DriverSort>(DriverSort.NAME);

  const [newDriverData, setNewDriverData] = useState<NewDriverData>({
    name: "",
    address: "",
    seats: 0,
    notes: "",
  });

  const debug = true;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

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

  const loadTest = () => {
    const testpassengers = [
      new Passenger({
        name: "Passenger 1",
        rides: [RideTimes.FRIDAY, RideTimes.FIRST],
        address: "292 Tustin Field Dr",
        college: "UCI",
        year: Year.OTHER,
        backup: [RideTimes.SECOND],
      }),
      new Passenger({
        name: "Passenger 2",
        rides: [RideTimes.SECOND],
        address: "53 Dartmouth",
        college: "UCI",
        year: Year.SENIOR,
        backup: [RideTimes.THIRD],
        notes: "test",
      }),
      new Passenger({
        name: "Passenger 3",
        rides: [RideTimes.THIRD],
        address: "287 Berkeley Ave",
        college: "UCI",
        year: Year.JUNIOR,
        notes: "idk",
      }),
      new Passenger({
        name: "Passenger 4",
        rides: [RideTimes.FRIDAY],
        address: "112 Stanford Ct",
        college: "UCI",
        year: Year.SOPHOMORE,
      }),
      new Passenger({
        name: "Passenger 5",
        rides: [RideTimes.FRIDAY, RideTimes.SECOND],
        address: "135 Cornell",
        college: "UCI",
        backup: [RideTimes.FIRST, RideTimes.THIRD],
        year: Year.FRESHMAN,
      }),
    ];
    sortPassengers(testpassengers, passengerSort);
    setPassengerList(testpassengers);

    const testdrivers = [
      new Driver({
        name: "Driver 1",
        rides: [RideTimes.FRIDAY, RideTimes.FIRST],
        address: "ABC Street",
        college: "UCI",
        seats: 4,
        notes: "note",
      }),
      new Driver({
        name: "Driver 2",
        rides: [RideTimes.FRIDAY],
        address: "292 Tustin Field Dr",
        college: "UCI",
        seats: 3,
      }),
      new Driver({
        name: "Driver 3",
        rides: [RideTimes.THIRD],
        address: "1",
        college: "UCI",
        seats: 6,
        notes: "funne",
      }),
    ];
    sortDrivers(testdrivers, driverSort);
    setDriverList(testdrivers);
  };
  const clearTest = () => {
    setPassengerList([]);
    setDriverList([]);
  };

  const updateNewDriver = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    /* if (debug) console.log(name + " " + value) */
    setNewDriverData({ ...newDriverData, [name]: value });
  };
  const addNewPassenger = (newpassenger: Passenger) => {
    setPassengerList([...passengerList, newpassenger]);
  };
  const addNewDriver = (newdriver: Driver) => {
    setDriverList([...driverList, newdriver]);
  };

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

        <RideManager passengerList={passengerList} driverList={driverList} />

        {debug && (
          <div className="flex flex-col">
            <button onClick={loadTest}>Load Defaults</button>
            <button onClick={clearTest}>Clear</button>
          </div>
        )}

        <div className="flex flex-row w-full justify-evenly">
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
                defaultValue={driverSort}
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
