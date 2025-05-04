import { useContext, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { GroupOrganizerContext } from "./context";
import { AssignableDragItem, DNDType } from "./draganddrop";
import { Assignable } from "./Assignable";
import { Group } from "./Group";

const AssignableComponent = ({
  data,
  deleteAssignable,
  index,
  selectedAssignables,
  handleSelect,
  clearSelect,
}: {
  data: Assignable;
  deleteAssignable: (assignable: Assignable) => void;
  index: number;
  selectedAssignables: Array<string>;
  handleSelect: (index: number, shiftKey: boolean, ctrlKey: boolean) => void;
  clearSelect: () => void;
}) => {
  const [{ isDragging }, drag, dragPreview] = useDrag<
    AssignableDragItem,
    void,
    { isDragging: boolean }
  >(
    () => ({
      type: DNDType.ASSIGNABLE,
      item: {
        id:
          selectedAssignables.length > 0 ? selectedAssignables : [data.getID()],
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        clearSelect();
      },
    }),
    [selectedAssignables]
  );
  const dragRef = useRef<HTMLDivElement>(null);
  drag(dragRef);
  dragPreview(getEmptyImage());

  const selected = selectedAssignables.includes(data.getID());

  return (
    <div
      className={
        "my-1 max-w-[496px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800 " +
        (isDragging && "opacity-50") +
        (selected && " border-4 border-amber-500")
      }
      ref={dragRef}
      onClick={(e) => handleSelect(index, e.shiftKey, e.ctrlKey)}
    >
      <ul>
        <div className="flex flex-row place-content-between font-bold">
          {data.getName()}
          <button
            className="rounded-sm border px-1"
            onClick={() => deleteAssignable(data)}
          >
            &times;
          </button>
        </div>
        <ul className="flex flex-row place-content-between text-xs italic">
          <li>{data.getID()}</li>
          <li>{data.getLeader() && "Leader"}</li>
        </ul>
        <ul className="m-1">
          {data.getContact() &&
            Array.from(data.getContact() as Map<string, string>)
              .filter(([, value]) => value)
              .map(([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  <span>{value}</span>
                </li>
              ))}
          {data.getAvailability() &&
            Array.from(
              data.getAvailability() as Map<
                string,
                string | number | boolean | Array<string>
              >
            )
              .filter(
                ([, value]) =>
                  (Array.isArray(value) && value.length > 0) || value
              )
              .map(([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>{value}</span>
                  )}
                </li>
              ))}
          {data.getLocation() &&
            Array.from(
              data.getLocation() as Map<
                string,
                string | number | boolean | Array<string>
              >
            )
              .filter(
                ([, value]) =>
                  (Array.isArray(value) && value.length > 0) || value
              )
              .map(([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>{value}</span>
                  )}
                </li>
              ))}
          {data.getAffinity() &&
            Array.from(
              data.getAffinity() as Map<
                string,
                string | number | boolean | Array<string>
              >
            )
              .filter(
                ([, value]) =>
                  (Array.isArray(value) && value.length > 0) || value
              )
              .map(([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>{value}</span>
                  )}
                </li>
              ))}
          {data.getMiscellaneous() &&
            Array.from(
              data.getMiscellaneous() as Map<
                string,
                string | number | boolean | Array<string>
              >
            )
              .filter(
                ([, value]) =>
                  (Array.isArray(value) && value.length > 0) || value
              )
              .map(([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>{value}</span>
                  )}
                </li>
              ))}
        </ul>
        {data.getSize() != undefined && (
          <li className="m-1 flex flex-row place-content-between gap-1">
            <span>Size:</span>
            <span>{data.getSize()}</span>
          </li>
        )}
        {data.getNotes() && (
          <textarea
            className="m-1 rounded-sm border bg-cyan-300 dark:bg-cyan-700"
            disabled
            defaultValue={data.getNotes()}
          />
        )}
      </ul>
    </div>
  );
};

export const AssignableArrayComponent = ({
  assignableArray,
  deleteAssignable,
  removeGroupMember,
}: {
  assignableArray: Array<string>;
  deleteAssignable: (assignable: Assignable) => void;
  removeGroupMember: (group: Group, member: Assignable) => void;
}) => {
  const goContext = useContext(GroupOrganizerContext);
  if (!goContext) {
    throw new Error(
      "RM_PassengerComponent must be used within a RideManagerProvider"
    );
  }
  const { assignableCollection, unassignedCollection, groupCollection } =
    goContext;

  const [selectedAssignables, setSelectedAssignables] = useState<Array<string>>(
    new Array<string>()
  );
  const [prevSelectedIndex, setPrevSelectedIndex] = useState<number>(-1);
  const clearSelect = () => {
    setSelectedAssignables(new Array<string>());
    setPrevSelectedIndex(-1);
  };
  const handleSelect = (index: number, shiftKey: boolean, ctrlKey: boolean) => {
    let newSelectedAssignables = new Array<string>();
    const newSelection = assignableArray[index];
    const newPrevSelectedIndex = index;
    if (shiftKey) {
      if (prevSelectedIndex >= index) {
        newSelectedAssignables = [
          ...selectedAssignables,
          ...assignableArray.slice(index, prevSelectedIndex),
        ];
      } else {
        newSelectedAssignables = [
          ...selectedAssignables,
          ...assignableArray.slice(prevSelectedIndex + 1, index + 1),
        ];
      }
    } else if (ctrlKey /* || selectMode */) {
      if (!selectedAssignables.includes(newSelection))
        newSelectedAssignables = [...selectedAssignables, newSelection];
      else
        newSelectedAssignables = selectedAssignables.filter(
          (a) => a !== newSelection
        );
    } else {
      if (!selectedAssignables.includes(newSelection))
        newSelectedAssignables.push(newSelection);
    }
    setSelectedAssignables(
      assignableArray
        ? assignableArray.filter((a) => newSelectedAssignables.includes(a))
        : new Array<string>()
    );
    setPrevSelectedIndex(newPrevSelectedIndex);
  };

  const [{ canDrop, isOver }, drop] = useDrop<
    AssignableDragItem,
    void,
    { canDrop: boolean; isOver: boolean }
  >(
    () => ({
      accept: DNDType.ASSIGNABLE,
      drop: (item) => {
        for (const id of item.id) {
          const assignable = assignableCollection.get(id);
          if (!!assignable) {
            for (const group of groupCollection.values()) {
              if (group.getAllMembers().has(assignable.getID())) {
                removeGroupMember(group, assignable);
              }
            }
          }
        }
      },
      canDrop: (item) =>
        item.id.every(
          (id) => !unassignedCollection.has(id) && !assignableArray.includes(id)
        ),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [
      assignableArray,
      assignableCollection,
      groupCollection,
      unassignedCollection,
      removeGroupMember,
    ]
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
      <ul className="m-1 max-h-[70svh] overflow-auto">
        {assignableArray.length > 0 ? (
          assignableArray.map((value, index) => (
            <li key={value}>
              <AssignableComponent
                data={
                  assignableCollection.get(value) ||
                  new Assignable({ id: value, name: "!ERROR!" })
                }
                deleteAssignable={deleteAssignable}
                index={index}
                selectedAssignables={selectedAssignables}
                handleSelect={handleSelect}
                clearSelect={clearSelect}
              />
            </li>
          ))
        ) : (
          <li className="text-center">Empty</li>
        )}
      </ul>
    </div>
  );
};
