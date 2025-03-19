// ride_manager.tsx

import {
  ActionDispatch,
  ChangeEvent,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Driver, DriverDisplay } from "../_classes/driver";
import {
  Passenger,
  PassengerDisplay,
  PassengerSort,
  sortPassengers,
} from "../_classes/passenger";
import { Ride, RideReducerAction, RideSort, sortRides } from "../_classes/ride";
import { College, CollegeTag } from "../_classes/person";

const RM_PassengerComponent = ({
  data,
  ride,
  display,
  ridePassengerCallback,
}: {
  data: Passenger;
  ride: Ride;
  display?: PassengerDisplay[];
  ridePassengerCallback: (data: Map<string, Passenger>) => void;
}) => {
  const rmcontext = useContext(RideManagerContext);

  const removePassenger = () => {
    if (rmcontext?.passengerCollection) {
      rmcontext.passengerCallback(
        new Map([...rmcontext.passengerCollection.entries()]).set(
          data.getEmail(),
          data
        )
      );
      ride.passengers.delete(data.getEmail());
      ridePassengerCallback(ride.passengers);
    }
  };

  return (
    <div className="p-2 my-1 rounded-md bg-cyan-200 dark:bg-cyan-800 max-w-[248px]">
      <div className="flex flex-row place-content-between">
        {(!display || display.includes(PassengerDisplay.NAME)) && (
          <h3 className="m-1 font-bold text-lg">{data.name}</h3>
        )}
        <button className="m-1 font-bold text-lg" onClick={removePassenger}>
          &times;
        </button>
      </div>
      <ul className="m-1">
        {(!display ||
          display.includes(PassengerDisplay.ADDRESS) ||
          display.includes(PassengerDisplay.COLLEGE)) && (
          <li>
            {(!display || display.includes(PassengerDisplay.COLLEGE)) && (
              <CollegeTag data={data.college as College} />
            )}
            {(!display || display.includes(PassengerDisplay.ADDRESS)) && (
              <span>{data.address}</span>
            )}
          </li>
        )}
        {(!display || display.includes(PassengerDisplay.YEAR)) && (
          <li>Year: {data.year}</li>
        )}
        <ul className="flex flex-row flex-wrap">
          {data.rides.map((item, index) => (
            <li
              className="rounded-md bg-neutral-200 p-1 mr-1 dark:bg-neutral-800"
              key={index}
            >
              {item}
            </li>
          ))}
          {data.backup &&
            data.backup.map((item, index) => (
              <li
                className="rounded-md bg-neutral-400 p-1 mr-1 dark:bg-neutral-600"
                key={index}
              >
                {item}
              </li>
            ))}
        </ul>
        {(!display || display.includes(PassengerDisplay.NOTES)) &&
          data.notes && (
            <ul className="mt-1">
              <li>
                <span className="p-1 rounded-md bg-cyan-400 dark:bg-cyan-600">
                  {data.notes}
                </span>
              </li>
            </ul>
          )}
      </ul>
    </div>
  );
};

const RM_RideComponent = ({ data }: { data: Ride }) => {
  const rmcontext = useContext(RideManagerContext);
  const [passengers, setPassengers] = useState<Map<string, Passenger>>(
    data.passengers
  );

  const updatePassengers = (data: Map<string, Passenger>) => {
    setPassengers(data);
  };

  const addPassenger = () => {
    if (rmcontext?.passengerList) {
      const nextpassenger = [...rmcontext?.passengerList].shift();
      if (nextpassenger !== undefined) {
        data.addPassenger(nextpassenger);
        let newpassengercollection = new Map([
          ...rmcontext.passengerCollection.entries(),
        ]);
        newpassengercollection.delete(nextpassenger.getEmail());
        rmcontext.passengerCallback(newpassengercollection);
        setPassengers(data.passengers);
      }
    }
    /* console.log(data.passengers); */
  };

  const seatsleft = data.driver.seats - data.passengers.size;
  let valid = seatsleft >= 0;

  return (
    <div
      className={
        "p-2 my-1 rounded-md " + (valid ? "bg-neutral-500" : "bg-red-500")
      }
    >
      <h3 className="m-1 font-bold text-lg">{data.driver.name}</h3>
      <ul className="m-1">
        {data.driver.display([
          DriverDisplay.ADDRESS,
          DriverDisplay.COLLEGE,
          DriverDisplay.NOTES,
        ])}
        <ul className="m-1">
          <li className="text-center">Seats Left: {seatsleft}</li>
          {!valid && <li className="text-center">"TOO MANY PASSENGERS!"</li>}
          {Array.from(passengers).map(([key, value]) => (
            <li key={key}>
              <RM_PassengerComponent
                data={value}
                ridePassengerCallback={updatePassengers}
                ride={data}
                display={[
                  PassengerDisplay.NAME,
                  PassengerDisplay.ADDRESS,
                  PassengerDisplay.COLLEGE,
                  PassengerDisplay.NOTES,
                ]}
              />
            </li>
          ))}
          {Array.from({ length: seatsleft }, (_, index) => (
            <li key={index}>
              <button
                className="my-1 w-full rounded-md bg-white dark:bg-black"
                onClick={addPassenger}
              >
                +
              </button>
            </li>
          ))}
        </ul>
      </ul>
    </div>
  );
};

const RideManagerContext = createContext<{
  passengerCollection: Map<string, Passenger>;
  passengerList: Passenger[];
  rideList: Ride[];
  passengerCallback: (data: Map<string, Passenger>) => void;
} | null>(null);

export const RideManager = ({
  originPassengers,
  originDrivers,
  rideCallback,
}: {
  originPassengers: Map<string, Passenger>;
  originDrivers: Map<string, Driver>;
  rideCallback: ActionDispatch<[action: RideReducerAction]>;
}) => {
  const [ridePassengerCollection, setRidePassengerCollection] = useState<
    Map<string, Passenger>
  >(new Map<string, Passenger>());
  const [rpList, setRPList] = useState<Passenger[]>([]);
  const [rideList, setRideList] = useState<Ride[]>([]);
  const [ridePassengerSort, setRidePassengerSort] = useState<PassengerSort>(
    PassengerSort[""]
  );
  const [rideSort, setRideSort] = useState<RideSort>(RideSort[""]);

  useEffect(() => {
    let newRPList = new Map([...ridePassengerCollection.entries()]);
    let exists;
    /* remove passengers, even if assigned a ride */
    for (let passenger of ridePassengerCollection.values()) {
      if (!originPassengers.has(passenger.getEmail()))
        newRPList.delete(passenger.getEmail());
    }
    for (let ride of rideList) {
      for (let ridepassenger of ride.passengers.values()) {
        if (!originPassengers.has(ridepassenger.getEmail()))
          ride.passengers.delete(ridepassenger.getEmail());
      }
    }
    /* add new passengers */
    for (let passenger of originPassengers.values()) {
      if (!ridePassengerCollection.has(passenger.getEmail())) {
        exists = false;
        for (let ride of rideList) {
          for (let ridepassenger of ride.passengers.values())
            if (JSON.stringify(ridepassenger) == JSON.stringify(passenger)) {
              exists = true;
              break;
            }
        }
        if (!exists) {
          newRPList.set(passenger.getEmail(), passenger);
        }
      }
    }
    passengerCallback(newRPList);
  }, [originPassengers]);
  useEffect(() => {
    let exists;
    let newRideList = [...rideList];
    /* remove rides and move their passengers back into the unassigned list */
    for (let ride of rideList) {
      if (!originDrivers.has(ride.driver.getEmail())) {
        let newRPList = new Map([...ridePassengerCollection.entries()]);
        for (let passenger of ride.passengers.values()) {
          newRPList.set(passenger.getEmail(), passenger);
        }
        passengerCallback(newRPList);
        ride.passengers.clear();
        newRideList = newRideList.filter((x) => x !== ride);
      }
    }

    /* add new passengers */
    for (let driver of originDrivers.values()) {
      exists = false;
      for (let ride of rideList) {
        if (JSON.stringify(ride.driver) == JSON.stringify(driver)) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        newRideList.push(
          new Ride({
            driver: driver,
            passengers: new Map<string, Passenger>(),
          })
        );
      }
    }
    sortRides(newRideList, rideSort);
    setRideList(newRideList);
  }, [originDrivers]);

  /* const refreshRides = () => {
    let exists;
    const newRPList = [...ridePassengerList];
    for (let passenger of originPassengerList) {
      if (!ridePassengerList.includes(passenger)) {
        exists = false;
        for (let ride of rideList) {
          for (let ridepassenger of ride.passengers.values())
            if (JSON.stringify(ridepassenger) == JSON.stringify(passenger)) {
              exists = true;
              break;
            }
        }
        if (!exists) {
          newRPList.push(passenger);
        }
      }
      sortPassengers(newRPList, ridePassengerSort);
      setRidePassengerList(newRPList);
    }
    let newRideList = [...rideList];
    for (let ride of rideList) {
      if (!originDriverList.includes(ride.driver)) {
        const newRPList = [...ridePassengerList];
        for (let passenger of ride.passengers.values()) {
          newRPList.push(passenger);
          sortPassengers(newRPList, ridePassengerSort);
          setRidePassengerList(newRPList);
        }
        newRideList = newRideList.filter((x) => x !== ride);
      }
    }

    for (let driver of originDriverList) {
      exists = false;
      for (let ride of rideList) {
        if (JSON.stringify(ride.driver) == JSON.stringify(driver)) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        newRideList.push(
          new Ride({
            driver: driver,
            passengers: new Map<string, Passenger>(),
          })
        );
      }
    }
    sortRides(newRideList, rideSort);
    setRideList(newRideList);
  }; */
  const clearRides = () => {
    let newRPList = new Map([...ridePassengerCollection.entries()]);
    for (let ride of rideList) {
      for (let passenger of ride.getPassengerList().values()) {
        newRPList.set(passenger.getEmail(), passenger);
      }
      ride.passengers.clear();
    }
    passengerCallback(newRPList);
  };
  const updateRidePassengerSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setRidePassengerSort(event.target.value as PassengerSort);
    setRPList(
      sortPassengers(
        [...ridePassengerCollection.values()],
        event.target.value as PassengerSort
      )
    );
  };
  const updateRideSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setRideSort(event.target.value as RideSort);
    const sortedlist = [...rideList];
    sortRides(sortedlist, event.target.value as RideSort);
    setRideList(sortedlist);
  };

  const passengerCallback = (data: Map<string, Passenger>) => {
    setRidePassengerCollection(data);
    setRPList(sortPassengers([...data.values()], ridePassengerSort));
  };

  return (
    <RideManagerContext.Provider
      value={{
        passengerCollection: ridePassengerCollection,
        passengerList: rpList,
        rideList: rideList,
        passengerCallback: passengerCallback,
      }}
    >
      <div className="flex flex-row w-full justify-evenly">
        <div className="p-2 rounded-md border border-neutral-500">
          <h2>Ride Manager</h2>
          {/* <button className="m-1 p-1 rounded-sm border" onClick={refreshRides}>
            Refresh
          </button> */}
          <button className="m-1 p-1 rounded-sm border" onClick={clearRides}>
            Clear
          </button>
          <div className="flex flex-row">
            <div className="p-2 rounded-md border border-cyan-500 bg-cyan-50 dark:bg-cyan-950">
              <label>
                <span className="text-neutral-500">Sort by: </span>
                <select
                  className="rounded-sm border"
                  defaultValue={ridePassengerSort}
                  onChange={updateRidePassengerSort}
                >
                  {Object.values(PassengerSort).map((option) => (
                    <option
                      className="dark:text-black"
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <ul className="m-1 max-h-[70dvh] overflow-auto">
                {rpList.map((item, index) => (
                  <li key={index}>{item.display()}</li>
                ))}
              </ul>
            </div>
            <div className="p-2 rounded-md border border-orange-500 bg-orange-50 dark:bg-orange-950">
              <label>
                <span className="text-neutral-500">Sort by: </span>
                <select
                  className="rounded-sm border"
                  defaultValue={rideSort}
                  onChange={updateRideSort}
                >
                  {Object.values(RideSort).map((option) => (
                    <option
                      className="dark:text-black"
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <ul className="m-1 max-h-[70dvh] overflow-auto">
                {rideList.map((item, index) => (
                  <li key={index}>
                    <RM_RideComponent data={item} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </RideManagerContext.Provider>
  );
};
