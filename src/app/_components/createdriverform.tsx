import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { College, CRUD, RideTimes } from "../_classes/person";
import { Driver } from "../_classes/driver";

interface NewDriverData {
  name: string;
  address: string;
  college: College.OTHER;
  seats: number;
  service?: RideTimes;
  friday?: RideTimes;
  notes?: string;
}

interface CreateDriverFormProps {
  driverCallback: (newdriver: Driver, operation: CRUD) => void;
}

export const CreateDriverForm = ({ driverCallback }: CreateDriverFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [newDriverData, setNewDriverData] = useState<NewDriverData>({
    name: "",
    address: "",
    college: College.OTHER,
    seats: 0,
    notes: "",
  });
  const [rideSelect, setRideSelect] = useState<RideTimes>();
  const [collegeSelect, setCollegeSelect] = useState<College>();

  const updateForm = (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (typeof event.target == typeof HTMLSelectElement)
      setRideSelect(value as RideTimes);
    setNewDriverData({ ...newDriverData, [name]: value });
  };
  const createNewDriver = (event: FormEvent) => {
    event.preventDefault();
    if (!newDriverData.name || newDriverData.name.localeCompare("") == 0)
      return;
    if (!newDriverData.address || newDriverData.address.localeCompare("") == 0)
      return;
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
        college: newDriverData.college ? newDriverData.college : College.OTHER,
        notes: newDriverData.notes,
      }),
      CRUD.CREATE
    );
    setNewDriverData({
      name: "",
      address: "",
      college: College.OTHER,
      seats: 0,
      notes: "",
    });
    formRef.current?.reset();
    setRideSelect(undefined);
  };
  return (
    <form
      className="my-1 p-2 flex flex-col rounded-md border border-orange-500 bg-orange-200 dark:bg-orange-800"
      onSubmit={createNewDriver}
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
        onChange={updateForm}
      />
      <div className="block">
        <input
          className="rounded-sm border w-[143px]"
          type="text"
          name="address"
          value={newDriverData.address}
          placeholder="Address"
          required
          minLength={1}
          onChange={updateForm}
        />
        <select name="college" value={collegeSelect} onChange={updateForm}>
          <option className="dark:text-black">--</option>
          <option className="dark:text-black" value={College.UCI}>
            UCI
          </option>
          <option className="dark:text-black" value={College.CSULB}>
            CSULB
          </option>
          <option className="dark:text-black" value={College.BIOLA}>
            Biola
          </option>
          <option className="dark:text-black" value={College.CHAPMAN}>
            Chapman
          </option>
          <option className="dark:text-black" value={College.OTHER}>
            Other
          </option>
        </select>
      </div>
      <input
        className="rounded-sm border"
        type="number"
        name="seats"
        value={newDriverData.seats}
        min="1"
        placeholder="Seats"
        required
        onChange={updateForm}
      />
      <div className="block">
        <select name="service" value={rideSelect} onChange={updateForm}>
          <option className="dark:text-black">--choose a ride--</option>
          <option className="dark:text-black" value={RideTimes.FIRST}>
            First
          </option>
          <option className="dark:text-black" value={RideTimes.SECOND}>
            Second
          </option>
          <option className="dark:text-black" value={RideTimes.THIRD}>
            Third
          </option>
        </select>
        <label>
          <input
            type="checkbox"
            name="friday"
            value={RideTimes.FRIDAY}
            onChange={updateForm}
          />
          Friday
        </label>
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
      <button type="submit">Submit</button>
    </form>
  );
};
