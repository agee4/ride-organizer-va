import {
  ActionDispatch,
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
} from "react";
import { College, RideTimes } from "../../_classes/person";
import {
  Driver,
  DriverReducerAction,
  NewDriverData,
} from "../../_classes/driver";

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
    phone: "",
    notes: "",
  });
  const [Friday, setFriday] = useState<boolean>(false);

  const updateForm = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
      | ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
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
    setNewDriverData({
      email: "",
      name: "",
      seats: 0,
      address: "",
      phone: "",
      notes: "",
    });
    formRef.current?.reset();
    setFriday(false);
  };
  return (
    <form
      className="my-1 flex flex-col rounded-md border border-orange-500 bg-orange-200 p-2 dark:bg-orange-800"
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
      <div className="whitespace-nowrap">
        <input
          className="rounded-sm border"
          type="text"
          name="address"
          value={newDriverData.address}
          placeholder="Address"
          required
          minLength={1}
          onChange={updateForm}
        />
        <select
          className="rounded-sm border"
          name="college"
          value={newDriverData.college}
          onChange={updateForm}
        >
          <option className="dark:text-black">-college-</option>
          {Object.values(College).map((option) => (
            <option className="dark:text-black" key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-row place-content-between whitespace-nowrap">
        <div>
          <select
            className="rounded-sm border"
            name="service"
            value={newDriverData.service}
            onChange={updateForm}
          >
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
        <label>
          Seats:
          <input
            className="rounded-sm border"
            type="number"
            name="seats"
            value={newDriverData.seats}
            min="1"
            placeholder="Seats"
            required
            size={2}
            onChange={updateForm}
          />
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
      <textarea
        className="rounded-sm border"
        name="notes"
        value={newDriverData.notes}
        placeholder="Notes"
        onChange={updateForm}
      />
      <br />
      <button className="rounded-full border" type="submit">
        Submit
      </button>
    </form>
  );
};
