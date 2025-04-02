import {
  ActionDispatch,
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
} from "react";
import {
  NewPassengerData,
  Passenger,
  PassengerReducerAction,
  Year,
} from "../../_classes/passenger";
import { College, RideTimes } from "../../_classes/person";

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
    phone: "",
    notes: "",
  });
  const [Friday, setFriday] = useState<boolean>(false);
  const [backupFirst, setBackupFirst] = useState<boolean>(false);
  const [backupSecond, setBackupSecond] = useState<boolean>(false);
  const [backupThird, setBackupThird] = useState<boolean>(false);

  const updateForm = (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
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
    setNewPassengerData({
      email: "",
      name: "",
      address: "",
      phone: "",
      notes: "",
    });
    formRef.current?.reset();
    setFriday(false);
    setBackupFirst(false);
    setBackupSecond(false);
    setBackupThird(false);
  };
  return (
    <form
      className="my-1 flex flex-col rounded-md border border-cyan-500 bg-cyan-200 p-2 dark:bg-cyan-800"
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
          className="w-[142px] rounded-sm border"
          type="text"
          name="address"
          value={newPassengerData.address}
          placeholder="Address"
          required
          minLength={1}
          onChange={updateForm}
        />
        <select
          className="rounded-sm border"
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
        <select
          className="rounded-sm border"
          name="service"
          value={newPassengerData.service}
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
      <div className="block">
        <input
          className="w-[142px] rounded-sm border"
          type="text"
          name="phone"
          value={newPassengerData.phone}
          placeholder="Phone #"
          onChange={updateForm}
        />
        <select
          className="rounded-sm border"
          name="year"
          value={newPassengerData.year}
          onChange={updateForm}
        >
          <option className="dark:text-black">-year-</option>
          {Object.values(Year).map((option) => (
            <option className="dark:text-black" key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="rounded-sm border"
        name="notes"
        value={newPassengerData.notes}
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
