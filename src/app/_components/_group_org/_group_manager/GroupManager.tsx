import { ReactNode, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AssignableDragLayer } from "./draganddrop";
import { Setting } from "../../../_classes/settings";
import {
  Assignable,
  DEFAULTASSIGNABLEFILT,
  DEFAULTASSIGNABLESORT,
  filterAssignables,
  sortAssignables,
} from "../../../_classes/Assignable";
import {
  DEFAULTGROUPFILT,
  DEFAULTGROUPSORT,
  filterGroups,
  Group,
  GroupManagerAction,
  sortGroups,
} from "../../../_classes/Group";
import { UnassignedArrayComponent } from "./UnassignedComponent";
import { GroupComponent } from "./GroupComponent";
import { GroupForm } from "./GroupForm";

export const GroupManager = ({
  settings,
  assignableCollection,
  unassignedCollection,
  groupCollection,
  groupDispatch,
  modalDispatch,
}: {
  settings: Setting;
  assignableCollection: Map<string, Assignable>;
  unassignedCollection: Set<string>;
  groupCollection: Map<string, Group>;
  groupDispatch: (action: GroupManagerAction) => void;
  modalDispatch: (element: ReactNode) => void;
}) => {
  const [assignableSort, setAssignableSort] = useState<string>("");
  const [assignableReverse, setAssignableReverse] = useState<boolean>(false);
  const [assignableFilter, setAssignableFilter] = useState<Array<string>>(
    new Array<string>()
  );
  const unassignedArray = useMemo(() => {
    const newUnassignedArray = sortAssignables(
      filterAssignables(
        Array.from(assignableCollection.values()).filter((value) =>
          unassignedCollection.has(value.getID())
        ),
        assignableFilter
      ),
      assignableSort
    ).map((a) => a.getID());
    if (assignableReverse) newUnassignedArray.reverse();
    return newUnassignedArray;
  }, [
    assignableCollection,
    unassignedCollection,
    assignableSort,
    assignableReverse,
    assignableFilter,
  ]);

  const [groupSort, setGroupSort] = useState<string>("");
  const [groupReverse, setGroupReverse] = useState<boolean>(false);
  const [groupFilter, setGroupFilter] = useState<Array<string>>(
    new Array<string>()
  );
  const groupArray = useMemo(() => {
    const newGroupArray = sortGroups(
      filterGroups(
        Array.from(groupCollection.values()),
        assignableCollection,
        groupFilter
      ),
      groupSort
    ).map((g) => g.getID());
    if (groupReverse) newGroupArray.reverse();
    return newGroupArray;
  }, [
    groupCollection,
    assignableCollection,
    groupSort,
    groupReverse,
    groupFilter,
  ]);

  const [filterArray, unassignedFilterSize, groupFilterSize] = useMemo(() => {
    const filterArray = Array.from(
      settings.getAssignableFields().entries()
    ).filter(
      ([, field]) =>
        ["select", "checkbox"].includes(field.getType()) &&
        !field.getName().toLocaleLowerCase().includes("backup")
    );
    const filterArraySize =
      filterArray.length +
      filterArray
        .map(([, field]) => field.getOptions().size)
        .reduce((prev, curr) => prev + curr, 0);
    return [
      filterArray,
      Math.min(+settings.getUseLeader() + filterArraySize, 4),
      Math.min(
        +settings.getGroupUseSize() +
          +settings.getUseLeader() * filterArraySize,
        4
      ),
    ];
  }, [settings]);

  const showGroupForm = useMemo(() => {
    return (
      settings.getGroupIDSource() != "leader" ||
      Array.from(unassignedCollection).some((a) =>
        assignableCollection.get(a)?.getLeader()
      )
    );
  }, [settings, assignableCollection, unassignedCollection]);

  const [showAssignableFilter, setShowAssignableFilter] =
    useState<boolean>(false);
  const [showGroupFilter, setShowGroupFilter] = useState<boolean>(false);

  const addGroupMember = (groupID: string, memberID?: string) => {
    groupDispatch({
      type: "addmember",
      groupID: groupID,
      memberID: memberID ? memberID : unassignedArray.shift() || "",
    });
  };

  const [selectMode, setSelectMode] = useState<boolean>(true);
  const toggleSelect = () => {
    setSelectMode(!selectMode);
  };

  const openGroupForm = () => {
    modalDispatch(
      <GroupForm
        settings={settings}
        groupDispatch={groupDispatch}
        unassignedCollection={unassignedCollection}
        assignableCollection={assignableCollection}
      />
    );
  };

  const openAutoAssignForm = () => {
    const AutoAssignComponent = () => {
      const clearGroups = () => {
        for (const group of groupCollection.values()) {
          for (const memberID of group.getAllMembers())
            groupDispatch({
              type: "removemember",
              groupID: group.getID(),
              memberID: memberID,
            });
        }
      };
      const quickAssign = () => {
        for (const unassignedID of unassignedArray) {
          for (const groupID of groupArray) {
            const group = groupCollection.get(groupID);
            if (group) {
              const groupSize = group.getSize();
              if (!groupSize || groupSize > group.getAllMembers().size) {
                groupDispatch({
                  type: "addmember",
                  groupID: groupID,
                  memberID: unassignedID,
                });
                break;
              }
            }
          }
        }
      };
      const [smartAssignArray, setSmartAssignArray] = useState<Array<string>>(
        new Array<string>()
      );
      const smartAssign = () => {
        const groupAttributesCollection = new Map<
          string,
          Map<string, Set<string>>
        >();
        /**Build Group Attributes Collection */
        for (const group of groupCollection.values()) {
          const groupAttributes = new Map<string, Set<string>>();
          for (const filter of smartAssignArray) {
            const filterName = filter.split("|").shift() || "";
            const filterValue = filter.split("|").pop() || "";
            const groupValue = groupAttributes.get(filterName);
            groupAttributes.set(
              filterName,
              groupValue ? groupValue.add(filterValue) : new Set([filterValue])
            );
          }
          for (const filter of smartAssignArray) {
            const filterName = filter.split("|").shift() || "";
            for (const memberID of group.getAllMembers()) {
              const groupValue = groupAttributes.get(filterName);
              const member = assignableCollection.get(memberID);
              const attr = member?.getAttributes().get(filterName);
              if (Array.isArray(attr) || typeof attr == "string")
                groupAttributes.set(
                  filterName,
                  Array.isArray(attr)
                    ? groupValue
                      ? groupValue.intersection(new Set(attr))
                      : new Set(attr)
                    : groupValue
                      ? groupValue.intersection(new Set([attr]))
                      : new Set([attr])
                );
            }
            const leaderID = group.getLeader();
            if (leaderID) {
              const groupValue = groupAttributes.get(filterName);
              const leader = assignableCollection.get(leaderID);
              const attr = leader?.getAttributes().get(filterName);
              if (Array.isArray(attr) || typeof attr == "string")
                groupAttributes.set(
                  filterName,
                  Array.isArray(attr)
                    ? groupValue
                      ? groupValue.intersection(new Set(attr))
                      : new Set(attr)
                    : groupValue
                      ? groupValue.intersection(new Set([attr]))
                      : new Set([attr])
                );
            }
          }
          groupAttributesCollection.set(group.getID(), groupAttributes);
        }
        for (const unassignedID of unassignedArray) {
          const validAttributes = new Map(
            assignableCollection
              .get(unassignedID)
              ?.getAttributes()
              .entries()
              .filter(([key]) =>
                ["select", "checkbox"].includes(
                  settings.getAssignableFields().get(key)?.getType() || ""
                )
              )
          );
          for (const groupID of groupArray) {
            const group = groupCollection.get(groupID);
            if (group) {
              /**Check if group has space for a new member */
              const groupSize = group.getSize();
              let eligible =
                !groupSize || groupSize > group.getAllMembers().size;
              if (eligible) {
                /**Check if group leader has compatible attributes to member's */
                const groupAttributes = groupAttributesCollection.get(groupID);
                if (groupAttributes)
                  for (const [name, value] of groupAttributes) {
                    const attr = validAttributes.get(name);
                    if (
                      attr &&
                      value.isDisjointFrom(
                        Array.isArray(attr) ? new Set(attr) : new Set([attr])
                      )
                    ) {
                      eligible = false;
                      break;
                    }
                  }
                else eligible = false;
              }
              if (eligible) {
                const groupAttributes = groupAttributesCollection.get(groupID);
                if (groupAttributes) {
                  groupDispatch({
                    type: "addmember",
                    groupID: groupID,
                    memberID: unassignedID,
                  });
                  for (const [name, value] of groupAttributes) {
                    const attr = validAttributes.get(name);
                    groupAttributes.set(
                      name,
                      Array.isArray(attr)
                        ? value.intersection(new Set(attr))
                        : value
                    );
                  }
                  break;
                }
              }
            }
          }
        }
      };

      return (
        <div className="rounded-md border bg-white p-1 text-center dark:bg-black">
          <div>Auto Assign</div>
          <div className="flex flex-col gap-1">
            <button className="rounded-full border px-2" onClick={clearGroups}>
              Clear Groups
            </button>
            <hr />
            <button className="rounded-full border px-2" onClick={quickAssign}>
              Quick Assign
            </button>
            <div className="flex flex-row place-content-end">
              <button
                className="rounded-full border px-2"
                onClick={smartAssign}
              >
                Smart Assign
              </button>
              <select
                aria-label="Smart Assign Select"
                className="rounded-sm border"
                value={smartAssignArray}
                onChange={(e) =>
                  setSmartAssignArray(
                    [...e.target.selectedOptions].map((o) => o.value)
                  )
                }
                multiple
                size={unassignedFilterSize}
              >
                {filterArray.map(([key, value]) =>
                  value.getType() == "select" ? (
                    <optgroup key={key} label={key}>
                      {Array.from(value.getOptions()).map((option) => (
                        <option value={key + "|" + option} key={option}>
                          {option}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <option value={key} key={key}>
                      {key}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>
      );
    };

    modalDispatch(<AutoAssignComponent />);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <AssignableDragLayer assignableCollection={assignableCollection} />
      <div className="flex place-content-between">
        <button
          className="rounded-md border-4 border-double p-1"
          onClick={openAutoAssignForm}
        >
          Auto-Assign
        </button>
        <button
          className={
            "rounded-full border px-2" +
            (selectMode ? " bg-amber-500 dark:text-black" : "")
          }
          onClick={toggleSelect}
        >
          Multi-Select {selectMode ? "On" : "Off"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {/**Unassigned */}
        {!!assignableCollection.size && (
          <div>
            <div className="relative rounded-md border p-1">
              <h1 className="text-center">Unassigned</h1>
              <div className="flex flex-col place-content-between sm:flex-row">
                <span className="rounded-full bg-cyan-200 px-1 text-center dark:bg-cyan-800">
                  {unassignedArray.length} / {unassignedCollection.size}
                </span>
                {/**Unassigned Sort & Reverse */}
                <div className="flex flex-row place-content-end">
                  {/**Unassigned Sort */}
                  <select
                    aria-label="Unassigned Sort"
                    className="rounded-sm border"
                    value={assignableSort}
                    onChange={(e) => setAssignableSort(e.target.value)}
                  >
                    <option className="dark:text-black" value="">
                      --Sort--
                    </option>
                    <option
                      className="dark:text-black"
                      value={DEFAULTASSIGNABLESORT.NAME}
                    >
                      Name
                    </option>
                    {settings.getUseLeader() && (
                      <option
                        className="dark:text-black"
                        value={DEFAULTASSIGNABLESORT.LEADER}
                      >
                        Leader
                      </option>
                    )}
                    {settings.getUseLeader() &&
                      settings.getGroupSizeSource() != "groupsize" && (
                        <option
                          className="dark:text-black"
                          value={DEFAULTASSIGNABLESORT.SIZE}
                        >
                          Size
                        </option>
                      )}
                    {Array.from(settings.getAssignableFields().entries())
                      .filter(([, value]) =>
                        ["text", "number"].includes(value.getType())
                      )
                      .map(([key, value]) =>
                        value.getType() == "select" ? (
                          <optgroup
                            className="dark:text-black"
                            key={key}
                            label={key}
                          >
                            {Array.from(value.getOptions()).map((option) => (
                              <option className="dark:text-black" key={option}>
                                {option}
                              </option>
                            ))}
                          </optgroup>
                        ) : (
                          <option className="dark:text-black" key={key}>
                            {key}
                          </option>
                        )
                      )}
                  </select>
                  {/**Unassigned Reverse */}
                  <button
                    className="ml-1 rounded-md border px-1 font-bold"
                    onClick={() => setAssignableReverse(!assignableReverse)}
                  >
                    {assignableReverse ? (
                      <span>&uarr;</span>
                    ) : (
                      <span>&darr;</span>
                    )}
                  </button>
                </div>
              </div>
              {/**Unassigned Filter */}
              {unassignedFilterSize > 0 && (
                <div className="flex flex-row place-content-end">
                  {showAssignableFilter ? (
                    <select
                      aria-label="Unassigned Filter"
                      className="rounded-sm border"
                      value={assignableFilter}
                      onChange={(e) =>
                        setAssignableFilter(
                          [...e.target.selectedOptions].map((o) => o.value)
                        )
                      }
                      multiple
                      size={unassignedFilterSize}
                    >
                      {settings.getUseLeader() && (
                        <option value={DEFAULTASSIGNABLEFILT.LEADER}>
                          Leader
                        </option>
                      )}
                      {filterArray.map(([key, value]) =>
                        value.getType() == "select" ? (
                          <optgroup key={key} label={key}>
                            {Array.from(value.getOptions()).map((option) => (
                              <option value={key + "|" + option} key={option}>
                                {option}
                              </option>
                            ))}
                          </optgroup>
                        ) : (
                          <option value={key} key={key}>
                            {key}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <p
                      className="rounded-sm border"
                      onClick={() =>
                        setShowAssignableFilter(!showAssignableFilter)
                      }
                    >
                      {assignableFilter.length < 1
                        ? "-Filter-"
                        : assignableFilter.toLocaleString()}
                    </p>
                  )}
                  <button
                    className="ml-1 rounded-md border px-1 font-bold"
                    onClick={() =>
                      setShowAssignableFilter(!showAssignableFilter)
                    }
                  >
                    {showAssignableFilter ? (
                      <span>&times;</span>
                    ) : (
                      <span>&hellip;</span>
                    )}
                  </button>
                </div>
              )}
              {/**Unassigned List */}
              <UnassignedArrayComponent
                unassignedArray={unassignedArray}
                assignableCollection={assignableCollection}
                groupCollection={groupCollection}
                groupDispatch={groupDispatch}
                selectMode={selectMode}
              />
            </div>
          </div>
        )}
        {/**Group */}
        {(groupCollection.size > 0 ||
          settings.getGroupIDSource() != "leader") && (
          <div className="rounded-md border p-1">
            <h1
              className={
                "text-center" + (showGroupForm ? " relative pt-1 pb-2" : "")
              }
            >
              Groups
              {showGroupForm && (
                <button
                  className="absolute top-0 right-0 rounded-md border-4 border-double border-emerald-500 bg-emerald-200 px-2 dark:bg-emerald-800"
                  onClick={openGroupForm}
                >
                  +
                </button>
              )}
            </h1>
            <div className="flex flex-col place-content-between sm:flex-row">
              <span className="rounded-full bg-emerald-200 px-1 text-center dark:bg-emerald-800">
                {groupArray.length} / {groupCollection.size}
              </span>
              {/**Group Sort & Reverse */}
              <div className="flex flex-row place-content-end">
                {/**Group Sort */}
                <select
                  aria-label="Group Sort"
                  className="rounded-sm border"
                  value={groupSort}
                  onChange={(e) => setGroupSort(e.target.value)}
                >
                  <option className="dark:text-black" value="">
                    --Sort--
                  </option>
                  <option
                    className="dark:text-black"
                    value={DEFAULTGROUPSORT.NAME}
                  >
                    Name
                  </option>
                  {settings.getGroupUseSize() && (
                    <option
                      className="dark:text-black"
                      value={DEFAULTGROUPSORT.SIZE}
                    >
                      Size
                    </option>
                  )}
                  {settings.getUseLeader() &&
                    Array.from(settings.getAssignableFields().entries())
                      .filter(([, value]) => ["text"].includes(value.getType()))
                      .map(([key, value]) =>
                        value.getType() == "select" ? (
                          <optgroup
                            className="dark:text-black"
                            key={key}
                            label={key}
                          >
                            {Array.from(value.getOptions()).map((option) => (
                              <option className="dark:text-black" key={option}>
                                {option}
                              </option>
                            ))}
                          </optgroup>
                        ) : (
                          <option className="dark:text-black" key={key}>
                            {key}
                          </option>
                        )
                      )}
                </select>
                {/**Group Reverse */}
                <button
                  className="ml-1 rounded-md border px-1 font-bold"
                  onClick={() => setGroupReverse(!groupReverse)}
                >
                  {groupReverse ? <span>&uarr;</span> : <span>&darr;</span>}
                </button>
              </div>
            </div>
            {/**Group Filter */}
            {!!groupFilterSize && (
              <div className="flex flex-row place-content-end">
                {showGroupFilter ? (
                  <select
                    aria-label="Group Filter"
                    className="rounded-sm border"
                    value={groupFilter}
                    onChange={(e) =>
                      setGroupFilter(
                        [...e.target.selectedOptions].map((o) => o.value)
                      )
                    }
                    multiple
                    size={groupFilterSize}
                  >
                    {settings.getGroupUseSize() && (
                      <option value={DEFAULTGROUPFILT.UNFULL}>
                        Space Left
                      </option>
                    )}
                    {filterArray.map(([key, value]) =>
                      value.getType() == "select" ? (
                        <optgroup key={key} label={key}>
                          {Array.from(value.getOptions()).map((option) => (
                            <option value={key + "|" + option} key={option}>
                              {option}
                            </option>
                          ))}
                        </optgroup>
                      ) : (
                        <option key={key}>{key}</option>
                      )
                    )}
                  </select>
                ) : (
                  <p
                    className="rounded-sm border"
                    onClick={() => setShowGroupFilter(!showGroupFilter)}
                  >
                    {groupFilter.length < 1
                      ? "-Filter-"
                      : groupFilter.toLocaleString()}
                  </p>
                )}
                <button
                  className="ml-1 rounded-md border px-1 font-bold"
                  onClick={() => setShowGroupFilter(!showGroupFilter)}
                >
                  {showGroupFilter ? (
                    <span>&times;</span>
                  ) : (
                    <span>&hellip;</span>
                  )}
                </button>
              </div>
            )}
            <div className="my-1 flex max-h-[70svh] flex-col gap-1 overflow-auto md:flex-row">
              {groupArray.map((value) => (
                <GroupComponent
                  groupID={value}
                  groupCollection={groupCollection}
                  assignableCollection={assignableCollection}
                  addGroupMember={addGroupMember}
                  groupDispatch={groupDispatch}
                  selectMode={selectMode}
                  key={value}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};
