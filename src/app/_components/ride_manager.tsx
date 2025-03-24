// ride_manager.tsx

import {
  ActionDispatch,
  ChangeEvent,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Driver, DriverDisplay } from "../_classes/driver";
import {
  filterPassengers,
  Passenger,
  PassengerDisplay,
  PassengerSort,
  sortPassengers,
  YearTag,
} from "../_classes/passenger";
import {
  filterRides,
  Ride,
  RideReducerAction,
  RideSort,
  sortRides,
} from "../_classes/ride";
import { College, CollegeTag, RideTimes } from "../_classes/person";
import {
  DndProvider,
  DropTargetMonitor,
  useDrag,
  useDragLayer,
  useDrop,
} from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TestType } from "../_classes/ItemTypes";

interface DragItem {
  email: string;
}

const RM_RPComponent = ({
  data,
  display,
}: {
  data: Passenger;
  display?: PassengerDisplay[];
}) => {
  const dragref = useRef<HTMLDivElement>(null);
  const dragpreviewref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag, dragPreview] = useDrag<
    DragItem,
    void,
    { isDragging: boolean }
  >(() => ({
    type: TestType.TEST,
    item: { email: data.getEmail() },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  drag(dragref);
  dragPreview(dragpreviewref);

  return isDragging ? (
    <div
      className="p-2 my-1 rounded-md bg-cyan-200 dark:bg-cyan-800 max-w-[248px]"
      ref={dragpreviewref}
    >
      {(!display || display.includes(PassengerDisplay.NAME)) && (
        <h3 className="m-1 font-bold text-lg">{data.name}</h3>
      )}
    </div>
  ) : (
    <div
      className="p-2 my-1 rounded-md bg-cyan-200 dark:bg-cyan-800 max-w-[496px]"
      ref={dragref}
    >
      {(!display || display.includes(PassengerDisplay.NAME)) && (
        <h3 className="m-1 font-bold text-lg">{data.name}</h3>
      )}
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
          <li>
            <YearTag data={data.year} />
          </li>
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

const CustomDragLayer = () => {
  const {} = useDragLayer((monitor) => ({
    item: monitor.getItem(),
  }));
  return <div></div>;
};

const RM_PassengerComponent = ({
  data,
  ride,
  display,
}: {
  data: Passenger;
  ride: Ride;
  display?: PassengerDisplay[];
}) => {
  const rmcontext = useContext(RideManagerContext);

  const removePassenger = () => {
    if (rmcontext) {
      rmcontext.passengerCallback(
        new Map([...rmcontext.passengerCollection.entries()]).set(
          data.getEmail(),
          data
        )
      );
      ride.passengers.delete(data.getEmail());
      rmcontext.rideCallback(
        rmcontext.rideCollection.set(ride.getDriver().getEmail(), ride)
      );
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
  const ref = useRef<HTMLDivElement>(null);
  const [{ canDrop, isOver }, drop] = useDrop<
    DragItem,
    void,
    { canDrop: Boolean; isOver: boolean }
  >(
    () => ({
      accept: TestType.TEST,
      drop: (item, monitor) => {
        if (rmcontext?.passengerCollection) {
          let test = rmcontext.passengerCollection.get(item.email);
          if (!!test) {
            data.addPassenger(test);
            let newpassengercollection = new Map([
              ...rmcontext.passengerCollection.entries(),
            ]);
            newpassengercollection.delete(item.email);
            rmcontext.rideCallback(
              rmcontext.rideCollection.set(data.getDriver().getEmail(), data)
            );
            rmcontext.passengerCallback(newpassengercollection);
          }
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    []
  );

  const addPassenger = () => {
    if (rmcontext) {
      const nextpassenger = [...rmcontext.passengerList].shift();
      if (!!nextpassenger) {
        data.addPassenger(nextpassenger);
        let newpassengercollection = new Map([
          ...rmcontext.passengerCollection.entries(),
        ]);
        newpassengercollection.delete(nextpassenger.getEmail());
        rmcontext.passengerCallback(newpassengercollection);
        rmcontext.rideCallback(
          rmcontext.rideCollection.set(data.getDriver().getEmail(), data)
        );
      }
    }
  };

  const seatsleft = data.driver.seats - data.passengers.size;
  let valid = seatsleft >= 0;

  drop(ref);

  return (
    <div
      className={
        "p-2 my-1 rounded-md " +
        (!valid
          ? "bg-red-500"
          : isOver && canDrop
          ? "bg-amber-300"
          : "bg-neutral-500")
      }
      ref={ref}
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
          {Array.from(data.passengers).map(([key, value]) => (
            <li key={key}>
              <RM_PassengerComponent
                data={value}
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
  rideCollection: Map<string, Ride>;
  passengerCallback: (data: Map<string, Passenger>) => void;
  rideCallback: (data: Map<string, Ride>) => void;
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
  const [rpCollection, setRPCollection] = useState<Map<string, Passenger>>(
    new Map<string, Passenger>()
  );
  const [rpList, setRPList] = useState<Passenger[]>([]);
  const [rpSort, setRPSort] = useState<PassengerSort>();
  const [rpFilter, setRPFilter] = useState<RideTimes | College>();

  const [rideCollection, setRideCollection] = useState<Map<string, Ride>>(
    new Map<string, Ride>()
  );
  const [rideList, setRideList] = useState<Ride[]>([]);
  const [rideSort, setRideSort] = useState<RideSort>();
  const [rideFilter, setRideFilter] = useState<RideTimes | College>();

  /**add/remove people from manager states based on origin */
  useEffect(() => {
    refreshRides();
  }, [originPassengers, originDrivers]);
  /**sort and filter passengers */
  useEffect(() => {
    setRPList(
      sortPassengers(
        filterPassengers([...rpCollection.values()], rpFilter),
        rpSort
      )
    );
  }, [rpCollection, rpSort, rpFilter]);
  useEffect(() => {
    setRideList(
      sortRides(filterRides([...rideCollection.values()], rideFilter), rideSort)
    );
  }, [rideCollection, rideSort, rideFilter]);

  const refreshRides = () => {
    let newRPCollection = new Map([...rpCollection.entries()]);
    /* remove passengers, even if assigned a ride */
    for (let passenger of rpCollection.values()) {
      if (!originPassengers.has(passenger.getEmail()))
        newRPCollection.delete(passenger.getEmail());
    }
    for (let ride of rideCollection.values()) {
      for (let ridepassenger of ride.passengers.values()) {
        if (!originPassengers.has(ridepassenger.getEmail()))
          ride.passengers.delete(ridepassenger.getEmail());
      }
    }
    /* add new passengers */
    for (let passenger of originPassengers.values()) {
      if (!rpCollection.has(passenger.getEmail())) {
        /**check if passenger already in rpCollection */
        let exists = false;
        for (let ride of rideCollection.values()) {
          /**check if passenger in a ride */
          if (ride.passengers.has(passenger.getEmail())) {
            exists = true;
            break;
          }
        }
        if (!exists) newRPCollection.set(passenger.getEmail(), passenger);
      }
    }
    let newRideCollection = new Map([...rideCollection.entries()]);
    /* remove rides and move their passengers back into the unassigned list */
    for (let ride of rideCollection.values()) {
      if (!originDrivers.has(ride.driver.getEmail())) {
        for (let passenger of ride.passengers.values()) {
          if (originPassengers.has(passenger.getEmail()))
            newRPCollection.set(passenger.getEmail(), passenger);
        }
        ride.passengers.clear();
        newRideCollection.delete(ride.getDriver().getEmail());
      }
    }

    /* add new rides */
    for (let driver of originDrivers.values()) {
      if (!rideCollection.has(driver.getEmail())) {
        newRideCollection.set(
          driver.getEmail(),
          new Ride({
            driver: driver,
            passengers: new Map<string, Passenger>(),
          })
        );
      }
    }
    /**update passenger and ride lists */
    passengerUpdater(newRPCollection);
    rideUpdater(newRideCollection);
  };
  const clearRides = () => {
    let newRPCollection = new Map([...rpCollection.entries()]);
    for (let ride of rideList) {
      for (let passenger of ride.getPassengerList().values()) {
        newRPCollection.set(passenger.getEmail(), passenger);
      }
      ride.passengers.clear();
    }
    passengerUpdater(newRPCollection);
  };

  const updateRPSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setRPSort(event.target.value as PassengerSort);
  };
  const updateRPFilter = (event: ChangeEvent<HTMLSelectElement>) => {
    if (Object.values(RideTimes).includes(event.target.value as RideTimes)) {
      setRPFilter(event.target.value as RideTimes);
    } else if (Object.values(College).includes(event.target.value as College)) {
      setRPFilter(event.target.value as College);
    } else setRPFilter(undefined);
  };
  const updateRideSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setRideSort(event.target.value as RideSort);
  };
  const updateRideFilter = (event: ChangeEvent<HTMLSelectElement>) => {
    if (Object.values(RideTimes).includes(event.target.value as RideTimes)) {
      setRideFilter(event.target.value as RideTimes);
    } else if (Object.values(College).includes(event.target.value as College)) {
      setRideFilter(event.target.value as College);
    } else setRideFilter(undefined);
  };

  const passengerUpdater = (data: Map<string, Passenger>) => {
    setRPCollection(data);
  };
  const rideUpdater = (data: Map<string, Ride>) => {
    setRideCollection(data);
  };

  return (
    <RideManagerContext.Provider
      value={{
        passengerCollection: rpCollection,
        passengerList: rpList,
        rideCollection: rideCollection,
        passengerCallback: passengerUpdater,
        rideCallback: rideUpdater,
      }}
    >
      <DndProvider backend={HTML5Backend}>
        <CustomDragLayer />
        <div className="flex flex-row w-full justify-evenly">
          <div className="p-2 rounded-md border border-neutral-500">
            <h2>Ride Manager</h2>
            <button
              className="m-1 p-1 rounded-sm border"
              onClick={refreshRides}
            >
              Refresh
            </button>
            <button className="m-1 p-1 rounded-sm border" onClick={clearRides}>
              Clear All Rides
            </button>
            <div className="flex flex-row">
              <div className="p-2 rounded-md border border-cyan-500 bg-cyan-50 dark:bg-cyan-950">
                <label>
                  <span className="text-neutral-500">Sort: </span>
                  <select
                    className="rounded-sm border"
                    defaultValue={rpSort}
                    onChange={updateRPSort}
                  >
                    <option
                      className="dark:text-black"
                      key={undefined}
                      value={undefined}
                    />
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
                <label>
                  <span className="text-neutral-500"> Filter: </span>
                  <select
                    className="rounded-sm border"
                    defaultValue={rpFilter}
                    onChange={updateRPFilter}
                  >
                    <option
                      className="dark:text-black"
                      key={undefined}
                      value={undefined}
                    />
                    {Object.values(RideTimes).map((option) => (
                      <option
                        className="dark:text-black"
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                    {Object.values(College).map((option) => (
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
                  {rpList.map((item) => (
                    <li key={item.getEmail()}>
                      <RM_RPComponent data={item} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-2 rounded-md border border-orange-500 bg-orange-50 dark:bg-orange-950">
                <label>
                  <span className="text-neutral-500">Sort: </span>
                  <select
                    className="rounded-sm border"
                    defaultValue={rideSort}
                    onChange={updateRideSort}
                  >
                    <option
                      className="dark:text-black"
                      key={undefined}
                      value={undefined}
                    />
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
                <label>
                  <span className="text-neutral-500"> Filter: </span>
                  <select
                    className="rounded-sm border"
                    defaultValue={rideFilter}
                    onChange={updateRideFilter}
                  >
                    <option
                      className="dark:text-black"
                      key={undefined}
                      value={undefined}
                    />
                    {Object.values(RideTimes).map((option) => (
                      <option
                        className="dark:text-black"
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                    {Object.values(College).map((option) => (
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
                  {rideList.map((item) => (
                    <li key={item.getDriver().getEmail()}>
                      <RM_RideComponent data={item} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DndProvider>
    </RideManagerContext.Provider>
  );
};
