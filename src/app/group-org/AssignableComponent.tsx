import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import {
  AssignableDragItem,
  DNDType,
  handleSelectHelper,
  useDNDRef,
} from "./draganddrop";
import { Assignable } from "./Assignable";
import { Group } from "./Group";

export const AssignableComponent = ({
  assignableID,
  assignableCollection,
  deleteAssignable,
  index,
  selectedAssignables,
  handleSelect,
  clearSelect,
}: {
  assignableID: string;
  assignableCollection: Map<string, Assignable>;
  deleteAssignable: (assignable: string) => void;
  index: number;
  selectedAssignables: Array<string>;
  handleSelect: (index: number, shiftKey: boolean, ctrlKey: boolean) => void;
  clearSelect: () => void;
}) => {
  const data =
    assignableCollection.get(assignableID) ||
    new Assignable({ id: assignableID, name: "!ERROR!" });

  const [{ isDragging }, drag, dragPreview] = useDrag<
    AssignableDragItem,
    void,
    { isDragging: boolean }
  >(
    () => ({
      type: DNDType.ASSIGNABLE,
      item: {
        id:
          selectedAssignables.length > 0 ? selectedAssignables : [assignableID],
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
  const dragRef = useDNDRef(drag);
  dragPreview(getEmptyImage());

  const selected = selectedAssignables.includes(assignableID);

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
      <div className="flex flex-row place-content-between font-bold">
        {data.getName()}
        <button
          className="rounded-sm border px-1"
          onClick={() => deleteAssignable(assignableID)}
        >
          &times;
        </button>
      </div>
      <div className="flex flex-row place-content-between text-xs italic">
        <span>{assignableID}</span>
        <span>{data.getLeader() && "Leader"}</span>
      </div>
      {data.getAttributes() &&
        Array.from(
          data.getAttributes() as Map<
            string,
            string | number | boolean | Array<string>
          >
        )
          .filter(([, value]) =>
            Array.isArray(value) ? value.length > 0 : value
          )
          .map(([key, value]) => (
            <div
              className="m-1 flex flex-row flex-wrap place-content-between gap-1 rounded-md bg-cyan-300 p-1 dark:bg-cyan-700"
              key={key}
            >
              {typeof value == "boolean" ? (
                <span>{key}</span>
              ) : (
                <>
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
                </>
              )}
            </div>
          ))}
      {data.getSize() != undefined && (
        <div className="m-1 flex flex-row flex-wrap place-content-between gap-1 rounded-md bg-cyan-300 p-1 dark:bg-cyan-700">
          <span>Size:</span>
          <span>{data.getSize()}</span>
        </div>
      )}
      {data.getNotes() && (
        <textarea
          className="m-1 w-full rounded-sm border bg-cyan-300 dark:bg-cyan-700"
          disabled
          defaultValue={data.getNotes()}
        />
      )}
    </div>
  );
};

export const AssignableArrayComponent = ({
  assignableArray,
  assignableCollection,
  unassignedCollection,
  groupCollection,
  deleteAssignable,
  removeGroupMember,
}: {
  assignableArray: Array<string>;
  assignableCollection: Map<string, Assignable>;
  unassignedCollection: Set<string>;
  groupCollection: Map<string, Group>;
  deleteAssignable: (assignable: string) => void;
  removeGroupMember: (groupID: string, memberID: string) => void;
}) => {
  const [selectedAssignables, setSelectedAssignables] = useState<Array<string>>(
    new Array<string>()
  );
  const [prevSelectedIndex, setPrevSelectedIndex] = useState<number>(-1);
  const clearSelect = () => {
    setSelectedAssignables(new Array<string>());
    setPrevSelectedIndex(-1);
  };
  const handleSelect = (index: number, shiftKey: boolean, ctrlKey: boolean) => {
    handleSelectHelper(
      index,
      shiftKey,
      ctrlKey,
      assignableArray,
      prevSelectedIndex,
      selectedAssignables,
      setSelectedAssignables,
      setPrevSelectedIndex
    );
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
                removeGroupMember(group.getID(), id);
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
  const dropRef = useDNDRef(drop);

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
                assignableID={value}
                assignableCollection={assignableCollection}
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
