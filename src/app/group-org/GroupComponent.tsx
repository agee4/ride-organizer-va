import { useContext, useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { Assignable } from "./Assignable";
import { Group } from "./Group";
import { GroupOrganizerContext } from "./context";
import { AssignableDragItem, DNDType } from "./draganddrop";

export const GroupComponent = ({
  data,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
}: {
  data: Group;
  deleteGroup: (group: Group) => void;
  addGroupMember: (group: Group, memberid?: string) => void;
  removeGroupMember: (group: Group, member: Assignable) => void;
}) => {
  const goContext = useContext(GroupOrganizerContext);
  if (!goContext) {
    throw new Error(
      "RM_PassengerComponent must be used within a RideManagerProvider"
    );
  }
  const { assignableCollection, groupCollection } = goContext;

  const size = data.getSize() || 0;

  const [assignableArray, setAssignableArray] = useState<Array<string>>(
    new Array<string>()
  );
  useEffect(() => {
    setAssignableArray([
      ...(groupCollection.get(data.getID()) || data).getAllMembers().keys(),
    ]);
  }, [data]);

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
          (p) => p !== newSelection
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
          addGroupMember(data, id);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
      canDrop: (item) =>
        (data.getSize() == undefined ||
          size >= data.getAllMembers().size + item.id.length) &&
        item.id.every(
          (id) =>
            !data.getMember(id) &&
            !groupCollection
              .values()
              .some((group) => group.getLeader()?.getID() == id)
        ),
    }),
    [data, groupCollection, addGroupMember, size]
  );
  const dropRef = useRef<HTMLDivElement>(null);
  drop(dropRef);

  const leader = data.getLeader();

  const removeMember = (member: Assignable) => {
    removeGroupMember(data, member);
  };

  return (
    <div
      className="my-1 max-w-[496px] rounded-md bg-neutral-400 p-2 dark:bg-neutral-600"
      ref={dropRef}
    >
      <ul>
        <li className="flex flex-row place-content-between font-bold">
          {data.getName() || leader?.getName() || data.getID()}
          <button
            className="rounded-sm border px-1"
            onClick={() => deleteGroup(data)}
          >
            &times;
          </button>
        </li>
        <li className="text-xs italic">{data.getID()}</li>
        {!!leader && <GroupLeaderComponent member={leader} />}
        <ul className="text-center">
          {data.getSize() != undefined && (
            <li>Size: {size - data.getAllMembers().size}</li>
          )}
          {assignableArray.map((value, index) => (
            <GroupMemberComponent
              member={
                assignableCollection.get(value) ||
                new Assignable({ id: value, name: "!ERROR!" })
              }
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
            <li>
              <button
                className={
                  "w-full rounded-sm border " +
                  (isOver
                    ? canDrop
                      ? "bg-amber-500"
                      : "bg-red-500"
                    : "bg-neutral-400 dark:bg-neutral-600")
                }
                onClick={() => addGroupMember(data)}
              >
                +
              </button>
            </li>
          )}
        </ul>
        {data.getNotes() && (
          <textarea
            className="rounded-sm border bg-cyan-300 dark:bg-cyan-700"
            disabled
            defaultValue={data.getNotes()}
          />
        )}
      </ul>
    </div>
  );
};

const GroupLeaderComponent = ({ member }: { member: Assignable }) => {
  return (
    <div className="my-1 max-w-[496px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
      <ul>
        <li className="flex flex-row place-content-between font-bold">
          {member.getName()}
        </li>
        <li className="text-xs italic">{member.getID()}</li>
        <ul className="m-1">
          {member.getContact() &&
            Array.from(member.getContact() as Map<string, string>).map(
              ([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  <span>{value}</span>
                </li>
              )
            )}
          {member.getAvailability() &&
            Array.from(member.getAvailability() as Map<string, string>)
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
          {member.getLocation() &&
            Array.from(member.getLocation() as Map<string, string>)
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
                    <span className="text-right">{value}</span>
                  )}
                </li>
              ))}
        </ul>
      </ul>
    </div>
  );
};

const GroupMemberComponent = ({
  member,
  removeMember,
  index,
  selectedAssignables,
  handleSelect,
  clearSelect,
}: {
  member: Assignable;
  removeMember: (member: Assignable) => void;
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
          selectedAssignables.length > 0
            ? selectedAssignables.map((passenger) => passenger)
            : [member.getID()],
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

  const selected = selectedAssignables.includes(member.getID());

  return (
    <div
      className={
        "my-1 max-w-[496px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800" +
        (isDragging ? " opacity-50" : "") +
        (selected ? " border-4 border-amber-500" : "")
      }
      ref={dragRef}
      onClick={(e) => handleSelect(index, e.shiftKey, e.ctrlKey)}
    >
      <ul>
        <li className="flex flex-row place-content-between font-bold">
          {member.getName()}
          {removeMember && (
            <button
              className="rounded-sm border px-1"
              onClick={() => removeMember(member)}
            >
              &times;
            </button>
          )}
        </li>
        <li className="text-xs italic">{member.getID()}</li>
        <ul className="m-1">
          {member.getContact() &&
            Array.from(member.getContact() as Map<string, string>).map(
              ([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  <span>{value}</span>
                </li>
              )
            )}
          {member.getAvailability() &&
            Array.from(member.getAvailability() as Map<string, string>)
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
          {member.getLocation() &&
            Array.from(member.getLocation() as Map<string, string>)
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
                    <span className="text-right">{value}</span>
                  )}
                </li>
              ))}
        </ul>
      </ul>
    </div>
  );
};
