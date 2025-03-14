// people_manager.tsx

import { ChangeEvent, useEffect, useState } from "react";
import { College, CollegeTag, CRUD } from "../_classes/person";
import {
  Driver,
  DriverDisplay,
  DriverSort,
  sortDrivers,
} from "../_classes/driver";
import {
  Passenger,
  PassengerDisplay,
  PassengerSort,
  sortPassengers,
} from "../_classes/passenger";
import { CreatePassengerForm } from "./createpassengerform";
import { CreateDriverForm } from "./createdriverform";

interface PM_PassengerProps {
  data: Passenger;
  display?: PassengerDisplay[];
  passengerCallback: (data: Passenger, operation: CRUD) => void;
}

const PM_PassengerComponent = ({
  data,
  display,
  passengerCallback,
}: PM_PassengerProps) => {
  const deletePassenger = () => {
    passengerCallback(data, CRUD.DELETE);
  };

  return (
    <div className="p-2 my-1 rounded-md bg-cyan-200 dark:bg-cyan-800 max-w-[248px]">
      <div className="flex flex-row place-content-between">
        {(!display || display.includes(PassengerDisplay.NAME)) && (
          <h3 className="m-1 font-bold text-lg">{data.name}</h3>
        )}
        <button className="m-1 font-bold text-lg" onClick={deletePassenger}>
          &times;
        </button>
      </div>
      <ul className="m-1">
        {(!display ||
          display.includes(PassengerDisplay.ADDRESS) ||
          display.includes(PassengerDisplay.COLLEGE)) && (
          <li>
            {(!display || display.includes(PassengerDisplay.COLLEGE)) && (
              <CollegeTag data={data.college as College} />
            )}
            {(!display || display.includes(PassengerDisplay.ADDRESS)) && (
              <span>{data.address}</span>
            )}
          </li>
        )}
        {(!display || display.includes(PassengerDisplay.YEAR)) && (
          <li>Year: {data.year}</li>
        )}
        <ul className="flex flex-row flex-wrap">
          {data.rides.map((item, index) => (
            <li
              className="rounded-md bg-neutral-200 p-1 mr-1 dark:bg-neutral-800"
              key={index}
            >
              {item}
            </li>
          ))}
          {data.backup &&
            data.backup.map((item, index) => (
              <li
                className="rounded-md bg-neutral-400 p-1 mr-1 dark:bg-neutral-600"
                key={index}
              >
                {item}
              </li>
            ))}
        </ul>
        {(!display || display.includes(PassengerDisplay.NOTES)) &&
          data.notes && (
            <ul className="mt-1">
              <li>
                <span className="p-1 rounded-md bg-cyan-400 dark:bg-cyan-600">
                  {data.notes}
                </span>
              </li>
            </ul>
          )}
      </ul>
    </div>
  );
};

interface PM_DriverProps {
  data: Driver;
  display?: DriverDisplay[];
  driverCallback: (data: Driver, operation: CRUD) => void;
}

const PM_DriverComponent = ({
  data,
  display,
  driverCallback,
}: PM_DriverProps) => {
  const deleteDriver = () => {
    driverCallback(data, CRUD.DELETE);
  };

  return (
    <div className="p-2 my-1 rounded-md bg-orange-300 dark:bg-orange-700 max-w-[248px]">
      <div className="flex flex-row place-content-between">
        {(!display || display.includes(DriverDisplay.NAME)) && (
          <h3 className="m-1 font-bold text-lg">{data.name}</h3>
        )}
        <button className="m-1 font-bold text-lg" onClick={deleteDriver}>
          &times;
        </button>
      </div>
      <ul className="m-1">
        {(!display ||
          display.includes(DriverDisplay.ADDRESS) ||
          display.includes(DriverDisplay.COLLEGE)) && (
          <li>
            {(!display || display.includes(DriverDisplay.COLLEGE)) && (
              <CollegeTag data={data.college as College} />
            )}
            {(!display || display.includes(DriverDisplay.ADDRESS)) && (
              <span>{data.address}</span>
            )}
          </li>
        )}
        {(!display || display.includes(DriverDisplay.SEATS)) && (
          <li>Seats: {data.seats}</li>
        )}
        <ul className="flex flex-row flex-wrap">
          {data.rides.map((item, index) => (
            <li
              className="rounded-md bg-neutral-200 p-1 mr-1 dark:bg-neutral-800"
              key={index}
            >
              {item}
            </li>
          ))}
        </ul>
        {(!display || display.includes(DriverDisplay.NOTES)) && data.notes && (
          <ul className="mt-1">
            <li>
              <span className="p-1 rounded-md bg-orange-400 :dark:bg-orange-600">
                {data.notes}
              </span>
            </li>
          </ul>
        )}
      </ul>
    </div>
  );
};

interface PeopleManagerProps {
  passengerList: Passenger[];
  driverList: Driver[];
  passengerCallback: (data: Passenger, operation: CRUD) => void;
  driverCallback: (data: Driver, operation: CRUD) => void;
}

export const PeopleManager = ({
  passengerList,
  driverList,
  passengerCallback,
  driverCallback,
}: PeopleManagerProps) => {
  const [pmPassengerList, setPMPassengerList] =
    useState<Passenger[]>(passengerList);
  const [pmDriverList, setPMDriverList] = useState<Driver[]>(driverList);

  const [passengerSort, setPassengerSort] = useState<PassengerSort>(
    PassengerSort.NAME
  );
  const [driverSort, setDriverSort] = useState<DriverSort>(DriverSort.NAME);

  const updatePassengerSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setPassengerSort(event.target.value as PassengerSort);
    const sortedlist = [...pmPassengerList];
    sortPassengers(sortedlist, event.target.value as PassengerSort);
    setPMPassengerList(sortedlist);
  };
  const updateDriverSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setDriverSort(event.target.value as DriverSort);
    const sortedlist = [...pmDriverList];
    sortDrivers(sortedlist, event.target.value as DriverSort);
    setPMDriverList(sortedlist);
  };

  useEffect(() => {
    const newPassengerList = [...passengerList];
    sortPassengers(newPassengerList, passengerSort);
    setPMPassengerList(newPassengerList);
  }, [passengerList]);
  useEffect(() => {
    const newDriverList = [...driverList];
    sortDrivers(newDriverList, driverSort);
    setPMDriverList(newDriverList);
  }, [driverList]);

  return (
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
              <option className="dark:text-black" key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <ul className="max-h-[50dvh] overflow-auto">
          {pmPassengerList.map((item, index) => (
            <li key={index}>
              <PM_PassengerComponent
                data={item}
                passengerCallback={passengerCallback}
              />
            </li>
          ))}
        </ul>
        <CreatePassengerForm passengerCallback={passengerCallback} />
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
              <option className="dark:text-black" key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <ul className="max-h-[50dvh] overflow-auto">
          {pmDriverList.map((item, index) => (
            <li key={index}>
              <PM_DriverComponent data={item} driverCallback={driverCallback} />
            </li>
          ))}
        </ul>
        <CreateDriverForm driverCallback={driverCallback} />
      </div>
    </div>
  );
};
