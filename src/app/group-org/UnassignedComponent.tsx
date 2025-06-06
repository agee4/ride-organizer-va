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
import { Group, GroupManagerAction } from "./Group";
import { useClickOutside } from "./helpers";

const UnassignedComponent = ({
  assignableID,
  assignableCollection,
  index,
  selectedAssignables,
  handleSelect,
  clearSelect,
  selectMode,
}: {
  assignableID: string;
  assignableCollection: Map<string, Assignable>;
  index: number;
  selectedAssignables: Array<string>;
  handleSelect: (
    index: number,
    shiftKey: boolean,
    ctrlKey: boolean,
    selectMode: boolean
  ) => void;
  clearSelect: () => void;
  selectMode: boolean;
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
  const [showAttributes, setShowAttributes] = useState<boolean>(false);

  return (
    <div
      className={
        "flex max-w-[496px] flex-col-reverse overflow-hidden rounded-md bg-cyan-200 select-none min-[21rem]:flex-row dark:bg-cyan-800" +
        (isDragging ? " opacity-50" : "") +
        (selected ? " border-4 border-amber-500" : "")
      }
    >
      <div
        className={
          "grid h-4 place-content-center min-[21rem]:h-auto min-[21rem]:w-8" +
          (selected ? " bg-amber-500" : " bg-cyan-300 dark:bg-cyan-700")
        }
        ref={dragRef}
        onClick={(e) => handleSelect(index, e.shiftKey, e.ctrlKey, selectMode)}
      >
        {selected ? <span>&#9745;</span> : <span>&#9744;</span>}
      </div>
      <div
        className="w-full max-w-[90%] p-2"
        onClick={() => setShowAttributes(!showAttributes)}
      >
        <div
          className="w-fit max-w-[80%] truncate font-bold"
          title={data.getName()}
        >
          {data.getName()}
        </div>
        <div className="flex w-fit max-w-[80%] flex-row flex-wrap place-content-between text-xs italic">
          <span className="truncate" title={assignableID}>
            {assignableID}
          </span>
          <span>{data.getLeader() && "Leader"}</span>
        </div>
        {showAttributes && (
          <>
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
                    className="my-1 flex flex-row flex-wrap place-content-between gap-1 rounded-md bg-cyan-300 p-1 dark:bg-cyan-700"
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
                          <span className="truncate">{value}</span>
                        )}
                      </>
                    )}
                  </div>
                ))}
            {data.getSize() != undefined && (
              <div className="my-1 flex flex-row flex-wrap place-content-between gap-1 rounded-md bg-cyan-300 p-1 dark:bg-cyan-700">
                <span>Size:</span>
                <span>{data.getSize()}</span>
              </div>
            )}
            {data.getNotes() && (
              <textarea
                className="w-full rounded-sm border bg-cyan-300 dark:bg-cyan-700"
                disabled
                defaultValue={data.getNotes()}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const UnassignedArrayComponent = ({
  unassignedArray,
  assignableCollection,
  groupCollection,
  groupDispatch,
  selectMode,
}: {
  unassignedArray: Array<string>;
  assignableCollection: Map<string, Assignable>;
  groupCollection: Map<string, Group>;
  groupDispatch: (action: GroupManagerAction) => void;
  selectMode: boolean;
}) => {
  const [selectedAssignables, setSelectedAssignables] = useState<Array<string>>(
    new Array<string>()
  );
  const [prevSelectedIndex, setPrevSelectedIndex] = useState<number>(-1);
  const clearSelect = () => {
    setSelectedAssignables(new Array<string>());
    setPrevSelectedIndex(-1);
  };
  const handleSelect = (
    index: number,
    shiftKey: boolean,
    ctrlKey: boolean,
    select: boolean
  ) => {
    handleSelectHelper(
      index,
      unassignedArray,
      prevSelectedIndex,
      selectedAssignables,
      setSelectedAssignables,
      setPrevSelectedIndex,
      shiftKey,
      ctrlKey,
      select
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
                groupDispatch({
                  type: "removemember",
                  groupID: group.getID(),
                  memberID: id,
                });
              }
            }
          }
        }
      },
      canDrop: (item) => item.id.every((id) => !unassignedArray.includes(id)),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [unassignedArray, assignableCollection, groupCollection]
  );
  const dropRef = useDNDRef(drop);
  useClickOutside(dropRef, clearSelect);

  return (
    <div className="m-1 max-h-[70svh] overflow-auto">
      <div
        className={
          "size-f flex flex-col gap-1 rounded-md p-1" +
          (isOver && canDrop ? " bg-amber-500" : " bg-neutral-500")
        }
        ref={dropRef}
      >
        {unassignedArray.length > 0 ? (
          unassignedArray.map((value, index) => (
            <UnassignedComponent
              assignableID={value}
              assignableCollection={assignableCollection}
              index={index}
              selectedAssignables={selectedAssignables}
              handleSelect={handleSelect}
              clearSelect={clearSelect}
              selectMode={selectMode}
              key={value}
            />
          ))
        ) : (
          <div className="text-center">Empty</div>
        )}
      </div>
    </div>
  );
};
