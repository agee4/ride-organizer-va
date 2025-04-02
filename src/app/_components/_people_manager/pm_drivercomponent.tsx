// pm_drivercomponent.tsx

import { ActionDispatch, ChangeEvent, useState } from "react";
import { College, CollegeTag, RideTimes } from "@/app/_classes/person";
import {
  Driver,
  DriverDisplay,
  DriverReducerAction,
  NewDriverData,
} from "@/app/_classes/driver";

export const PM_DriverComponent = ({
  data,
  display,
  driverCallback,
}: {
  data: Driver;
  display?: DriverDisplay[];
  driverCallback: ActionDispatch<[action: DriverReducerAction]>;
}) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newDriverData, setNewDriverData] = useState<NewDriverData>({
    email: data.getEmail(),
    name: data.getName(),
    seats: data.getSeats(),
    address: data.getAddress(),
    college: data.getCollege(),
    service: data
      .getRides()
      .filter((x) => x != RideTimes.FRIDAY)
      .at(0),
    friday: data.getRides().includes(RideTimes.FRIDAY),
    phone: data.getPhone(),
    notes: data.getNotes(),
  });
  const [Friday, setFriday] = useState<boolean>(
    data.getRides().includes(RideTimes.FRIDAY)
  );

  const deleteDriver = () => {
    driverCallback({
      type: "delete",
      driver: data,
    });
  };
  const updateData = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
      | ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setNewDriverData({ ...newDriverData, [name]: value });
  };
  const updateDriver = () => {
    const newDriverRides = [];
    if (newDriverData.friday) newDriverRides.push(RideTimes.FRIDAY);
    if (
      newDriverData.service &&
      Object.values(RideTimes).includes(newDriverData.service as RideTimes)
    )
      newDriverRides.push(newDriverData.service);
    driverCallback({
      type: "create",
      driver: new Driver({
        email: newDriverData.email,
        name: newDriverData.name,
        rides: newDriverRides,
        seats: newDriverData.seats,
        address: newDriverData.address,
        college:
          newDriverData.college &&
          Object.values(College).includes(newDriverData.college as College)
            ? newDriverData.college
            : College.OTHER,
        phone: newDriverData.phone,
        notes: newDriverData.notes,
      }),
    });
    setFriday(newDriverData.friday || false);
    setNewDriverData({
      email: data.getEmail(),
      name: data.getName(),
      seats: data.getSeats(),
      address: data.getAddress(),
      college: data.getCollege(),
      service: newDriverData.service,
      friday: newDriverData.friday,
      phone: data.getPhone(),
      notes: data.getNotes(),
    });
    setEditMode(false);
  };
  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setNewDriverData({
        email: data.getEmail(),
        name: data.getName(),
        seats: data.getSeats(),
        address: data.getAddress(),
        college: data.getCollege(),
        service: data
          .getRides()
          .filter((x) => x != RideTimes.FRIDAY)
          .at(0),
        friday: data.getRides().includes(RideTimes.FRIDAY),
        phone: data.getPhone(),
        notes: data.getNotes(),
      });
      setFriday(data.getRides().includes(RideTimes.FRIDAY));
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
                <textarea
                  className="mt-1 rounded-md bg-orange-400 p-1 dark:bg-orange-600"
                  defaultValue={data.getNotes()}
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
              value={newDriverData.name}
              placeholder="Name"
              required
              minLength={1}
              onChange={updateData}
            />
            <button className="m-1 text-lg font-bold" onClick={toggleEditMode}>
              &hellip;
            </button>
          </div>
          <input
            className="rounded-sm border"
            type="number"
            name="seats"
            value={newDriverData.seats}
            min="1"
            placeholder="Seats"
            required
            onChange={updateData}
          />
          <div className="block">
            <select
              className="rounded-sm border"
              name="college"
              value={newDriverData.college}
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
              defaultValue={newDriverData.address}
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
              defaultValue={newDriverData.service}
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
                  setNewDriverData({
                    ...newDriverData,
                    [e.target.name]: e.target.checked,
                  });
                }}
              />
              Friday
            </label>
          </div>
          <textarea
            className="rounded-sm border"
            name="notes"
            value={newDriverData.notes}
            placeholder="Notes"
            onChange={updateData}
          />
          <div className="flex flex-row place-content-evenly">
            <button
              className="m-1 rounded-full border px-2 text-lg font-bold"
              onClick={deleteDriver}
            >
              &times; DELETE
            </button>
            <button
              className="m-1 rounded-full border px-2 text-lg font-bold"
              onClick={updateDriver}
            >
              SAVE
            </button>
          </div>
        </>
      )}
    </div>
  );
};
