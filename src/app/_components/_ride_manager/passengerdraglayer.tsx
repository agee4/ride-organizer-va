import { useContext } from "react";
import { RideManagerContext } from "./rmcontext";
import { useDragLayer } from "react-dnd";
import {
  Passenger,
  PassengerDisplay,
  Year,
  YearTag,
} from "@/app/_classes/passenger";
import { College, CollegeTag } from "@/app/_classes/person";

export const PassengerDragLayer = () => {
  const rmContext = useContext(RideManagerContext);
  if (!rmContext) {
    throw new Error(
      "RM_RPListComponent must be used within a RideManagerProvider"
    );
  }
  const { unassignedCollection: unassignedCollection } = rmContext;

  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  const data =
    unassignedCollection.get(item.emails[0]) ||
    new Passenger({
      email: "",
      name: "",
      address: "",
      rides: [],
      college: College.OTHER,
      year: Year.OTHER,
      phone: "",
      notes: "",
    });
  const display = [
    PassengerDisplay.NAME,
    PassengerDisplay.ADDRESS,
    PassengerDisplay.COLLEGE,
    PassengerDisplay.YEAR,
    PassengerDisplay.NOTES,
  ];

  return item.emails.length == 1 ? (
    <div
      className="fixed top-0 left-0 z-50 h-full w-full"
      style={{
        pointerEvents: "none",
        transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
      }}
    >
      <div className="max-w-[248px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
        <div className="flex flex-row place-content-between">
          {(!display || display.includes(PassengerDisplay.NAME)) && (
            <h3 className="m-1 text-lg font-bold">{data.getName()}</h3>
          )}
        </div>
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
      </div>
    </div>
  ) : (
    <div
      className="fixed top-0 left-0 z-50 h-full w-full"
      style={{
        pointerEvents: "none",
        transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
      }}
    >
      <div className="w-[248px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
        <div className="flex flex-row place-content-between">
          {(!display || display.includes(PassengerDisplay.NAME)) && (
            <h3 className="m-1 text-lg font-bold">{data.getName()}</h3>
          )}
        </div>
      </div>
      <div className="fixed top-10 left-2 -z-10 w-[232px] rounded-md bg-cyan-300 pl-2 dark:bg-cyan-900">
        &hellip;
      </div>
      <div className="fixed top-10 left-56 rounded-full bg-amber-500 px-1 dark:text-black">
        {item.emails.length}
      </div>
    </div>
  );
};
