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
  backupfirst?: RideTimes;
  backupsecond?: RideTimes;
  backupthird?: RideTimes;
  year: Year;
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
    year: Year.OTHER,
    phone: "",
    notes: "",
  });
  const [rideSelect, setRideSelect] = useState<RideTimes>();
  const [Friday, setFriday] = useState<boolean>(false);
  const [backupFirst, setBackupFirst] = useState<boolean>(false);
  const [backupSecond, setBackupSecond] = useState<boolean>(false);
  const [backupThird, setBackupThird] = useState<boolean>(false);

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
      if (Friday) newPassengerRides.push(RideTimes.FRIDAY);
      if (newPassengerData.service)
        newPassengerRides.push(newPassengerData.service);
      const newPassengerBackup = [];
      if (backupFirst) newPassengerBackup.push(RideTimes.FIRST);
      if (backupSecond) newPassengerBackup.push(RideTimes.SECOND);
      if (backupThird) newPassengerBackup.push(RideTimes.THIRD);
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
          year: newPassengerData.year ? newPassengerData.year : Year.OTHER,
          backup: newPassengerBackup,
          phone: newPassengerData.phone,
          notes: newPassengerData.notes,
        }),
      });
      setNewPassengerData({
        email: "",
        name: "",
        address: "",
        college: College.OTHER,
        year: Year.OTHER,
        phone: "",
        notes: "",
      });
      formRef.current?.reset();
      setRideSelect(undefined);
      setFriday(false);
      setBackupFirst(false);
      setBackupSecond(false);
      setBackupThird(false);
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
        <select
          name="college"
          value={newPassengerData.college}
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
            onChange={(e) => setFriday(e.target.checked)}
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
            onChange={(e) => setBackupFirst(e.target.checked)}
          />
          First
        </label>
        <label>
          <input
            type="checkbox"
            name="backupsecond"
            onChange={(e) => setBackupSecond(e.target.checked)}
          />
          Second
        </label>
        <label>
          <input
            type="checkbox"
            name="backupthird"
            onChange={(e) => setBackupThird(e.target.checked)}
          />
          Third
        </label>
      </div>
      <div className="block">
        <input
          className="rounded-sm border w-[142px]"
          type="text"
          name="phone"
          value={newPassengerData.phone}
          placeholder="Phone #"
          onChange={updateForm}
        />
        <select name="year" value={newPassengerData.year} onChange={updateForm}>
          <option className="dark:text-black">-year-</option>
          {Object.values(Year).map((option) => (
            <option className="dark:text-black" key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
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
