// ride_manager.tsx

import {
  ActionDispatch,
  ChangeEvent,
  createContext,
  useContext,
  useEffect,
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
  const [showDetail, setShowDetail] = useState<boolean>(true);
  const toggleDetail = () => {
    setShowDetail(!showDetail);
  };

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
  const dragRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  drag(dragRef);
  dragPreview(dragPreviewRef);

  return (
    <div
      className={
        "my-1 max-w-[496px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800 " +
        (isDragging && "opacity-50")
      }
      ref={dragRef}
      onClick={toggleDetail}
    >
      <div className="flex flex-row place-content-between">
        {(!display || display.includes(PassengerDisplay.NAME)) && (
          <h3 className="m-1 text-lg font-bold">{data.getName()}</h3>
        )}
        <button className="m-1 text-lg font-bold" onClick={toggleDetail}>
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
                <CollegeTag data={data.getCollege() as College} />
              )}
              {(!display || display.includes(PassengerDisplay.ADDRESS)) && (
                <span>{data.getAddress()}</span>
              )}
            </li>
          )}
          <ul className="flex flex-row flex-wrap">
            {data.getRides().map((item, index) => (
              <li
                className="mr-1 rounded-md bg-neutral-200 p-1 dark:bg-neutral-800"
                key={index}
              >
                {item}
              </li>
            ))}
            {data.getBackup() &&
              data.getBackup().map((item, index) => (
                <li
                  className="mr-1 rounded-md bg-neutral-400 p-1 dark:bg-neutral-600"
                  key={index}
                >
                  {item}
                </li>
              ))}
          </ul>
          {(!display || display.includes(PassengerDisplay.YEAR)) && (
            <li>
              <YearTag data={data.getYear()} />
            </li>
          )}
          {(!display || display.includes(PassengerDisplay.NOTES)) &&
            data.getNotes() && (
              <ul className="mt-1">
                <li>
                  <textarea
                    className="rounded-md bg-cyan-400 p-1 dark:bg-cyan-600"
                    defaultValue={data.getNotes()}
                  />
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
          for (let ride of rideCollection.values()) {
            if (ride.getPassengers().has(dragpassenger.getEmail())) {
              ride.getPassengers().delete(dragpassenger.getEmail());
              rideCallback({ type: "create", ride: ride });
            }
          }
          passengerCallback({
            type: "create",
            passenger: dragpassenger,
          });
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [passengerCollection, rideCollection]
  );
  const dropRef = useRef<HTMLDivElement>(null);
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

  const [showDetail, setShowDetail] = useState<boolean>(true);
  const toggleDetail = () => {
    setShowDetail(!showDetail);
  };

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
  const dragRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  drag(dragRef);
  dragPreview(dragPreviewRef);

  const removePassenger = () => {
    passengerCallback({ type: "create", passenger: data });
    ride.getPassengers().delete(data.getEmail());
    rideCallback({ type: "create", ride: ride });
  };

  return (
    <div
      className={
        "my-1 max-w-[496px] rounded-md p-2 " +
        (isDragging && "opacity-50") +
        (ride.validate(data)
          ? " bg-cyan-200 dark:bg-cyan-800"
          : " bg-red-400 dark:bg-red-600")
      }
      ref={dragRef}
      onClick={toggleDetail}
    >
      <div className="flex flex-row place-content-between">
        {(!display || display.includes(PassengerDisplay.NAME)) && (
          <h3 className="m-1 text-lg font-bold">{data.getName()}</h3>
        )}
        <button className="m-1 text-lg font-bold" onClick={removePassenger}>
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
                <CollegeTag data={data.getCollege() as College} />
              )}
              {(!display || display.includes(PassengerDisplay.ADDRESS)) && (
                <span>{data.getAddress()}</span>
              )}
            </li>
          )}
          <ul className="flex flex-row flex-wrap">
            {data.getRides().map((item, index) => (
              <li
                className="mr-1 rounded-md bg-neutral-200 p-1 dark:bg-neutral-800"
                key={index}
              >
                {item}
              </li>
            ))}
            {data.getBackup() &&
              data.getBackup().map((item, index) => (
                <li
                  className="mr-1 rounded-md bg-neutral-400 p-1 dark:bg-neutral-600"
                  key={index}
                >
                  {item}
                </li>
              ))}
          </ul>
          {(!display || display.includes(PassengerDisplay.YEAR)) && (
            <li>Year: {data.getYear()}</li>
          )}
          {(!display || display.includes(PassengerDisplay.NOTES)) &&
            data.getNotes() && (
              <ul className="mt-1">
                <li>
                  <textarea
                    className="rounded-md bg-cyan-400 p-1 dark:bg-cyan-600"
                    defaultValue={data.getNotes()}
                  />
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

  const [showDriverDetail, setShowDriverDetail] = useState<boolean>(true);
  const toggleDriverDetail = () => {
    setShowDriverDetail(!showDriverDetail);
  };
  const [showPassengers, setShowPassengers] = useState<boolean>(true);
  const togglePassengers = () => {
    setShowPassengers(!showPassengers);
  };

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
    [passengerCollection]
  );
  const dropRef = useRef<HTMLDivElement>(null);
  drop(dropRef);

  const addPassengerListShift = () => {
    /**get passenger from top of unassigned list */
    const nextpassenger = [...passengerList].shift();
    if (!!nextpassenger) {
      addPassengerHelper(nextpassenger);
    }
  };

  const addPassengerHelper = (passenger: Passenger) => {
    /**remove passenger from unassigned (if possible) */
    passengerCallback({
      type: "delete",
      passenger: passenger,
    });
    /**remove passenger from previous rides (if possible) */
    for (let ride of rideCollection.values()) {
      if (ride.getPassengers().has(passenger.getEmail())) {
        ride.getPassengers().delete(passenger.getEmail());
        rideCallback({ type: "create", ride: ride });
      }
    }
    /**add passenger to ride */
    data.addPassenger(passenger);
    rideCallback({ type: "create", ride: data });
  };

  const seatsleft = data.getDriver().getSeats() - data.getPassengers().size;
  const valid = data.updateValid();

  return (
    <div
      className="my-1 rounded-md bg-orange-300 p-2 dark:bg-orange-700"
      ref={dropRef}
    >
      <div className="flex flex-row place-content-between">
        <h3 className="m-1 text-lg font-bold">{data.getDriver().getName()}</h3>
        <button className="m-1 text-lg font-bold" onClick={toggleDriverDetail}>
          {showDriverDetail ? <span>&and;</span> : <span>&or;</span>}
        </button>
      </div>
      {showDriverDetail && (
        <ul className="m-1">
          <li>
            <CollegeTag data={data.getDriver().getCollege()} />
            <span>{data.getDriver().getAddress()}</span>
          </li>
          <ul className="flex flex-row flex-wrap">
            {data
              .getDriver()
              .getRides()
              .map((item, index) => (
                <li
                  className="mr-1 rounded-md bg-neutral-200 p-1 dark:bg-neutral-800"
                  key={index}
                >
                  {item}
                </li>
              ))}
          </ul>
          {data.getDriver().getNotes() && (
            <ul className="mt-1">
              <li>
                <textarea
                  className="rounded-md bg-orange-400 p-1 dark:bg-orange-600"
                  defaultValue={data.getDriver().getNotes()}
                />
              </li>
            </ul>
          )}
        </ul>
      )}
      <div
        className={
          "rounded-md " +
          (!valid
            ? "bg-red-500"
            : isOver && canDrop
              ? "bg-amber-300"
              : "bg-neutral-500")
        }
      >
        <ul className="m-1">
          <li className="text-center">
            <button
              className="rounded-md bg-neutral-300 p-1 dark:bg-neutral-700"
              onClick={togglePassengers}
            >
              Seats Left: {seatsleft}/{data.getDriver().getSeats()}
            </button>
          </li>
          {!valid && (
            <details className="text-center">
              <summary>
                {data.getInvalid().length} WARNING
                {data.getInvalid().length != 1 && "S"}!
              </summary>
              <ul className="text-center">
                {data.getInvalid().map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </details>
          )}
          {showPassengers && (
            <>
              {Array.from(data.getPassengers()).map(([key, value]) => (
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
                    onClick={addPassengerListShift}
                  >
                    +
                  </button>
                </li>
              ))}
            </>
          )}
        </ul>
      </div>
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
  const updateRPSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setRPSort(
      Object.values(PassengerSort).includes(event.target.value as PassengerSort)
        ? (event.target.value as PassengerSort)
        : undefined
    );
  };
  const [rpReverse, setRPReverse] = useState<boolean>(false);
  const toggleRPReverse = () => {
    setRPReverse(!rpReverse);
  };
  const [showRPFilter, setShowRPFilter] = useState<boolean>(false);
  const toggleShowRPFilter = () => {
    setShowRPFilter(!showRPFilter);
  };
  const [rpFilter, setRPFilter] = useState<(RideTimes | College)[]>([]);
  const updateRPFilter = (event: ChangeEvent<HTMLSelectElement>) => {
    setRPFilter(
      [...event.target.selectedOptions].map((o) =>
        Object.values(RideTimes).includes(o.value as RideTimes)
          ? (o.value as RideTimes)
          : (o.value as College)
      )
    );
  };

  const [rideList, setRideList] = useState<Ride[]>([]);
  const [rideSort, setRideSort] = useState<RideSort>();
  const updateRideSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setRideSort(
      Object.values(RideSort).includes(event.target.value as RideSort)
        ? (event.target.value as RideSort)
        : undefined
    );
  };
  const [rideReverse, setRideReverse] = useState<boolean>(false);
  const toggleRideReverse = () => {
    setRideReverse(!rideReverse);
  };
  const [showRideFilter, setShowRideFilter] = useState<boolean>(false);
  const toggleShowRideFilter = () => {
    setShowRideFilter(!showRideFilter);
  };
  const [rideFilter, setRideFilter] = useState<(RideTimes | College)[]>([]);
  const updateRideFilter = (event: ChangeEvent<HTMLSelectElement>) => {
    setRideFilter(
      [...event.target.selectedOptions].map((o) =>
        Object.values(RideTimes).includes(o.value as RideTimes)
          ? (o.value as RideTimes)
          : (o.value as College)
      )
    );
  };

  /**add/remove people from manager states, based on origin */
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
  /**sort and filter rides */
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
  }, [originRides, rideSort, rideReverse, rideFilter]);

  const refreshRides = () => {
    /**remove passengers, even if assigned a ride */
    for (let passenger of rpCollection.values()) {
      if (!originPassengers.has(passenger.getEmail()))
        rpDispatch({ type: "delete", passenger: passenger });
    }
    for (let ride of originRides.values()) {
      for (let ridepassenger of ride.getPassengers().values()) {
        if (!originPassengers.has(ridepassenger.getEmail()))
          ride.getPassengers().delete(ridepassenger.getEmail());
      }
    }
    /**add new passengers */
    for (let passenger of originPassengers.values()) {
      /**check if passenger in unassigned */
      if (!rpCollection.has(passenger.getEmail())) {
        /**check if passenger in a ride */
        let exists = false;
        for (let ride of originRides.values()) {
          if (ride.getPassengers().has(passenger.getEmail())) {
            exists = true;
            break;
          }
        }
        /**if passenger not in a ride & not in unassigned, add to unassigned */
        if (!exists) rpDispatch({ type: "create", passenger: passenger });
      }
    }
    /**remove rides */
    for (let ride of originRides.values()) {
      if (!originDrivers.has(ride.getDriver().getEmail())) {
        /**move removed ride's passengers into the unassigned */
        for (let passenger of ride.getPassengers().values()) {
          if (originPassengers.has(passenger.getEmail()))
            rpDispatch({ type: "create", passenger: passenger });
        }
        rideCallback({ type: "delete", ride: ride });
      }
    }

    /**add new rides */
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
      for (let passenger of ride.getPassengers().values()) {
        rpDispatch({ type: "create", passenger: passenger });
      }
      ride.getPassengers().clear();
      rideCallback({
        type: "create",
        ride: ride,
      });
    }
  };

  return (
    <RideManagerContext.Provider
      value={{
        passengerCollection: originPassengers,
        passengerList: rpList,
        rideCollection: originRides,
        passengerCallback: rpDispatch,
        rideCallback: rideCallback,
      }}
    >
      <DndProvider backend={HTML5Backend}>
        <CustomDragLayer />
        <div className="flex w-full flex-row justify-evenly">
          <div className="rounded-md border border-neutral-500 p-2">
            <h2>Ride Manager</h2>
            <button className="rounded-full border px-2" onClick={refreshRides}>
              Refresh
            </button>
            <button className="rounded-full border px-2" onClick={clearRides}>
              Clear All Rides
            </button>
            <div className="flex flex-row">
              <div className="rounded-md border border-cyan-500 bg-cyan-50 p-2 dark:bg-cyan-950">
                <div className="flex flex-row place-content-between">
                  <span className="rounded-full bg-cyan-500 px-1">
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
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Colleges">
                        {Object.values(College).map((option) => (
                          <option key={option} value={option}>
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
                          " border-neutral-500 text-neutral-500")
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
              <div className="rounded-md border border-orange-500 bg-orange-50 p-2 dark:bg-orange-950">
                <div className="flex flex-row place-content-between">
                  <span className="rounded-full bg-orange-500 px-1">
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
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Colleges">
                        {Object.values(College).map((option) => (
                          <option key={option} value={option}>
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
                          " border-neutral-500 text-neutral-500")
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
