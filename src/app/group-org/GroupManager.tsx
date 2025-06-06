import { ReactNode, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AssignableDragLayer } from "./draganddrop";
import { Setting } from "./settings";
import {
  Assignable,
  DEFAULTASSIGNABLEFILT,
  DEFAULTASSIGNABLESORT,
  filterAssignables,
  sortAssignables,
} from "./Assignable";
import {
  DEFAULTGROUPFILT,
  DEFAULTGROUPSORT,
  filterGroups,
  Group,
  GroupManagerAction,
  sortGroups,
} from "./Group";
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
    ).filter(([, field]) => ["select", "checkbox"].includes(field.getType()));
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

  const [selectMode, setSelectMode] = useState<boolean>(false);
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

  return (
    <DndProvider backend={HTML5Backend}>
      <AssignableDragLayer assignableCollection={assignableCollection} />
      <button
        className={
          "rounded-full border px-2" +
          (selectMode ? " bg-amber-500 dark:text-black" : "")
        }
        onClick={toggleSelect}
      >
        Multi-Select {selectMode ? "On" : "Off"}
      </button>
      <div className="grid grid-cols-2 gap-1">
        {/**Unassigned */}
        {!!assignableCollection.size && (
          <div>
            <div className="relative rounded-md border p-1">
              <h1 className="text-center">Unassigned</h1>
              <div className="flex flex-col place-content-between sm:flex-row">
                <span className="rounded-full bg-cyan-500 px-1 text-center">
                  {unassignedArray.length} / {unassignedCollection.size}
                </span>
                {/**Unassigned Sort & Reverse */}
                <div className="flex flex-row place-content-end">
                  {/**Unassigned Sort */}
                  <select
                    className={
                      "rounded-sm border " +
                      (!assignableSort && "text-neutral-500")
                    }
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
                    className="ml-1 font-bold text-neutral-500"
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
              {!!unassignedFilterSize && (
                <div className="flex flex-row place-content-end">
                  {showAssignableFilter ? (
                    <select
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
                      className={
                        "rounded-sm border " +
                        (assignableFilter.length < 1 &&
                          " border-neutral-500 text-neutral-500")
                      }
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
                    className="ml-1 font-bold text-neutral-500"
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
        {groupCollection.size > 0 && (
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
              <span className="rounded-full bg-emerald-500 px-1 text-center">
                {groupArray.length} / {groupCollection.size}
              </span>
              {/**Group Sort & Reverse */}
              <div className="flex flex-row place-content-end">
                {/**Group Sort */}
                <select
                  className={
                    "rounded-sm border " + (!groupSort && "text-neutral-500")
                  }
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
                  className="ml-1 font-bold text-neutral-500"
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
                    className={
                      "rounded-sm border " +
                      (groupFilter.length < 1 &&
                        " border-neutral-500 text-neutral-500")
                    }
                    onClick={() => setShowGroupFilter(!showGroupFilter)}
                  >
                    {groupFilter.length < 1
                      ? "-Filter-"
                      : groupFilter.toLocaleString()}
                  </p>
                )}
                <button
                  className="ml-1 font-bold text-neutral-500"
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
            <div className="m-1 flex max-h-[70svh] flex-col gap-1 overflow-auto">
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
