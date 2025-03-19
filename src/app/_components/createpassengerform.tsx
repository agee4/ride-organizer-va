import {
  ActionDispatch,
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
} from "react";
import { Passenger, PassengerReducerAction, Year } from "../_classes/passenger";
import { College, RideTimes } from "../_classes/person";

interface NewPassengerData {
  email: string;
  name: string;
  address: string;
  college: College;
  service?: RideTimes;
  friday?: RideTimes;
  phone?: string;
  notes?: string;
}

interface CreatePassengerFormProps {
  passengerCallback: ActionDispatch<[action: PassengerReducerAction]>;
}

export const CreatePassengerForm = ({
  passengerCallback,
}: CreatePassengerFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [newPassengerData, setNewPassengerData] = useState<NewPassengerData>({
    email: "",
    name: "",
    address: "",
    college: College.OTHER,
    phone: "",
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
    setNewPassengerData({ ...newPassengerData, [name]: value });
  };
  const createNewPassenger = (event: FormEvent) => {
    event.preventDefault();
    if (!newPassengerData.name || newPassengerData.name.localeCompare("") == 0)
      return;
    if (
      !newPassengerData.address ||
      newPassengerData.address.localeCompare("") == 0
    )
      return;
    else {
      const newPassengerRides = [];
      if (newPassengerData.friday)
        newPassengerRides.push(newPassengerData.friday);
      if (newPassengerData.service)
        newPassengerRides.push(newPassengerData.service);
      passengerCallback({
        type: "create",
        passenger: new Passenger({
          email: newPassengerData.email,
          name: newPassengerData.name,
          rides: newPassengerRides,
          address: newPassengerData.address,
          college: newPassengerData.college
            ? newPassengerData.college
            : College.OTHER,
          year: Year.OTHER,
          phone: newPassengerData.phone,
          notes: newPassengerData.notes,
        }),
      });
      setNewPassengerData({
        email: "",
        name: "",
        address: "",
        college: College.OTHER,
        phone: "",
        notes: "",
      });
      formRef.current?.reset();
      setRideSelect(undefined);
    }
  };
  return (
    <form
      className="my-1 p-2 flex flex-col rounded-md border border-cyan-500 bg-cyan-200 dark:bg-cyan-800"
      onSubmit={createNewPassenger}
      ref={formRef}
    >
      <label>Create new Passenger</label>
      <input
        className="rounded-sm border"
        type="text"
        name="name"
        value={newPassengerData.name}
        placeholder="Name"
        required
        minLength={1}
        onChange={updateForm}
      />
      <input
        className="rounded-sm border"
        type="text"
        name="email"
        value={newPassengerData.email}
        placeholder="Email"
        required
        minLength={1}
        onChange={updateForm}
      />
      <div className="block">
        <input
          className="rounded-sm border w-[142px]"
          type="text"
          name="address"
          value={newPassengerData.address}
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
        name="phone"
        value={newPassengerData.phone}
        placeholder="Phone #"
        onChange={updateForm}
      />
      <input
        className="rounded-sm border"
        type="text"
        name="notes"
        value={newPassengerData.notes}
        placeholder="Notes"
        onChange={updateForm}
      />
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};
