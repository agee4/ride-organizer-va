// pm_passengercomponent.tsx

import { ActionDispatch, ChangeEvent, useState } from "react";
import { College, CollegeTag, RideTimes } from "@/app/_classes/person";
import {
  NewPassengerData,
  Passenger,
  PassengerDisplay,
  PassengerReducerAction,
  Year,
  YearTag,
} from "@/app/_classes/passenger";

export const PM_PassengerComponent = ({
  data,
  display,
  passengerCallback,
}: {
  data: Passenger;
  display?: PassengerDisplay[];
  passengerCallback: ActionDispatch<[action: PassengerReducerAction]>;
}) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newPassengerData, setNewPassengerData] = useState<NewPassengerData>({
    email: data.getEmail(),
    name: data.getName(),
    address: data.getAddress(),
    college: data.getCollege(),
    service: data
      .getRides()
      .filter((x) => x != RideTimes.FRIDAY)
      .at(0),
    friday: data.getRides().includes(RideTimes.FRIDAY),
    backupfirst: data.getBackup().includes(RideTimes.FIRST),
    backupsecond: data.getBackup().includes(RideTimes.SECOND),
    backupthird: data.getBackup().includes(RideTimes.THIRD),
    year: data.getYear(),
    phone: data.getPhone(),
    notes: data.getNotes(),
  });
  const [Friday, setFriday] = useState<boolean>(
    data.getRides().includes(RideTimes.FRIDAY)
  );
  const [backupFirst, setBackupFirst] = useState<boolean>(
    data.getBackup().includes(RideTimes.FIRST)
  );
  const [backupSecond, setBackupSecond] = useState<boolean>(
    data.getBackup().includes(RideTimes.SECOND)
  );
  const [backupThird, setBackupThird] = useState<boolean>(
    data.getBackup().includes(RideTimes.THIRD)
  );

  const deletePassenger = () => {
    passengerCallback({
      type: "delete",
      passenger: data,
    });
  };
  const updateData = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
      | ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setNewPassengerData({ ...newPassengerData, [name]: value });
  };
  const updatePassenger = () => {
    const newPassengerRides = [];
    if (newPassengerData.friday) newPassengerRides.push(RideTimes.FRIDAY);
    if (
      newPassengerData.service &&
      Object.values(RideTimes).includes(newPassengerData.service as RideTimes)
    )
      newPassengerRides.push(newPassengerData.service);
    const newPassengerBackup = [];
    if (newPassengerData.backupfirst) newPassengerBackup.push(RideTimes.FIRST);
    if (newPassengerData.backupsecond)
      newPassengerBackup.push(RideTimes.SECOND);
    if (newPassengerData.backupthird) newPassengerBackup.push(RideTimes.THIRD);
    passengerCallback({
      type: "create",
      passenger: new Passenger({
        email: newPassengerData.email,
        name: newPassengerData.name,
        rides: newPassengerRides,
        address: newPassengerData.address,
        college:
          newPassengerData.college &&
          Object.values(College).includes(newPassengerData.college as College)
            ? newPassengerData.college
            : College.OTHER,
        year:
          newPassengerData.year &&
          Object.values(Year).includes(newPassengerData.year as Year)
            ? newPassengerData.year
            : Year.OTHER,
        backup: newPassengerBackup,
        phone: newPassengerData.phone,
        notes: newPassengerData.notes,
      }),
    });
    setFriday(newPassengerData.friday || false);
    setBackupFirst(newPassengerData.backupfirst || false);
    setBackupSecond(newPassengerData.backupsecond || false);
    setBackupThird(newPassengerData.backupthird || false);
    setNewPassengerData({
      email: data.getEmail(),
      name: data.getName(),
      address: data.getAddress(),
      college: data.getCollege(),
      service: newPassengerData.service,
      friday: newPassengerData.friday,
      backupfirst: newPassengerData.backupfirst,
      backupsecond: newPassengerData.backupsecond,
      backupthird: newPassengerData.backupthird,
      year: data.getYear(),
      phone: data.getPhone(),
      notes: data.getNotes(),
    });
    setEditMode(false);
  };
  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setNewPassengerData({
        email: data.getEmail(),
        name: data.getName(),
        address: data.getAddress(),
        college: data.getCollege(),
        service: data
          .getRides()
          .filter((x) => x != RideTimes.FRIDAY)
          .at(0),
        friday: data.getRides().includes(RideTimes.FRIDAY),
        backupfirst: data.getBackup().includes(RideTimes.FIRST),
        backupsecond: data.getBackup().includes(RideTimes.SECOND),
        backupthird: data.getBackup().includes(RideTimes.THIRD),
        year: data.getYear(),
        phone: data.getPhone(),
        notes: data.getNotes(),
      });
      setFriday(data.getRides().includes(RideTimes.FRIDAY));
      setBackupFirst(data.getBackup().includes(RideTimes.FIRST));
      setBackupSecond(data.getBackup().includes(RideTimes.SECOND));
      setBackupThird(data.getBackup().includes(RideTimes.THIRD));
    }
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
                <textarea
                  className="mt-1 w-full rounded-md bg-cyan-400 p-1 dark:bg-cyan-600"
                  defaultValue={data.getNotes()}
                  readOnly
                />
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
              value={newPassengerData.name}
              placeholder="Name"
              required
              minLength={1}
              onChange={updateData}
            />
            <button className="m-1 text-lg font-bold" onClick={toggleEditMode}>
              &hellip;
            </button>
          </div>
          <div className="block">
            <select
              className="rounded-sm border"
              name="college"
              value={newPassengerData.college}
              onChange={updateData}
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
              defaultValue={newPassengerData.address}
              placeholder="Address"
              required
              minLength={1}
              onChange={updateData}
            />
          </div>
          <div className="block">
            <select
              className="rounded-sm border"
              name="service"
              defaultValue={newPassengerData.service}
              onChange={updateData}
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
                checked={Friday}
                onChange={(e) => {
                  setFriday(e.target.checked);
                  setNewPassengerData({
                    ...newPassengerData,
                    [e.target.name]: e.target.checked,
                  });
                }}
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
                checked={backupFirst}
                onChange={(e) => {
                  setBackupFirst(e.target.checked);
                  setNewPassengerData({
                    ...newPassengerData,
                    [e.target.name]: e.target.checked,
                  });
                }}
              />
              First
            </label>
            <label>
              <input
                type="checkbox"
                name="backupsecond"
                checked={backupSecond}
                onChange={(e) => {
                  setBackupSecond(e.target.checked);
                  setNewPassengerData({
                    ...newPassengerData,
                    [e.target.name]: e.target.checked,
                  });
                }}
              />
              Second
            </label>
            <label>
              <input
                type="checkbox"
                name="backupthird"
                checked={backupThird}
                onChange={(e) => {
                  setBackupThird(e.target.checked);
                  setNewPassengerData({
                    ...newPassengerData,
                    [e.target.name]: e.target.checked,
                  });
                }}
              />
              Third
            </label>
          </div>
          <select
            className="rounded-sm border"
            name="year"
            defaultValue={newPassengerData.year}
            onChange={updateData}
          >
            <option className="dark:text-black">-year-</option>
            {Object.values(Year).map((option) => (
              <option className="dark:text-black" key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div>
            <textarea
              className="rounded-sm border"
              name="notes"
              value={newPassengerData.notes}
              placeholder="Notes"
              onChange={updateData}
            />
          </div>
          <div className="flex flex-row place-content-evenly">
            <button
              className="m-1 rounded-full border px-2 text-lg font-bold"
              onClick={deletePassenger}
            >
              &times; DELETE
            </button>
            <button
              className="m-1 rounded-full border px-2 text-lg font-bold"
              onClick={updatePassenger}
            >
              SAVE
            </button>
          </div>
        </>
      )}
    </div>
  );
};
