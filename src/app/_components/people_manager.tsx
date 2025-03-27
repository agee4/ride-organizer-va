// people_manager.tsx

import { ActionDispatch, ChangeEvent, useEffect, useState } from "react";
import { College, CollegeTag } from "../_classes/person";
import {
  Driver,
  DriverDisplay,
  DriverReducerAction,
  DriverSort,
  sortDrivers,
} from "../_classes/driver";
import {
  Passenger,
  PassengerDisplay,
  PassengerReducerAction,
  PassengerSort,
  sortPassengers,
  YearTag,
} from "../_classes/passenger";
import { CreatePassengerForm } from "./createpassengerform";
import { CreateDriverForm } from "./createdriverform";

const PM_PassengerComponent = ({
  data,
  display,
  passengerCallback,
}: {
  data: Passenger;
  display?: PassengerDisplay[];
  passengerCallback: ActionDispatch<[action: PassengerReducerAction]>;
}) => {
  const deletePassenger = () => {
    passengerCallback({
      type: "delete",
      passenger: data,
    });
  };

  return (
    <div className="p-2 my-1 rounded-md bg-cyan-200 dark:bg-cyan-800 max-w-[496px]">
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
          <li>
            <YearTag data={data.year} />
          </li>
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

const PM_DriverComponent = ({
  data,
  display,
  driverCallback,
}: {
  data: Driver;
  display?: DriverDisplay[];
  driverCallback: ActionDispatch<[action: DriverReducerAction]>;
}) => {
  const deleteDriver = () => {
    driverCallback({
      type: "delete",
      driver: data,
    });
  };

  return (
    <div className="p-2 my-1 rounded-md bg-orange-300 dark:bg-orange-700 max-w-[496px]">
      <div className="flex flex-row place-content-between">
        {(!display || display.includes(DriverDisplay.NAME)) && (
          <h3 className="m-1 font-bold text-lg">{data.name}</h3>
        )}
        <button className="m-1 font-bold text-lg" onClick={deleteDriver}>
          &times;
        </button>
      </div>
      <ul className="m-1">
        {(!display || display.includes(DriverDisplay.SEATS)) && (
          <li>Seats: {data.seats}</li>
        )}
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

export const PeopleManager = ({
  passengerCollection,
  driverCollection,
  passengerCallback,
  driverCallback,
}: {
  passengerCollection: Map<string, Passenger>;
  driverCollection: Map<string, Driver>;
  passengerCallback: ActionDispatch<[action: PassengerReducerAction]>;
  driverCallback: ActionDispatch<[action: DriverReducerAction]>;
}) => {
  const [pmPassengerList, setPMPassengerList] = useState<Passenger[]>([]);
  const [pmDriverList, setPMDriverList] = useState<Driver[]>([]);

  const [passengerSort, setPassengerSort] = useState<PassengerSort>();
  const [passengerReverse, setPassengerReverse] = useState<boolean>(false);
  const [driverSort, setDriverSort] = useState<DriverSort>();
  const [driverReverse, setDriverReverse] = useState<boolean>(false);

  useEffect(() => {
    setPMPassengerList(
      passengerReverse
        ? sortPassengers(
            [...passengerCollection.values()],
            passengerSort
          ).reverse()
        : sortPassengers([...passengerCollection.values()], passengerSort)
    );
  }, [passengerCollection, passengerSort, passengerReverse]);
  useEffect(() => {
    setPMDriverList(
      driverReverse
        ? sortDrivers([...driverCollection.values()], driverSort).reverse()
        : sortDrivers([...driverCollection.values()], driverSort)
    );
  }, [driverCollection, driverSort, driverReverse]);

  const updatePassengerSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setPassengerSort(
      Object.values(PassengerSort).includes(event.target.value as PassengerSort)
        ? (event.target.value as PassengerSort)
        : undefined
    );
  };
  const togglePassengerReverse = () => {
    setPassengerReverse(!passengerReverse);
  };
  const updateDriverSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setDriverSort(
      Object.values(DriverSort).includes(event.target.value as DriverSort)
        ? (event.target.value as DriverSort)
        : undefined
    );
  };
  const toggleDriverReverse = () => {
    setDriverReverse(!driverReverse);
  };

  return (
    <div className="flex flex-row w-full justify-evenly">
      <div className="p-2 rounded-md border border-cyan-500 bg-cyan-50 dark:bg-cyan-950">
        <div className="flex flex-row place-content-between">
          <h2>Passengers</h2>
          <span className="px-1 rounded-full bg-cyan-500">
            {passengerCollection.size}
          </span>
        </div>
        <select
          className={
            "rounded-sm border " + (!passengerSort && "text-neutral-500")
          }
          value={passengerSort}
          onChange={updatePassengerSort}
        >
          <option className="dark:text-black" key={undefined} value={undefined}>
            -Sort-
          </option>
          {Object.values(PassengerSort).map((option) => (
            <option className="dark:text-black" key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          className="ml-1 font-bold text-neutral-500"
          onClick={togglePassengerReverse}
        >
          {passengerReverse ? <span>&uarr;</span> : <span>&darr;</span>}
        </button>
        <ul className="max-h-[50dvh] overflow-auto">
          {pmPassengerList.map((item) => (
            <li key={item.getEmail()}>
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
        <div className="flex flex-row place-content-between">
          <h2>Drivers</h2>
          <span className="px-1 rounded-full bg-orange-500">
            {driverCollection.size}
          </span>
        </div>
        <select
          className={"rounded-sm border " + (!driverSort && "text-neutral-500")}
          value={driverSort}
          onChange={updateDriverSort}
        >
          <option className="dark:text-black" key={undefined} value={undefined}>
            -Sort-
          </option>
          {Object.values(DriverSort).map((option) => (
            <option className="dark:text-black" key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          className="ml-1 font-bold text-neutral-500"
          onClick={toggleDriverReverse}
        >
          {driverReverse ? <span>&uarr;</span> : <span>&darr;</span>}
        </button>
        <ul className="max-h-[50dvh] overflow-auto">
          {pmDriverList.map((item) => (
            <li key={item.getEmail()}>
              <PM_DriverComponent data={item} driverCallback={driverCallback} />
            </li>
          ))}
        </ul>
        <CreateDriverForm driverCallback={driverCallback} />
      </div>
    </div>
  );
};
