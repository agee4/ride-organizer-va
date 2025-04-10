// people_manager.tsx

import { ActionDispatch, ChangeEvent, useEffect, useState } from "react";
import {
  Driver,
  DriverReducerAction,
  DriverSort,
  sortDrivers,
} from "../../_classes/driver";
import {
  Passenger,
  PassengerReducerAction,
  PassengerSort,
  sortPassengers,
} from "../../_classes/passenger";
import { CreatePassengerForm } from "./createpassenger_form";
import { CreateDriverForm } from "./createdriver_form";
import { PM_PassengerComponent } from "./pm_passengercomponent";
import { PM_DriverComponent } from "./pm_drivercomponent";

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
  const updatePassengerSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setPassengerSort(
      Object.values(PassengerSort).includes(event.target.value as PassengerSort)
        ? (event.target.value as PassengerSort)
        : undefined
    );
  };
  const [passengerReverse, setPassengerReverse] = useState<boolean>(false);
  const togglePassengerReverse = () => {
    setPassengerReverse(!passengerReverse);
  };
  const [driverSort, setDriverSort] = useState<DriverSort>();
  const updateDriverSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setDriverSort(
      Object.values(DriverSort).includes(event.target.value as DriverSort)
        ? (event.target.value as DriverSort)
        : undefined
    );
  };
  const [driverReverse, setDriverReverse] = useState<boolean>(false);
  const toggleDriverReverse = () => {
    setDriverReverse(!driverReverse);
  };

  const [mobileShowDriver, setMobileShowDriver] = useState<boolean>(false);
  const toggleMobileShowDriver = () => {
    setMobileShowDriver(!mobileShowDriver);
  };

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

  return (
    <div className="rounded-md border border-neutral-500 p-2">
      <h2>People Manager</h2>
      <div className="flex w-full flex-col justify-evenly sm:flex-row">
        <button
          className={
            "rounded-full border px-2 sm:hidden " +
            (mobileShowDriver ? "bg-cyan-500" : "bg-orange-500")
          }
          onClick={toggleMobileShowDriver}
        >
          Show {mobileShowDriver ? "Passengers" : "Drivers"}
        </button>
        <div
          className={
            "rounded-md border border-cyan-500 bg-cyan-50 p-2 sm:block dark:bg-cyan-950 " +
            (mobileShowDriver && "hidden")
          }
        >
          <h2>Passengers</h2>
          <div className="flex flex-row place-content-between">
            <span className="rounded-full bg-cyan-500 px-1">
              {passengerCollection.size}
            </span>
            <div className="flex flex-row">
              <select
                className={
                  "rounded-sm border " + (!passengerSort && "text-neutral-500")
                }
                value={passengerSort}
                onChange={updatePassengerSort}
              >
                <option
                  className="dark:text-black"
                  key={undefined}
                  value={undefined}
                >
                  -Sort-
                </option>
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
              <button
                className="ml-1 font-bold text-neutral-500"
                onClick={togglePassengerReverse}
              >
                {passengerReverse ? <span>&uarr;</span> : <span>&darr;</span>}
              </button>
            </div>
          </div>
          <ul className="max-h-[50svh] overflow-auto">
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

        <div
          className={
            "rounded-md border border-orange-500 bg-orange-50 p-2 sm:block dark:bg-orange-950 " +
            (!mobileShowDriver && "hidden")
          }
        >
          <h2>Drivers</h2>
          <div className="flex flex-row place-content-between">
            <span className="rounded-full bg-orange-500 px-1">
              {driverCollection.size}
            </span>
            <div className="flex flex-row">
              <select
                className={
                  "rounded-sm border " + (!driverSort && "text-neutral-500")
                }
                value={driverSort}
                onChange={updateDriverSort}
              >
                <option
                  className="dark:text-black"
                  key={undefined}
                  value={undefined}
                >
                  -Sort-
                </option>
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
              <button
                className="ml-1 font-bold text-neutral-500"
                onClick={toggleDriverReverse}
              >
                {driverReverse ? <span>&uarr;</span> : <span>&darr;</span>}
              </button>
            </div>
          </div>
          <ul className="max-h-[50svh] overflow-auto">
            {pmDriverList.map((item) => (
              <li key={item.getEmail()}>
                <PM_DriverComponent
                  data={item}
                  driverCallback={driverCallback}
                />
              </li>
            ))}
          </ul>
          <CreateDriverForm driverCallback={driverCallback} />
        </div>
      </div>
    </div>
  );
};
