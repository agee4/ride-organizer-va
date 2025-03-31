// ride_manager.tsx

import {
  ActionDispatch,
  ChangeEvent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Driver, DriverDisplay } from "../_classes/driver";
import {
  filterPassengers,
  Passenger,
  PassengerDisplay,
  passengerReducer,
  PassengerReducerAction,
  PassengerSort,
  sortPassengers,
  YearTag,
} from "../_classes/passenger";
import {
  filterRides,
  Ride,
  rideReducer,
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
  const dragRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const [showDetail, setShowDetail] = useState<boolean>(true);
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

  const toggleDetail = () => {
    setShowDetail(!showDetail);
  };

  drag(dragRef);
  dragPreview(dragPreviewRef);

  return (
    <div
      className={
        "p-2 my-1 rounded-md bg-cyan-200 dark:bg-cyan-800 max-w-[496px] " +
        (isDragging && "opacity-50")
      }
      ref={dragRef}
      onClick={toggleDetail}
    >
      <div className="flex flex-row place-content-between">
        {(!display || display.includes(PassengerDisplay.NAME)) && (
          <h3 className="m-1 font-bold text-lg">{data.name}</h3>
        )}
        <button className="m-1 font-bold text-lg" onClick={toggleDetail}>
          {showDetail ? <span>&and;</span> : <span>&or;</span>}
        </button>
      </div>
      {showDetail && (
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
          {(!display || display.includes(PassengerDisplay.YEAR)) && (
            <li>
              <YearTag data={data.year} />
            </li>
          )}
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
      )}
    </div>
  );
};

const RM_RPListComponent = () => {
  const rmContext = useContext(RideManagerContext);
  if (!rmContext) {
    throw new Error(
      "RM_RPListComponent must be used within a RideManagerProvider"
    );
  }
  const {
    passengerCollection,
    passengerList,
    passengerCallback,
    rideCollection,
    rideCallback,
  } = rmContext;
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ canDrop, isOver }, drop] = useDrop<
    DragItem,
    void,
    { canDrop: Boolean; isOver: boolean }
  >(
    () => ({
      accept: TestType.TEST,
      drop: (item, monitor) => {
        console.log("drop");
        addDragItem(item);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    []
  );

  const addDragItem = useCallback(
    (item: DragItem) => {
      console.log(passengerCollection);
      let dragpassenger = passengerCollection.get(item.email);
      if (!!dragpassenger) {
        for (let ride of rideCollection.values()) {
          if (ride.getPassengerList().has(dragpassenger.getEmail())) {
            let test = ride.getCopy();
            test.getPassengerList().delete(dragpassenger.getEmail());
            rideCallback({ type: "create", ride: test });
          }
        }
        passengerCallback({
          type: "create",
          passenger: dragpassenger,
        });
      }
    },
    [passengerCollection, rideCollection]
  );

  drop(dropRef);

  return (
    <div
      className={
        "rounded-md " + (isOver && canDrop ? "bg-amber-300" : "bg-neutral-500")
      }
      ref={dropRef}
    >
      <ul className="m-1 max-h-[70dvh] overflow-auto">
        {passengerList.map((item) => (
          <li key={item.getEmail()}>
            <RM_RPComponent data={item} />
          </li>
        ))}
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
  const rmContext = useContext(RideManagerContext);
  if (!rmContext) {
    throw new Error(
      "RM_PassengerComponent must be used within a RideManagerProvider"
    );
  }
  const { passengerCallback, rideCallback } = rmContext;
  const dragRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const [showDetail, setShowDetail] = useState<boolean>(true);
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
  drag(dragRef);
  dragPreview(dragPreviewRef);

  const removePassenger = () => {
    passengerCallback({ type: "create", passenger: data });
    ride.passengers.delete(data.getEmail());
    rideCallback({ type: "create", ride: ride });
  };

  const toggleDetail = () => {
    setShowDetail(!showDetail);
  };

  let invalid = "";
  if (
    data.getCollege() != ride.getDriver().getCollege() &&
    data.getCollege() != College.OTHER &&
    ride.getDriver().getCollege() != College.OTHER
  )
    invalid = "WRONG COLLEGE";
  else if (
    ride
      .getDriver()
      .rides.filter((x) => data.rides.includes(x) || data.backup?.includes(x))
      .length <= 0
  )
    invalid = "NO RIDE OVERLAP";

  return (
    <div
      className={
        "p-2 my-1 rounded-md bg-red-500 max-w-[496px] " +
        (isDragging && "opacity-50 ") +
        (invalid.length <= 0 && " bg-cyan-200 dark:bg-cyan-800")
      }
      ref={dragRef}
      onClick={toggleDetail}
    >
      <div className="flex flex-row place-content-between">
        {(!display || display.includes(PassengerDisplay.NAME)) && (
          <h3 className="m-1 font-bold text-lg">{data.name}</h3>
        )}
        <button className="m-1 font-bold text-lg" onClick={removePassenger}>
          &times;
        </button>
      </div>
      {showDetail && (
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
          {(!display || display.includes(PassengerDisplay.YEAR)) && (
            <li>Year: {data.year}</li>
          )}
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
      )}
    </div>
  );
};

const RM_RideComponent = ({ data }: { data: Ride }) => {
  const rmContext = useContext(RideManagerContext);
  if (!rmContext) {
    throw new Error(
      "RM_PassengerComponent must be used within a RideManagerProvider"
    );
  }
  const {
    passengerCollection,
    passengerList,
    passengerCallback,
    rideCollection,
    rideCallback,
  } = rmContext;
  const dropRef = useRef<HTMLDivElement>(null);
  const [showDriverDetail, setShowDriverDetail] = useState<boolean>(true);
  const [showPassengers, setShowPassengers] = useState<boolean>(true);
  const [{ canDrop, isOver }, drop] = useDrop<
    DragItem,
    void,
    { canDrop: Boolean; isOver: boolean }
  >(
    () => ({
      accept: TestType.TEST,
      drop: (item, monitor) => {
        let dragpassenger = passengerCollection.get(item.email);
        if (!!dragpassenger) {
          addPassengerHelper(dragpassenger);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    []
  );

  const addPassengerButton = () => {
    const nextpassenger = [...passengerList].shift();
    if (!!nextpassenger) {
      addPassengerHelper(nextpassenger);
    }
  };

  const addPassengerHelper = (passenger: Passenger) => {
    passengerCallback({
      type: "delete",
      passenger: passenger,
    });
    for (let ride of rideCollection.values()) {
      if (ride.getPassengerList().has(passenger.getEmail())) {
        ride.getPassengerList().delete(passenger.getEmail());
        rideCallback({ type: "create", ride: ride });
      }
    }
    data.addPassenger(passenger);
    rideCallback({ type: "create", ride: data });
  };

  const toggleDriverDetail = () => {
    setShowDriverDetail(!showDriverDetail);
  };
  const togglePassengers = () => {
    setShowPassengers(!showPassengers);
  };

  drop(dropRef);
  let invalid = "";
  const seatsleft = data.driver.seats - data.passengers.size;
  if (data.driver.seats - data.passengers.size < 0) {
    invalid = "TOO MANY PASSENGERS!";
  } else {
    for (let passenger of data.getPassengerList().values()) {
      if (
        passenger.getCollege() != data.getDriver().getCollege() &&
        passenger.getCollege() != College.OTHER &&
        data.getDriver().getCollege() != College.OTHER
      )
        invalid = "WRONG COLLEGE";
      else if (
        data
          .getDriver()
          .rides.filter(
            (x) => passenger.rides.includes(x) || passenger.backup?.includes(x)
          ).length <= 0
      )
        invalid = "NO RIDE OVERLAP";
    }
  }

  return (
    <div
      className={
        "p-2 my-1 rounded-md " +
        (invalid.length > 0
          ? "bg-red-500"
          : isOver && canDrop
            ? "bg-amber-300"
            : "bg-neutral-500")
      }
      ref={dropRef}
    >
      <div className="flex flex-row place-content-between">
        <h3 className="m-1 font-bold text-lg">{data.driver.name}</h3>
        <button className="m-1 font-bold text-lg" onClick={toggleDriverDetail}>
          {showDriverDetail ? <span>&and;</span> : <span>&or;</span>}
        </button>
      </div>
      <ul className="m-1">
        {showDriverDetail &&
          data.driver.display([
            DriverDisplay.ADDRESS,
            DriverDisplay.COLLEGE,
            DriverDisplay.NOTES,
          ])}
        <ul className="m-1">
          <li className="text-center">
            <button
              className="p-1 rounded-md bg-neutral-300 dark:bg-neutral-700"
              onClick={togglePassengers}
            >
              Seats Left: {seatsleft}
            </button>
          </li>
          {invalid.length > 0 && <li className="text-center">{invalid}</li>}
          {showPassengers && (
            <>
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
                    onClick={addPassengerButton}
                  >
                    +
                  </button>
                </li>
              ))}
            </>
          )}
        </ul>
      </ul>
    </div>
  );
};

const RideManagerContext = createContext<{
  passengerCollection: Map<string, Passenger>;
  passengerList: Passenger[];
  rideCollection: Map<string, Ride>;
  passengerCallback: ActionDispatch<[action: PassengerReducerAction]>;
  rideCallback: ActionDispatch<[action: RideReducerAction]>;
} | null>(null);

export const RideManager = ({
  originPassengers,
  originDrivers,
  originRides,
  rideCallback,
}: {
  originPassengers: Map<string, Passenger>;
  originDrivers: Map<string, Driver>;
  originRides: Map<string, Ride>;
  rideCallback: ActionDispatch<[action: RideReducerAction]>;
}) => {
  const [rpCollection, rpDispatch] = useReducer(
    passengerReducer,
    new Map<string, Passenger>()
  );
  const [rpList, setRPList] = useState<Passenger[]>([]);
  const [rpSort, setRPSort] = useState<PassengerSort>();
  const [rpReverse, setRPReverse] = useState<boolean>(false);
  const [showRPFilter, setShowRPFilter] = useState<boolean>(false);
  const [rpFilter, setRPFilter] = useState<(RideTimes | College)[]>([]);

  const [rideList, setRideList] = useState<Ride[]>([]);
  const [rideSort, setRideSort] = useState<RideSort>();
  const [rideReverse, setRideReverse] = useState<boolean>(false);
  const [showRideFilter, setShowRideFilter] = useState<boolean>(false);
  const [rideFilter, setRideFilter] = useState<(RideTimes | College)[]>([]);

  /**add/remove people from manager states based on origin */
  useEffect(() => {
    refreshRides();
  }, [originPassengers, originDrivers]);
  /**sort and filter passengers */
  useEffect(() => {
    setRPList(
      rpReverse
        ? sortPassengers(
            filterPassengers([...rpCollection.values()], rpFilter),
            rpSort
          ).reverse()
        : sortPassengers(
            filterPassengers([...rpCollection.values()], rpFilter),
            rpSort
          )
    );
  }, [rpCollection, rpSort, rpReverse, rpFilter]);
  useEffect(() => {
    setRideList(
      rideReverse
        ? sortRides(
            filterRides([...originRides.values()], rideFilter),
            rideSort
          ).reverse()
        : sortRides(
            filterRides([...originRides.values()], rideFilter),
            rideSort
          )
    );
  }, [rpCollection, originRides, rideSort, rideReverse, rideFilter]);
  useEffect(() => {
    for (let ride of originRides.values()) {
      for (let ridepassenger of ride.passengers.values())
        rpDispatch({ type: "delete", passenger: ridepassenger });
    }
    console.log("rides actually updated!");
  }, [originRides]);

  const refreshRides = () => {
    /* remove passengers, even if assigned a ride */
    for (let passenger of rpCollection.values()) {
      if (!originPassengers.has(passenger.getEmail()))
        rpDispatch({ type: "delete", passenger: passenger });
    }
    for (let ride of originRides.values()) {
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
        for (let ride of originRides.values()) {
          /**check if passenger in a ride */
          if (ride.passengers.has(passenger.getEmail())) {
            exists = true;
            break;
          }
        }
        if (!exists) rpDispatch({ type: "create", passenger: passenger });
      }
    }
    /* remove rides and move their passengers back into the unassigned list */
    for (let ride of originRides.values()) {
      if (!originDrivers.has(ride.driver.getEmail())) {
        for (let passenger of ride.passengers.values()) {
          if (originPassengers.has(passenger.getEmail()))
            rpDispatch({ type: "create", passenger: passenger });
        }
        rideCallback({ type: "delete", ride: ride });
      }
    }

    /* add new rides */
    for (let driver of originDrivers.values()) {
      if (!originRides.has(driver.getEmail())) {
        rideCallback({
          type: "create",
          ride: new Ride({
            driver: driver,
            passengers: new Map<string, Passenger>(),
          }),
        });
      }
    }
  };
  const clearRides = () => {
    for (let ride of rideList) {
      for (let passenger of ride.getPassengerList().values()) {
        rpDispatch({ type: "create", passenger: passenger });
      }
      ride.passengers.clear();
    }
  };

  const updateRPSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setRPSort(
      Object.values(PassengerSort).includes(event.target.value as PassengerSort)
        ? (event.target.value as PassengerSort)
        : undefined
    );
  };
  const toggleRPReverse = () => {
    setRPReverse(!rpReverse);
  };
  const toggleShowRPFilter = () => {
    setShowRPFilter(!showRPFilter);
  };
  const updateRPFilter = (event: ChangeEvent<HTMLSelectElement>) => {
    setRPFilter(
      [...event.target.selectedOptions].map((o) =>
        Object.values(RideTimes).includes(o.value as RideTimes)
          ? (o.value as RideTimes)
          : (o.value as College)
      )
    );
  };

  const updateRideSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setRideSort(
      Object.values(RideSort).includes(event.target.value as RideSort)
        ? (event.target.value as RideSort)
        : undefined
    );
  };
  const toggleRideReverse = () => {
    setRideReverse(!rideReverse);
  };
  const toggleShowRideFilter = () => {
    setShowRideFilter(!showRideFilter);
  };
  const updateRideFilter = (event: ChangeEvent<HTMLSelectElement>) => {
    setRideFilter(
      [...event.target.selectedOptions].map((o) =>
        Object.values(RideTimes).includes(o.value as RideTimes)
          ? (o.value as RideTimes)
          : (o.value as College)
      )
    );
  };

  const rmContextValues = useMemo(
    () => ({
      passengerCollection: originPassengers,
      passengerList: rpList,
      rideCollection: originRides,
      passengerCallback: rpDispatch,
      rideCallback: rideCallback,
    }),
    [originPassengers, rpList, originRides, rpDispatch, rideCallback]
  );

  return (
    <RideManagerContext.Provider value={rmContextValues}>
      <DndProvider backend={HTML5Backend}>
        <CustomDragLayer />
        <div className="flex flex-row w-full justify-evenly">
          <div className="p-2 rounded-md border border-neutral-500">
            <h2>Ride Manager</h2>
            <button className="px-2 rounded-full border" onClick={refreshRides}>
              Refresh
            </button>
            <button className="px-2 rounded-full border" onClick={clearRides}>
              Clear All Rides
            </button>
            <div className="flex flex-row">
              <div className="p-2 rounded-md border border-cyan-500 bg-cyan-50 dark:bg-cyan-950">
                <div className="flex flex-row place-content-between">
                  <span className="px-1 rounded-full bg-cyan-500">
                    {rpList.length}/{rpCollection.size}/{originPassengers.size}
                  </span>
                  <div className="flex flex-row">
                    <select
                      className={
                        "rounded-sm border " + (!rpSort && "text-neutral-500")
                      }
                      defaultValue={rpSort}
                      onChange={updateRPSort}
                    >
                      <option
                        className="dark:text-black"
                        key={undefined}
                        value={undefined}
                      >
                        -Sort-
                      </option>
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
                    <button
                      className="ml-1 font-bold text-neutral-500"
                      onClick={toggleRPReverse}
                    >
                      {rpReverse ? <span>&uarr;</span> : <span>&darr;</span>}
                    </button>
                  </div>
                </div>
                <div className="flex flex-row place-content-end">
                  {showRPFilter ? (
                    <select
                      className={
                        "rounded-sm border " + (!rpFilter && "text-neutral-500")
                      }
                      defaultValue={rpFilter}
                      onChange={updateRPFilter}
                      multiple
                    >
                      <optgroup label="Ride Times">
                        {Object.values(RideTimes).map((option) => (
                          <option
                            className="dark:text-black"
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Colleges">
                        {Object.values(College).map((option) => (
                          <option
                            className="dark:text-black"
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  ) : (
                    <p
                      className={
                        "rounded-sm border " +
                        (rpFilter.length < 1 &&
                          " text-neutral-500 border-neutral-500")
                      }
                      onClick={toggleShowRPFilter}
                    >
                      {rpFilter.length < 1 ? "-Filter-" : rpFilter}
                    </p>
                  )}
                  <button
                    className="ml-1 font-bold text-neutral-500"
                    onClick={toggleShowRPFilter}
                  >
                    {showRPFilter ? (
                      <span>&times;</span>
                    ) : (
                      <span>&hellip;</span>
                    )}
                  </button>
                </div>
                <RM_RPListComponent />
              </div>
              <div className="p-2 rounded-md border border-orange-500 bg-orange-50 dark:bg-orange-950">
                <div className="flex flex-row place-content-between">
                  <span className="px-1 rounded-full bg-orange-500">
                    {rideList.length}/{originRides.size}
                  </span>
                  <div className="flex flex-row">
                    <select
                      className={
                        "rounded-sm border " + (!rideSort && "text-neutral-500")
                      }
                      defaultValue={rideSort}
                      onChange={updateRideSort}
                    >
                      <option
                        className="dark:text-neutral-500"
                        key={undefined}
                        value={undefined}
                      >
                        -Sort-
                      </option>
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
                    <button
                      className="ml-1 font-bold text-neutral-500"
                      onClick={toggleRideReverse}
                    >
                      {rideReverse ? <span>&uarr;</span> : <span>&darr;</span>}
                    </button>
                  </div>
                </div>
                <div className="flex flex-row place-content-end">
                  {showRideFilter ? (
                    <select
                      className={
                        "rounded-sm border " +
                        (!rideFilter && "text-neutral-500")
                      }
                      value={rideFilter}
                      onChange={updateRideFilter}
                      multiple
                    >
                      <optgroup label="Ride Times">
                        {Object.values(RideTimes).map((option) => (
                          <option
                            className="dark:text-black"
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Colleges">
                        {Object.values(College).map((option) => (
                          <option
                            className="dark:text-black"
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  ) : (
                    <p
                      className={
                        "rounded-sm border " +
                        (rideFilter.length < 1 &&
                          " text-neutral-500 border-neutral-500")
                      }
                      onClick={toggleShowRideFilter}
                    >
                      {rideFilter.length < 1 ? "-Filter-" : rideFilter}
                    </p>
                  )}
                  <button
                    className="ml-1 font-bold text-neutral-500"
                    onClick={toggleShowRideFilter}
                  >
                    {showRideFilter ? (
                      <span>&times;</span>
                    ) : (
                      <span>&hellip;</span>
                    )}
                  </button>
                </div>
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
