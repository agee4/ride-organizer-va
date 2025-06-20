import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import {
  AssignableDragItem,
  DNDType,
  handleSelectHelper,
  useDNDRef,
} from "./draganddrop";
import { Assignable } from "../../../_classes/Assignable";
import { Group, GroupManagerAction } from "../../../_classes/Group";
import { useClickOutside } from "../../../_functions/helpers";
import { useModal } from "../../modal";

export const GroupComponent = ({
  groupID,
  groupCollection,
  assignableCollection,
  addGroupMember,
  groupDispatch,
  selectMode,
  unassignedCollection,
}: {
  groupID: string;
  groupCollection: Map<string, Group>;
  assignableCollection: Map<string, Assignable>;
  addGroupMember: (groupID: string, memberID?: string) => void;
  groupDispatch: (action: GroupManagerAction) => void;
  selectMode: boolean;
  unassignedCollection: Set<string>;
}) => {
  const data = groupCollection.get(groupID) || new Group({ id: "!ERROR!" });
  const assignableArray = Array.from(data.getAllMembers());
  const size = data.getSize() || 0;
  const leader = data.getLeader();

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
      assignableArray,
      prevSelectedIndex,
      selectedAssignables,
      setSelectedAssignables,
      setPrevSelectedIndex,
      shiftKey,
      ctrlKey,
      selectMode
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
        for (const itemID of item.id) {
          addGroupMember(groupID, itemID);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
      canDrop: (item) =>
        /**ensure this group can fit all DAs (dragged assignables),
         * either because the group has no size cap
         * or because the amount of DAs do not
         * overfill the size cap of the group
         */
        (data.getSize() == undefined ||
          size >= data.getAllMembers().size + item.id.length) &&
        /**ensure every DA meets the following: */
        item.id.every(
          (itemID) =>
            /**1 ~ DA is not already a member of this group */
            !data.getMember(itemID) &&
            /**2 ~ DA is not already a leader of a group */
            !groupCollection
              .values()
              .some((group) => group.getLeader() == itemID)
        ),
    }),
    [data, groupCollection, addGroupMember, size]
  );
  const dropRef = useDNDRef(drop);
  useClickOutside(dropRef, clearSelect);

  const removeMember = (memberID: string) => {
    groupDispatch({
      type: "removemember",
      groupID: groupID,
      memberID: memberID,
    });
  };

  const AddMemberComponent = () => {
    const unassignedArray = Array.from(unassignedCollection);

    const [selectedMembers, setSelectedMembers] = useState<Array<string>>(
      new Array<string>()
    );
    const [prevSelectedAddMemberIndex, setPrevSelectedAddMemberIndex] =
      useState<number>(-1);
    const handleAddMemberSelect = (
      index: number,
      shiftKey: boolean,
      ctrlKey: boolean
    ) => {
      handleSelectHelper(
        index,
        unassignedArray,
        prevSelectedAddMemberIndex,
        selectedMembers,
        setSelectedMembers,
        setPrevSelectedAddMemberIndex,
        shiftKey,
        ctrlKey,
        selectMode
      );
    };

    const addMembers = () => {
      if (
        selectedMembers.length > 0 &&
        selectedMembers.length <=
          (data.getSize() || 1000) - data.getAllMembers().size
      ) {
        for (const memberID of selectedMembers) {
          addGroupMember(groupID, memberID);
        }
        closeModal();
      }
    };

    const UnassignedMemberComponent = ({
      assignableID,
      assignableCollection,
      index,
      selectedAssignables,
      handleSelect,
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
      selectMode: boolean;
    }) => {
      const data =
        assignableCollection.get(assignableID) ||
        new Assignable({ id: assignableID, name: "!ERROR!" });

      const selected = selectedAssignables.includes(assignableID);
      const [showAttributes, setShowAttributes] = useState<boolean>(false);

      return (
        <div
          className={
            "flex flex-col-reverse overflow-hidden rounded-md bg-cyan-200 select-none min-[21rem]:flex-row dark:bg-cyan-800" +
            (selected ? " border-4 border-amber-500" : "")
          }
        >
          <div
            className="grid h-4 place-content-center bg-cyan-300 min-[21rem]:h-auto min-[21rem]:w-8 dark:bg-cyan-700"
            onClick={() => setShowAttributes(!showAttributes)}
          >
            &hellip;
          </div>
          <div
            className="w-full max-w-full p-2"
            onClick={(e) =>
              handleSelect(index, e.shiftKey, e.ctrlKey, selectMode)
            }
          >
            <div
              className="w-fit max-w-full truncate font-bold"
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
                  <div className="w-full rounded-sm border bg-cyan-300 dark:bg-cyan-700">
                    {data.getNotes()}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="rounded-md border bg-white p-1 text-center dark:bg-black">
        <div>Add Members</div>
        <button
          className="w-full rounded-sm border bg-neutral-400 disabled:hidden dark:bg-neutral-600"
          disabled={selectedMembers.length == 0}
          onClick={addMembers}
        >
          Add
        </button>
        {/**Unassigned List */}
        <div className="my-1 max-h-[70svh] overflow-auto">
          <div className="size-f flex flex-col gap-1 rounded-md p-1">
            {unassignedArray.length > 0 ? (
              unassignedArray.map((value, index) => (
                <UnassignedMemberComponent
                  assignableID={value}
                  assignableCollection={assignableCollection}
                  index={index}
                  selectedAssignables={selectedMembers}
                  handleSelect={handleAddMemberSelect}
                  selectMode={selectMode}
                  key={value}
                />
              ))
            ) : (
              <div className="text-center">Empty</div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const { Modal, setModal, closeModal } = useModal(null, true);

  return (
    <div
      className="h-full max-w-[496px] rounded-md bg-emerald-200 p-2 md:w-[160px] dark:bg-emerald-800"
      ref={dropRef}
    >
      {Modal}
      <div>
        <div className="flex flex-row place-content-between font-bold">
          <span
            className="truncate"
            title={
              data.getName() ||
              (leader && assignableCollection.get(leader)?.getName()) ||
              groupID
            }
          >
            {data.getName() ||
              (leader && assignableCollection.get(leader)?.getName()) ||
              groupID}
          </span>
          <button
            className="rounded-sm border px-1"
            onClick={() => groupDispatch({ type: "delete", groupID: groupID })}
          >
            &times;
          </button>
        </div>
        <div className="truncate text-xs italic" title={groupID}>
          {groupID}
        </div>
        {leader && (
          <GroupLeaderComponent
            leaderID={leader}
            assignableCollection={assignableCollection}
          />
        )}
        <div>
          {data.getSize() != undefined && (
            <div className="text-center">
              Size: {size - data.getAllMembers().size}
            </div>
          )}
          {assignableArray.map((value, index) => (
            <GroupMemberComponent
              memberID={value}
              assignableCollection={assignableCollection}
              removeMember={removeMember}
              index={index}
              selectedAssignables={selectedAssignables}
              handleSelect={handleSelect}
              clearSelect={clearSelect}
              key={value}
            />
          ))}
          {(data.getSize() == undefined ||
            size > data.getAllMembers().size) && (
            <div>
              <button
                className={
                  "w-full rounded-sm border " +
                  (isOver
                    ? canDrop
                      ? "bg-amber-500"
                      : "bg-red-500"
                    : "bg-neutral-400 dark:bg-neutral-600")
                }
                onClick={
                  () =>
                    setModal(
                      <AddMemberComponent />
                    ) /* addGroupMember(groupID) */
                }
              >
                +
              </button>
            </div>
          )}
        </div>
        {data.getNotes() && (
          <div className="w-full rounded-sm border bg-cyan-300 dark:bg-cyan-700">
            {data.getNotes()}
          </div>
        )}
      </div>
    </div>
  );
};

const GroupLeaderComponent = ({
  leaderID,
  assignableCollection,
}: {
  leaderID: string;
  assignableCollection: Map<string, Assignable>;
}) => {
  const data =
    assignableCollection.get(leaderID) ||
    new Assignable({ id: leaderID, name: "!ERROR!" });
  const [showAttributes, setShowAttributes] = useState<boolean>(false);

  return (
    <div className="my-1 max-w-[496px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
      <div onClick={() => setShowAttributes(!showAttributes)}>
        <div className="flex flex-row place-content-between font-bold">
          <span className="truncate" title={data.getName()}>
            {data.getName()}
          </span>
        </div>
        <div className="truncate text-xs italic" title={leaderID}>
          {leaderID}
        </div>
      </div>
      {showAttributes && (
        <>
          {Array.from(data.getAttributes() as Map<string, string>)
            .filter(([key]) => data.getAttributeGroups().get(key) == "Contact")
            .map(([key, value]) => (
              <div
                className="my-1 flex flex-row flex-wrap place-content-between gap-1 rounded-md bg-cyan-300 p-1 dark:bg-cyan-700"
                key={key}
              >
                <span>{key}:</span>
                <span className="truncate">{value}</span>
              </div>
            ))}
          {Array.from(data.getAttributes())
            .filter(([key]) =>
              ["Availability", "Location"].includes(
                data.getAttributeGroups().get(key) || ""
              )
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
        </>
      )}
    </div>
  );
};

const GroupMemberComponent = ({
  memberID,
  assignableCollection,
  removeMember,
  index,
  selectedAssignables,
  handleSelect,
  clearSelect,
}: {
  memberID: string;
  assignableCollection: Map<string, Assignable>;
  removeMember: (memberID: string) => void;
  index: number;
  selectedAssignables: Array<string>;
  handleSelect: (index: number, shiftKey: boolean, ctrlKey: boolean) => void;
  clearSelect: () => void;
}) => {
  const data =
    assignableCollection.get(memberID) ||
    new Assignable({ id: memberID, name: "!ERROR!" });

  const [{ isDragging }, drag, dragPreview] = useDrag<
    AssignableDragItem,
    void,
    { isDragging: boolean }
  >(
    () => ({
      type: DNDType.ASSIGNABLE,
      item: {
        id: selectedAssignables.length > 0 ? selectedAssignables : [memberID],
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

  const selected = selectedAssignables.includes(memberID);
  const [showAttributes, setShowAttributes] = useState<boolean>(false);

  return (
    <div
      className={
        "my-1 flex max-w-[496px] flex-col-reverse overflow-hidden rounded-md bg-cyan-200 select-none min-[21rem]:flex-row dark:bg-cyan-800" +
        (isDragging ? " opacity-50" : "") +
        (selected ? " border-4 border-amber-500" : "")
      }
    >
      <div
        className="grid h-4 place-content-center bg-cyan-300 min-[21rem]:h-auto min-[21rem]:w-8 dark:bg-cyan-700"
        onClick={() => setShowAttributes(!showAttributes)}
      >
        &hellip;
      </div>
      <div className="w-full max-w-[90%] p-2">
        <div
          ref={dragRef}
          onClick={(e) => handleSelect(index, e.shiftKey, e.ctrlKey)}
        >
          <div className="truncate font-bold" title={data.getName()}>
            {data.getName()}
          </div>
          <div className="truncate text-xs italic" title={memberID}>
            {memberID}
          </div>
        </div>
        {showAttributes && (
          <>
            {Array.from(data.getAttributes() as Map<string, string>)
              .filter(
                ([key]) => data.getAttributeGroups().get(key) == "Contact"
              )
              .map(([key, value]) => (
                <div
                  className="my-1 flex flex-row flex-wrap place-content-between gap-1 rounded-md bg-cyan-300 p-1 dark:bg-cyan-700"
                  key={key}
                >
                  <span>{key}:</span>
                  <span className="truncate">{value}</span>
                </div>
              ))}
            {Array.from(data.getAttributes())
              .filter(([key]) =>
                ["Availability", "Location"].includes(
                  data.getAttributeGroups().get(key) || ""
                )
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
          </>
        )}
      </div>
      <div
        className="grid h-4 place-content-center bg-red-500 min-[21rem]:h-auto min-[21rem]:w-8"
        onClick={() => removeMember(memberID)}
      >
        &times;
      </div>
    </div>
  );
};
