import {
  ActionDispatch,
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
} from "react";
import { College, RideTimes } from "../_classes/person";
import { Driver, DriverReducerAction } from "../_classes/driver";

interface NewDriverData {
  email: string;
  name: string;
  address: string;
  college: College.OTHER;
  seats: number;
  service?: RideTimes;
  friday?: RideTimes;
  phone?: string;
  notes?: string;
}

interface CreateDriverFormProps {
  driverCallback: ActionDispatch<[action: DriverReducerAction]>;
}

export const CreateDriverForm = ({ driverCallback }: CreateDriverFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [newDriverData, setNewDriverData] = useState<NewDriverData>({
    email: "",
    name: "",
    seats: 0,
    address: "",
    college: College.OTHER,
    phone: "",
    notes: "",
  });
  const [rideSelect, setRideSelect] = useState<RideTimes>();
  const [Friday, setFriday] = useState<boolean>(false);

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
    if (Friday) newDriverRides.push(RideTimes.FRIDAY);
    if (newDriverData.service) newDriverRides.push(newDriverData.service);
    driverCallback({
      type: "create",
      driver: new Driver({
        email: newDriverData.email,
        name: newDriverData.name,
        rides: newDriverRides,
        seats: newDriverData.seats,
        address: newDriverData.address,
        college: newDriverData.college ? newDriverData.college : College.OTHER,
        phone: newDriverData.phone,
        notes: newDriverData.notes,
      }),
    });
    setNewDriverData({
      email: "",
      name: "",
      seats: 0,
      address: "",
      college: College.OTHER,
      phone: "",
      notes: "",
    });
    formRef.current?.reset();
    setRideSelect(undefined);
    setFriday(false);
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
      <input
        className="rounded-sm border"
        type="text"
        name="email"
        value={newDriverData.email}
        placeholder="Email"
        required
        minLength={1}
        onChange={updateForm}
      />
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
        <input
          className="rounded-sm border w-[142px]"
          type="text"
          name="address"
          value={newDriverData.address}
          placeholder="Address"
          required
          minLength={1}
          onChange={updateForm}
        />
        <select name="college" value={newDriverData.college} onChange={updateForm}>
          <option className="dark:text-black">-college-</option>
          {Object.values(College).map((option) => (
            <option className="dark:text-black" key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="block">
        <select name="service" value={rideSelect} onChange={updateForm}>
          <option className="dark:text-black">-main ride-</option>
          {Object.values(RideTimes)
            .filter((x) => x != RideTimes.FRIDAY)
            .map((option) => (
              <option className="dark:text-black" key={option} value={option}>
                {option}
              </option>
            ))}
        </select>
        <label>
          <input
            type="checkbox"
            name="friday"
            onChange={e => setFriday(e.target.checked)}
          />
          Friday
        </label>
      </div>
      <input
        className="rounded-sm border"
        type="text"
        name="phone"
        value={newDriverData.phone}
        placeholder="Phone #"
        onChange={updateForm}
      />
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
