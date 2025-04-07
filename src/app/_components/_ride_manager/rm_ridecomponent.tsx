// rm_ridecomponent.tsx

import { useContext, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { College, CollegeTag } from "@/app/_classes/person";
import { Passenger, PassengerDisplay } from "@/app/_classes/passenger";
import { Ride } from "@/app/_classes/ride";
import { RideManagerContext } from "./rmcontext";
import { PassengerDragItem, DNDType } from "@/app/_classes/ItemTypes";
import { getEmptyImage } from "react-dnd-html5-backend";

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
  const { unassignedCallback: passengerCallback, rideCallback } = rmContext;

  const [showDetail, setShowDetail] = useState<boolean>(true);
  const toggleDetail = () => {
    setShowDetail(!showDetail);
  };

  const [{ isDragging }, drag, dragPreview] = useDrag<
    PassengerDragItem,
    void,
    { isDragging: boolean }
  >(() => ({
    type: DNDType.PASSENGER,
    item: { email: data.getEmail() },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  const dragRef = useRef<HTMLDivElement>(null);
  drag(dragRef);
  dragPreview(getEmptyImage());

  const removePassenger = () => {
    passengerCallback({ type: "create", passenger: data });
    ride.getPassengers().delete(data.getEmail());
    rideCallback({ type: "create", ride: ride });
  };

  return (
    <div
      className={
        "my-1 max-w-[40vw] rounded-md p-2 sm:max-w-[496px] " +
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
                    className="w-[38vw] rounded-md bg-cyan-400 p-1 dark:bg-cyan-600"
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

export const RM_RideComponent = ({ data }: { data: Ride }) => {
  const rmContext = useContext(RideManagerContext);
  if (!rmContext) {
    throw new Error(
      "RM_PassengerComponent must be used within a RideManagerProvider"
    );
  }
  const {
    unassignedCollection: unassignedCollection,
    unassignedList: unassignedList,
    unassignedCallback: unassignedCallback,
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
    PassengerDragItem,
    void,
    { canDrop: boolean; isOver: boolean }
  >(
    () => ({
      accept: DNDType.PASSENGER,
      drop: (item) => {
        const dragpassenger = unassignedCollection.get(item.email);
        if (!!dragpassenger) {
          addPassengerHelper(dragpassenger);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [unassignedCollection]
  );
  const dropRef = useRef<HTMLDivElement>(null);
  drop(dropRef);

  const addPassengerListShift = () => {
    /**get passenger from top of unassigned list */
    const nextpassenger = [...unassignedList].shift();
    if (!!nextpassenger) {
      addPassengerHelper(nextpassenger);
    }
  };

  const addPassengerHelper = (passenger: Passenger) => {
    /**remove passenger from unassigned (if possible) */
    unassignedCallback({
      type: "delete",
      passenger: passenger,
    });
    /**remove passenger from previous rides (if possible) */
    for (const ride of rideCollection.values()) {
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
                  className="w-[38vw] rounded-md bg-orange-400 p-1 dark:bg-orange-600"
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
