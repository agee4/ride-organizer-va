// rm_unassignedcomponent.tsx

import { useContext, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { RideManagerContext } from "./rmcontext";
import { College, CollegeTag } from "@/app/_classes/person";
import { Passenger, PassengerDisplay, YearTag } from "@/app/_classes/passenger";
import { PassengerDragItem, DNDType } from "@/app/_classes/ItemTypes";


const RM_UnassignedComponent = ({
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

export const RM_UnassignedListComponent = () => {
  const rmContext = useContext(RideManagerContext);
  if (!rmContext) {
    throw new Error(
      "RM_RPListComponent must be used within a RideManagerProvider"
    );
  }
  const {
    unassignedCollection: unassignedCollection,
    unassignedList: unassignedList,
    unassignedCallback: unassignedCallback,
    rideCollection,
    rideCallback,
  } = rmContext;

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
          for (const ride of rideCollection.values()) {
            if (ride.getPassengers().has(dragpassenger.getEmail())) {
              ride.getPassengers().delete(dragpassenger.getEmail());
              rideCallback({ type: "create", ride: ride });
            }
          }
          unassignedCallback({
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
    [unassignedCollection, rideCollection]
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
        {unassignedList.map((item) => (
          <li key={item.getEmail()}>
            <RM_UnassignedComponent data={item} />
          </li>
        ))}
      </ul>
    </div>
  );
};