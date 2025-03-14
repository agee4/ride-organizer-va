import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Passenger, Year } from "../_classes/passenger";
import { CRUD, RideTimes } from "../_classes/person";

interface NewPassengerData {
  name: string;
  address: string;
  service?: RideTimes;
  friday?: RideTimes;
  notes?: string;
}

interface CreatePassengerFormProps {
  passengerCallback: (
    newpassenger: Passenger,
    operation: CRUD
  ) => void;
}

export const CreatePassengerForm = ({
  passengerCallback,
}: CreatePassengerFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [newPassengerData, setNewPassengerData] = useState<NewPassengerData>({
    name: "",
    address: "",
    notes: "",
  });
  const [rideSelect, setRideSelect] = useState<RideTimes>();

  const updateFormInput = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewPassengerData({ ...newPassengerData, [name]: value });
  };
  const updateFormSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
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
      passengerCallback(
        new Passenger({
          name: newPassengerData.name,
          rides: newPassengerRides,
          address: newPassengerData.address,
          college: "UCI",
          year: Year.OTHER,
          notes: newPassengerData.notes,
        }),
        CRUD.CREATE
      );
      setNewPassengerData({
        name: "",
        address: "",
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
        onChange={updateFormInput}
      />
      <input
        className="rounded-sm border"
        type="text"
        name="address"
        value={newPassengerData.address}
        placeholder="Address"
        required
        minLength={1}
        onChange={updateFormInput}
      />
      <div className="block">
        <select name="service" value={rideSelect} onChange={updateFormSelect}>
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
          onChange={updateFormInput}
        />
        <label htmlFor="friday">Friday</label>
      </div>
      <input
        className="rounded-sm border"
        type="text"
        name="notes"
        value={newPassengerData.notes}
        placeholder="Notes"
        onChange={updateFormInput}
      />
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};
