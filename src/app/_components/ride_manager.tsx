// ride_manager.tsx

import {
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
import { Ride, RideSort, sortRides } from "../_classes/ride";

interface RM_PassengerProps {
  data: Passenger;
  ride: Ride;
  display?: PassengerDisplay[];
  ridePassengerCallback: (data: Map<string, Passenger>) => void;
}

const RM_PassengerComponent = ({
  data,
  ride,
  display,
  ridePassengerCallback,
}: RM_PassengerProps) => {
  const rmcontext = useContext(RideManagerContext);

  const removePassenger = () => {
    if (rmcontext?.passengerList) {
      rmcontext.passengerCallback([...rmcontext.passengerList, data]);
      ride.passengers.delete(data.name);
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
        {(!display || display.includes(PassengerDisplay.ADDRESS)) && (
          <li>Addr: {data.address}</li>
        )}
        {(!display || display.includes(PassengerDisplay.COLLEGE)) && (
          <li>Coll: {data.college}</li>
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

interface RideProps {
  data: Ride;
}

const RM_RideComponent = ({ data }: RideProps) => {
  const rmcontext = useContext(RideManagerContext);
  const [passengers, setPassengers] = useState<Map<string, Passenger>>(
    data.passengers
  );

  const updatePassengers = (data2: Map<string, Passenger>) => {
    setPassengers(data2);
  };

  const addPassenger = () => {
    if (rmcontext?.passengerList) {
      const nextpassenger = [...rmcontext?.passengerList].shift();
      if (nextpassenger !== undefined) {
        data.addPassenger(nextpassenger);
        rmcontext.passengerCallback(
          rmcontext.passengerList.filter((element) => element !== nextpassenger)
        );
        setPassengers(data.passengers);
      }
    }
    console.log(data.passengers);
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
        {data.driver.display([DriverDisplay.ADDRESS, DriverDisplay.COLLEGE, DriverDisplay.NOTES])}
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

interface RideManagerContextProps {
  passengerList: Passenger[];
  rideList: Ride[];
  passengerCallback: (data: Passenger[]) => void;
}

const RideManagerContext = createContext<RideManagerContextProps | null>(null);

interface RideManagerProps {
  passengerList: Passenger[];
  driverList: Driver[];
}

export const RideManager = ({
  passengerList,
  driverList,
}: RideManagerProps) => {
  const [ridePassengerList, setRidePassengerList] = useState<Passenger[]>([]);
  const [rideList, setRideList] = useState<Ride[]>([]);
  const [ridePassengerSort, setRidePassengerSort] = useState<PassengerSort>(
    PassengerSort.NAME
  );
  const [rideSort, setRideSort] = useState<RideSort>(RideSort.NAME);

  useEffect(() => {
    if (passengerList[0]) {
      const newRPList = [...ridePassengerList];
      let exists;
      for (let passenger of passengerList) {
        exists = false;
        for (let ride of ridePassengerList) {
          if (JSON.stringify(ride) == JSON.stringify(passenger)) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          for (let ride of rideList) {
            for (let ridepassenger of ride.passengers.values())
              if (JSON.stringify(ridepassenger) == JSON.stringify(passenger)) {
                exists = true;
                break;
              }
          }
        }
        if (!exists) {
          newRPList.push(passenger);
        }
      }
      sortPassengers(newRPList, ridePassengerSort);
      setRidePassengerList(newRPList);
    }
    if (driverList[0]) {
      const newRideList = [...rideList];
      let exists;
      for (let driver of driverList) {
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
    }
  }, [passengerList, driverList]);

  const refreshRides = () => {
    if (passengerList[0]) {
      const newRPList = [...ridePassengerList];
      let exists;
      for (let passenger of passengerList) {
        exists = false;
        for (let ride of ridePassengerList) {
          if (JSON.stringify(ride) == JSON.stringify(passenger)) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          for (let ride of rideList) {
            for (let ridepassenger of ride.passengers.values())
              if (JSON.stringify(ridepassenger) == JSON.stringify(passenger)) {
                exists = true;
                break;
              }
          }
        }
        if (!exists) {
          newRPList.push(passenger);
        }
      }
      sortPassengers(newRPList, ridePassengerSort);
      setRidePassengerList(newRPList);
    }
    if (driverList[0]) {
      const newRideList = [...rideList];
      let exists;
      for (let driver of driverList) {
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
    }
  };
  const clearRides = () => {
    setRidePassengerList([]);
    setRideList([]);
  };
  const updateRidePassengerSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setRidePassengerSort(event.target.value as PassengerSort);
    const sortedlist = [...ridePassengerList];
    sortPassengers(sortedlist, event.target.value as PassengerSort);
    setRidePassengerList(sortedlist);
  };
  const updateRideSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setRideSort(event.target.value as RideSort);
    const sortedlist = [...rideList];
    sortRides(sortedlist, event.target.value as RideSort);
    setRideList(sortedlist);
  };

  const passengerCallback = (data: Passenger[]) => {
    sortPassengers(data, ridePassengerSort);
    setRidePassengerList(data);
  };

  return (
    <RideManagerContext.Provider
      value={{
        passengerList: ridePassengerList,
        rideList: rideList,
        passengerCallback: passengerCallback,
      }}
    >
      <div className="flex flex-row w-full justify-evenly">
        <div className="p-2 rounded-md border border-neutral-500">
          <h2>Ride Manager</h2>
          <button className="m-1 p-1 rounded-sm border" onClick={refreshRides}>
            Refresh
          </button>
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
                {ridePassengerList.map((item, index) => (
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
