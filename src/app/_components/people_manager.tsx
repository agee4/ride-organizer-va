// people_manager.tsx

import { ActionDispatch, ChangeEvent, useEffect, useState } from "react";
import { College, CollegeTag, RideTimes } from "../_classes/person";
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
  Year,
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
  const [editMode, setEditMode] = useState<boolean>(false);
  const deletePassenger = () => {
    passengerCallback({
      type: "delete",
      passenger: data,
    });
  };
  const updatePassenger = () => {
    passengerCallback({
      type: "create",
      passenger: data,
    });
  };
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <div className="my-1 max-w-[496px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
      {!editMode ? (
        <>
          <div className="flex flex-row place-content-between">
            {(!display || display.includes(PassengerDisplay.NAME)) && (
              <h3 className="m-1 text-lg font-bold">{data.getName()}</h3>
            )}
            <button className="m-1 text-lg font-bold" onClick={toggleEditMode}>
              &hellip;
            </button>
          </div>
          <ul className="m-1">
            {(!display ||
              display.includes(PassengerDisplay.ADDRESS) ||
              display.includes(PassengerDisplay.COLLEGE)) && (
              <li>
                {(!display || display.includes(PassengerDisplay.COLLEGE)) && (
                  <CollegeTag data={data.getCollege()} />
                )}
                {(!display || display.includes(PassengerDisplay.ADDRESS)) && (
                  <span>{data.getAddress()}</span>
                )}
              </li>
            )}
            <ul className="flex flex-row flex-wrap">
              {data.getRides().map((item, index) => (
                <li
                  className="mr-1 rounded-md bg-neutral-200 p-1 dark:bg-neutral-800"
                  key={index}
                >
                  {item}
                </li>
              ))}
              {data.getBackup() &&
                data.getBackup().map((item, index) => (
                  <li
                    className="mr-1 rounded-md bg-neutral-400 p-1 dark:bg-neutral-600"
                    key={index}
                  >
                    {item}
                  </li>
                ))}
            </ul>
            {(!display || display.includes(PassengerDisplay.YEAR)) && (
              <li>
                <YearTag data={data.getYear()} />
              </li>
            )}
            {(!display || display.includes(PassengerDisplay.NOTES)) &&
              data.getNotes() && (
                <ul className="mt-1">
                  <li>
                    <span className="rounded-md bg-cyan-400 p-1 dark:bg-cyan-600">
                      {data.getNotes()}
                    </span>
                  </li>
                </ul>
              )}
          </ul>
        </>
      ) : (
        <>
          <div className="flex flex-row place-content-between">
            <input
              className="rounded-sm border"
              type="text"
              name="name"
              defaultValue={data.getName()}
              placeholder="Name"
              required
              minLength={1}
              /* onChange={updatePassenger} */
            />
            <div>
              <button
                className="m-1 text-lg font-bold"
                onClick={deletePassenger}
              >
                &times;
              </button>
              <button
                className="m-1 text-lg font-bold"
                onClick={toggleEditMode}
              >
                &hellip;
              </button>
            </div>
          </div>
          <div className="block">
            <select
              className="rounded-sm border"
              name="college"
              defaultValue={data.getCollege()}
              /* onChange={updateForm} */
            >
              <option className="dark:text-black">-college-</option>
              {Object.values(College).map((option) => (
                <option className="dark:text-black" key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              className="w-[142px] rounded-sm border"
              type="text"
              name="address"
              defaultValue={data.getAddress()}
              placeholder="Address"
              required
              minLength={1}
              /* onChange={updateForm} */
            />
          </div>
          <div className="block">
            <select
              className="rounded-sm border"
              name="service"
              defaultValue={"rideSelect"}
              /* onChange={updateForm} */
            >
              <option className="dark:text-black">-main ride-</option>
              {Object.values(RideTimes)
                .filter((x) => x != RideTimes.FRIDAY)
                .map((option) => (
                  <option
                    className="dark:text-black"
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
            </select>
            <label>
              <input
                type="checkbox"
                name="friday"
                /* onChange={(e) => setFriday(e.target.checked)} */
              />
              Friday
            </label>
          </div>
          <div className="block">
            <label>Backup:</label>
            <label>
              <input
                type="checkbox"
                name="backupfirst"
                /* checked={backupFirst}
            onChange={(e) => {
              setBackupFirst(e.target.checked);
              setNewPassengerData({
                ...newPassengerData,
                [e.target.name]: e.target.checked,
              });
            }} */
              />
              First
            </label>
            <label>
              <input
                type="checkbox"
                name="backupsecond"
                /* checked={backupSecond}
            onChange={(e) => {setBackupSecond(e.target.checked);
              setNewPassengerData({
                ...newPassengerData,
                [e.target.name]: e.target.checked,
              });
            }} */
              />
              Second
            </label>
            <label>
              <input
                type="checkbox"
                name="backupthird"
                /* checked={backupThird}
            onChange={(e) => {
              setBackupThird(e.target.checked);
              setNewPassengerData({
                ...newPassengerData,
                [e.target.name]: e.target.checked,
              });
            }} */
              />
              Third
            </label>
          </div>
          <select
            className="rounded-sm border"
            name="year"
            defaultValue={data.getYear()}
            /* onChange={updateForm} */
          >
            <option className="dark:text-black">-year-</option>
            {Object.values(Year).map((option) => (
              <option className="dark:text-black" key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            className="rounded-sm border"
            type="text"
            name="notes"
            defaultValue={data.getNotes()}
            placeholder="Notes"
            /* onChange={updateForm} */
          />
        </>
      )}
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
  const [editMode, setEditMode] = useState<boolean>(false);
  const [nametest, setnametest] = useState<string>(data.getName());
  const [seattest, setseattest] = useState<number>(data.getSeats());
  const deleteDriver = () => {
    driverCallback({
      type: "delete",
      driver: data,
    });
  };
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  const updateDriver = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case "name":
        setnametest(value);
        break;
      /* case "seats": setseattest(value); break; */
    }
  };

  return (
    <div className="my-1 max-w-[496px] rounded-md bg-orange-300 p-2 dark:bg-orange-700">
      {!editMode ? (
        <>
          <div className="flex flex-row place-content-between">
            {(!display || display.includes(DriverDisplay.NAME)) && (
              <h3 className="m-1 text-lg font-bold">{data.getName()}</h3>
            )}
            <button className="m-1 text-lg font-bold" onClick={toggleEditMode}>
              &hellip;
            </button>
          </div>
          <ul className="m-1">
            {(!display || display.includes(DriverDisplay.SEATS)) && (
              <li>Seats: {data.getSeats()}</li>
            )}
            {(!display ||
              display.includes(DriverDisplay.ADDRESS) ||
              display.includes(DriverDisplay.COLLEGE)) && (
              <li>
                {(!display || display.includes(DriverDisplay.COLLEGE)) && (
                  <CollegeTag data={data.getCollege()} />
                )}
                {(!display || display.includes(DriverDisplay.ADDRESS)) && (
                  <span>{data.getAddress()}</span>
                )}
              </li>
            )}
            <ul className="flex flex-row flex-wrap">
              {data.getRides().map((item, index) => (
                <li
                  className="mr-1 rounded-md bg-neutral-200 p-1 dark:bg-neutral-800"
                  key={index}
                >
                  {item}
                </li>
              ))}
            </ul>
            {(!display || display.includes(DriverDisplay.NOTES)) &&
              data.getNotes() && (
                <ul className="mt-1">
                  <li>
                    <span className=":dark:bg-orange-600 rounded-md bg-orange-400 p-1">
                      {data.getNotes()}
                    </span>
                  </li>
                </ul>
              )}
          </ul>
        </>
      ) : (
        <>
          <div className="flex flex-row place-content-between">
            <input
              className="rounded-sm border"
              type="text"
              name="name"
              value={nametest}
              placeholder="Name"
              required
              minLength={1}
              onChange={updateDriver}
            />
            <div>
              <button className="m-1 text-lg font-bold" onClick={deleteDriver}>
                &times;
              </button>
              <button
                className="m-1 text-lg font-bold"
                onClick={toggleEditMode}
              >
                &hellip;
              </button>
            </div>
          </div>
          <input
            className="rounded-sm border"
            type="number"
            name="seats"
            value={seattest}
            min="1"
            placeholder="Seats"
            required
            onChange={updateDriver}
          />
          <div className="block">
            <select
              className="rounded-sm border"
              name="college"
              defaultValue={data.getCollege()}
              /* onChange={updateForm} */
            >
              <option className="dark:text-black">-college-</option>
              {Object.values(College).map((option) => (
                <option className="dark:text-black" key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              className="w-[142px] rounded-sm border"
              type="text"
              name="address"
              defaultValue={data.getAddress()}
              placeholder="Address"
              required
              minLength={1}
              /* onChange={updateForm} */
            />
          </div>
          <div className="block">
            <select
              className="rounded-sm border"
              name="service"
              defaultValue={"rideSelect"}
              /* onChange={updateForm} */
            >
              <option className="dark:text-black">-main ride-</option>
              {Object.values(RideTimes)
                .filter((x) => x != RideTimes.FRIDAY)
                .map((option) => (
                  <option
                    className="dark:text-black"
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
            </select>
            <label>
              <input
                type="checkbox"
                name="friday"
                /* onChange={(e) => setFriday(e.target.checked)} */
              />
              Friday
            </label>
          </div>
          <input
            className="rounded-sm border"
            type="text"
            name="notes"
            defaultValue={data.getNotes()}
            placeholder="Notes"
            /* onChange={updateForm} */
          />
        </>
      )}
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
    <div className="flex w-full flex-row justify-evenly">
      <div className="rounded-md border border-cyan-500 bg-cyan-50 p-2 dark:bg-cyan-950">
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
          </div>
        </div>
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

      <div className="rounded-md border border-orange-500 bg-orange-50 p-2 dark:bg-orange-950">
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
          </div>
        </div>
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
