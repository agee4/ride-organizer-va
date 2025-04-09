// ride_manager.tsx

import {
  ActionDispatch,
  ChangeEvent,
  useEffect,
  useReducer,
  useState,
} from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { College, RideTimes } from "../../_classes/person";
import { Driver } from "../../_classes/driver";
import {
  filterPassengers,
  Passenger,
  passengerReducer,
  PassengerSort,
  sortPassengers,
  Year,
} from "../../_classes/passenger";
import {
  filterRides,
  Ride,
  RideReducerAction,
  RideSort,
  sortRides,
} from "../../_classes/ride";
import { RideManagerContext } from "./rmcontext";
import { RM_RideComponent } from "./rm_ridecomponent";
import { RM_UnassignedListComponent } from "./rm_unassignedcomponent";
import { PassengerDragLayer } from "./passengerdraglayer";

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
  const [unassignedCollection, unassignedDispatch] = useReducer(
    passengerReducer,
    new Map<string, Passenger>()
  );
  const [unassignedList, setUnassignedList] = useState<Passenger[]>([]);
  const [unassignedSort, setUnassignedSort] = useState<PassengerSort>();
  const updateUnassignedSort = (event: ChangeEvent<HTMLSelectElement>) => {
    setUnassignedSort(
      Object.values(PassengerSort).includes(event.target.value as PassengerSort)
        ? (event.target.value as PassengerSort)
        : undefined
    );
  };
  const [unassignedReverse, setUnassignedReverse] = useState<boolean>(false);
  const toggleUnassignedReverse = () => {
    setUnassignedReverse(!unassignedReverse);
  };
  const [showUnassignedFilter, setShowUnassignedFilter] =
    useState<boolean>(false);
  const toggleShowUnassignedFilter = () => {
    setShowUnassignedFilter(!showUnassignedFilter);
  };
  const [unassignedFilter, setUnassignedFilter] = useState<
    (RideTimes | College)[]
  >([]);
  const updateUnassignedFilter = (event: ChangeEvent<HTMLSelectElement>) => {
    setUnassignedFilter(
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
    /**remove passengers, even if assigned a ride */
    for (const unassigned of unassignedCollection.values()) {
      if (!originPassengers.has(unassigned.getEmail()))
        unassignedDispatch({ type: "delete", passenger: unassigned });
    }
    for (const ride of originRides.values()) {
      for (const ridepassenger of ride.getPassengers().values()) {
        if (!originPassengers.has(ridepassenger.getEmail()))
          ride.getPassengers().delete(ridepassenger.getEmail());
      }
    }
    /**add new passengers */
    for (const passenger of originPassengers.values()) {
      /**check if passenger not in unassigned */
      if (!unassignedCollection.has(passenger.getEmail())) {
        /**check if passenger not in a ride */
        let exists = false;
        for (const ride of originRides.values()) {
          if (ride.getPassengers().has(passenger.getEmail())) {
            exists = true;
            /**update passenger if necessary */
            if (
              !ride.getPassengers().get(passenger.getEmail())?.equals(passenger)
            )
              ride.getPassengers().set(passenger.getEmail(), passenger);
            break;
          }
        }
        /**if passenger not in a ride & not in unassigned, add to unassigned */
        if (!exists)
          unassignedDispatch({ type: "create", passenger: passenger });
      } else if (
        /**update passenger if necessary */
        !unassignedCollection.get(passenger.getEmail())?.equals(passenger)
      )
        unassignedDispatch({ type: "create", passenger: passenger });
    }
    /**remove rides */
    for (const ride of originRides.values()) {
      if (!originDrivers.has(ride.getDriver().getEmail())) {
        /**move removed ride's passengers into the unassigned */
        for (const passenger of ride.getPassengers().values()) {
          if (originPassengers.has(passenger.getEmail()))
            unassignedDispatch({ type: "create", passenger: passenger });
        }
        rideCallback({ type: "delete", ride: ride });
      }
    }

    /**add new rides */
    for (const driver of originDrivers.values()) {
      if (!originRides.has(driver.getEmail())) {
        rideCallback({
          type: "create",
          ride: new Ride({
            driver: driver,
            passengers: new Map<string, Passenger>(),
          }),
        });
      } else if (
        !originRides.get(driver.getEmail())?.getDriver().equals(driver)
      ) {
        rideCallback({
          type: "create",
          ride: new Ride({
            driver: driver,
            passengers:
              originRides.get(driver.getEmail())?.getPassengers() ||
              new Map<string, Passenger>(),
          }),
        });
      }
    }
  }, [
    originPassengers,
    originDrivers,
    originRides,
    rideCallback,
    unassignedCollection,
  ]);
  /**sort and filter unassigned passengers */
  useEffect(() => {
    setUnassignedList(
      unassignedReverse
        ? sortPassengers(
            filterPassengers(
              [...unassignedCollection.values()],
              unassignedFilter
            ),
            unassignedSort
          ).reverse()
        : sortPassengers(
            filterPassengers(
              [...unassignedCollection.values()],
              unassignedFilter
            ),
            unassignedSort
          )
    );
  }, [
    unassignedCollection,
    unassignedSort,
    unassignedReverse,
    unassignedFilter,
  ]);
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

  const clearRides = () => {
    for (const ride of rideList) {
      for (const passenger of ride.getPassengers().values()) {
        unassignedDispatch({ type: "create", passenger: passenger });
      }
      ride.getPassengers().clear();
      rideCallback({
        type: "create",
        ride: ride,
      });
    }
  };
  const autoRides = (filter: RideTimes | RideTimes[]) => {
    const newUnassignedCollection = new Map(unassignedCollection);
    const newRideCollection = new Map(originRides);
    const autoRideHelper = (filter: RideTimes, backup?: boolean) => {
      for (const unassigned of unassignedList.filter((p) =>
        (backup ? p.getBackup() : p.getRides()).includes(filter)
      )) {
        for (const ride of rideList.filter((r) =>
          r.getDriver().getRides().includes(filter)
        )) {
          const currentride = newRideCollection.get(
            ride.getDriver().getEmail()
          );
          if (
            currentride?.validate(unassigned) &&
            currentride.getPassengers().size + 1 <=
              currentride.getDriver().getSeats()
          ) {
            ride.addPassenger(unassigned);
            newRideCollection.set(ride.getDriver().getEmail(), ride);
            newUnassignedCollection.delete(unassigned.getEmail());
            break;
          }
        }
      }
    };

    if (filter instanceof Array) {
      for (const f of filter) autoRideHelper(f);
      for (const f of filter) autoRideHelper(f, true);
    } else autoRideHelper(filter);

    for (const removedpassenger of unassignedList.filter(
      (p) => !newUnassignedCollection.has(p.getEmail())
    )) {
      unassignedDispatch({ type: "delete", passenger: removedpassenger });
    }
    rideCallback({ type: "set", rides: newRideCollection });
  };

  return (
    <RideManagerContext.Provider
      value={{
        unassignedCollection: originPassengers,
        unassignedList: unassignedList,
        rideCollection: originRides,
        unassignedCallback: unassignedDispatch,
        rideCallback: rideCallback,
      }}
    >
      <DndProvider backend={HTML5Backend}>
        <PassengerDragLayer />
        <div className="rounded-md border border-neutral-500 p-2">
          <h2>Ride Manager</h2>
          <div>
            <button className="rounded-full border px-2" onClick={clearRides}>
              Clear Rides
            </button>
            <button
              className="rounded-full border px-2"
              onClick={() =>
                autoRides([RideTimes.FIRST, RideTimes.SECOND, RideTimes.THIRD])
              }
            >
              Auto Sunday
            </button>
            <button
              className="rounded-full border px-2"
              onClick={() => autoRides(RideTimes.FRIDAY)}
            >
              Auto Friday
            </button>
          </div>
          <div className="flex flex-row">
            <div className="rounded-md border border-cyan-500 bg-cyan-50 p-2 dark:bg-cyan-950">
              <div className="flex flex-col place-content-between sm:flex-row">
                <span className="rounded-full bg-cyan-500 px-1 text-center">
                  {unassignedList.length}/{unassignedCollection.size}/
                  {originPassengers.size}
                </span>
                <div className="flex flex-row place-content-end">
                  <select
                    className={
                      "rounded-sm border " +
                      (!unassignedSort && "text-neutral-500")
                    }
                    defaultValue={unassignedSort}
                    onChange={updateUnassignedSort}
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
                    onClick={toggleUnassignedReverse}
                  >
                    {unassignedReverse ? (
                      <span>&uarr;</span>
                    ) : (
                      <span>&darr;</span>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex flex-row place-content-end">
                {showUnassignedFilter ? (
                  <select
                    className={
                      "rounded-sm border " +
                      (!unassignedFilter && "text-neutral-500")
                    }
                    defaultValue={unassignedFilter}
                    onChange={updateUnassignedFilter}
                    multiple
                  >
                    <optgroup label="Ride Time">
                      {Object.values(RideTimes).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="College">
                      {Object.values(College).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Year">
                      {Object.values(Year).map((option) => (
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
                      (unassignedFilter.length < 1 &&
                        " border-neutral-500 text-neutral-500")
                    }
                    onClick={toggleShowUnassignedFilter}
                  >
                    {unassignedFilter.length < 1
                      ? "-Filter-"
                      : unassignedFilter}
                  </p>
                )}
                <button
                  className="ml-1 font-bold text-neutral-500"
                  onClick={toggleShowUnassignedFilter}
                >
                  {showUnassignedFilter ? (
                    <span>&times;</span>
                  ) : (
                    <span>&hellip;</span>
                  )}
                </button>
              </div>
              <RM_UnassignedListComponent />
            </div>
            <div className="rounded-md border border-orange-500 bg-orange-50 p-2 dark:bg-orange-950">
              <div className="flex flex-col place-content-between sm:flex-row">
                <span className="rounded-full bg-orange-500 px-1 text-center">
                  {rideList.length}/{originRides.size}
                </span>
                <div className="flex flex-row place-content-end">
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
                      "rounded-sm border " + (!rideFilter && "text-neutral-500")
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
              <ul className="m-1 h-[70svh] overflow-auto">
                {rideList.map((item) => (
                  <li key={item.getDriver().getEmail()}>
                    <RM_RideComponent data={item} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DndProvider>
    </RideManagerContext.Provider>
  );
};
