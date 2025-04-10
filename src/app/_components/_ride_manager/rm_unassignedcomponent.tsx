// rm_unassignedcomponent.tsx

import { useContext, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { RideManagerContext } from "./rmcontext";
import { College, CollegeTag } from "@/app/_classes/person";
import { Passenger, PassengerDisplay, YearTag } from "@/app/_classes/passenger";
import { PassengerDragItem, DNDType } from "@/app/_classes/ItemTypes";
import { getEmptyImage } from "react-dnd-html5-backend";

const RM_UnassignedComponent = ({
  data,
  index,
  selectedPassengers,
  handleSelect,
  clearSelect,
  display,
}: {
  data: Passenger;
  index: number;
  selectedPassengers: Passenger[];
  handleSelect: (index: number, shiftKey: boolean, ctrlKey: boolean) => void;
  clearSelect: () => void;
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
  >(
    () => ({
      type: DNDType.PASSENGER,
      item: {
        emails:
          selectedPassengers.length > 0
            ? selectedPassengers.map((passenger) => passenger.getEmail())
            : [data.getEmail()],
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        clearSelect();
      },
    }),
    [selectedPassengers]
  );
  const dragRef = useRef<HTMLDivElement>(null);
  drag(dragRef);
  dragPreview(getEmptyImage());

  const selected = selectedPassengers.find(
    (p) => data.getEmail() === p.getEmail()
  );

  return (
    <div
      className={
        "my-1 max-w-[40vw] rounded-md bg-cyan-200 p-2 sm:max-w-[496px] dark:bg-cyan-800 " +
        (isDragging && "opacity-50") +
        (selected && " border-4 border-amber-500")
      }
      ref={dragRef}
      onClick={(e) => handleSelect(index, e.shiftKey, e.ctrlKey)}
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
                    className="w-full rounded-md bg-cyan-400 p-1 dark:bg-cyan-600"
                    defaultValue={data.getNotes()}
                    readOnly
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
    selectMode,
  } = rmContext;
  const [selectedPassengers, setSelectedPassengers] = useState<Passenger[]>([]);
  const [prevSelectedIndex, setPrevSelectedIndex] = useState<number>(-1);
  const clearSelect = () => {
    setSelectedPassengers([]);
    setPrevSelectedIndex(-1);
  };
  const handleSelect = (index: number, shiftKey: boolean, ctrlKey: boolean) => {
    let newSelectedPassengers = new Array<Passenger>();
    const newSelection = unassignedList[index];
    const newPrevSelectedIndex = index;
    if (shiftKey) {
      if (prevSelectedIndex >= index) {
        newSelectedPassengers = [
          ...selectedPassengers,
          ...unassignedList.slice(index, prevSelectedIndex),
        ];
      } else {
        newSelectedPassengers = [
          ...selectedPassengers,
          ...unassignedList.slice(prevSelectedIndex + 1, index + 1),
        ];
      }
    } else if (ctrlKey || selectMode) {
      if (!selectedPassengers.find((p) => p.equals(newSelection)))
        newSelectedPassengers = [...selectedPassengers, newSelection];
      else
        newSelectedPassengers = selectedPassengers.filter(
          (p) => !p.equals(newSelection)
        );
    } else {
      if (!selectedPassengers.find((p) => p.equals(newSelection)))
        newSelectedPassengers.push(newSelection);
    }
    setSelectedPassengers(
      unassignedList
        ? unassignedList.filter((p) =>
            newSelectedPassengers.find((s) => s.equals(p))
          )
        : []
    );
    setPrevSelectedIndex(newPrevSelectedIndex);
  };

  const [{ canDrop, isOver }, drop] = useDrop<
    PassengerDragItem,
    void,
    { canDrop: boolean; isOver: boolean }
  >(
    () => ({
      accept: DNDType.PASSENGER,
      drop: (item) => {
        for (const email of item.emails) {
          const dragpassenger = unassignedCollection.get(email);
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
        "size-f rounded-md " +
        (isOver && canDrop ? "bg-amber-500" : "bg-neutral-500")
      }
      ref={dropRef}
    >
      <ul className="m-1 h-[70svh] overflow-auto">
        {unassignedList.length > 0 ? (
          unassignedList.map((item, index) => (
            <li key={item.getEmail()}>
              <RM_UnassignedComponent
                data={item}
                index={index}
                selectedPassengers={selectedPassengers}
                handleSelect={handleSelect}
                clearSelect={clearSelect}
              />
            </li>
          ))
        ) : (
          <li className="text-center">No Passengers</li>
        )}
      </ul>
    </div>
  );
};
