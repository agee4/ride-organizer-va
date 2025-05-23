import { ReactNode, useMemo, useState } from "react";
import { Setting } from "./settings";
import {
  Assignable,
  AssignableManagerAction,
  DEFAULTASSIGNABLEFILT,
  DEFAULTASSIGNABLESORT,
  filterAssignables,
  sortAssignables,
} from "./Assignable";
import { AssignableComponent } from "./AssignableComponent";
import { AssignableForm } from "./AssignableForm";

export const AssignableManager = ({
  settings,
  assignableCollection,
  unassignedCollection,
  assignableDispatch,
  modalDispatch,
}: {
  settings: Setting;
  assignableCollection: Map<string, Assignable>;
  unassignedCollection: Set<string>;
  assignableDispatch: (action: AssignableManagerAction) => void;
  modalDispatch: (element: ReactNode) => void;
}) => {
  const [assignableSort, setAssignableSort] = useState<string>("");
  const [assignableReverse, setAssignableReverse] = useState<boolean>(false);
  const [assignableFilter, setAssignableFilter] = useState<Array<string>>(
    new Array<string>()
  );
  const assignableArray = useMemo(() => {
    const newAssignableArray = sortAssignables(
      filterAssignables(
        Array.from(assignableCollection.values()),
        assignableFilter,
        unassignedCollection
      ),
      assignableSort
    ).map((a) => a.getID());
    if (assignableReverse) newAssignableArray.reverse();
    return newAssignableArray;
  }, [
    assignableCollection,
    unassignedCollection,
    assignableSort,
    assignableReverse,
    assignableFilter,
  ]);

  const [filterArray, assignableFilterSize] = useMemo(() => {
    const filterArray = Array.from(
      settings.getAssignableFields().entries()
    ).filter(([, field]) => ["select", "checkbox"].includes(field.getType()));
    return [
      filterArray,
      Math.min(
        +!!unassignedCollection.size +
          +settings.getUseLeader() +
          filterArray.length +
          filterArray
            .map(([, field]) => field.getOptions().size)
            .reduce((prev, curr) => prev + curr, 0),
        4
      ),
    ];
  }, [settings, unassignedCollection.size]);

  const openAssignableForm = () =>
    modalDispatch(
      <AssignableForm
        settings={settings}
        assignableDispatch={assignableDispatch}
      />
    );

  const [showAssignableFilter, setShowAssignableFilter] =
    useState<boolean>(false);

  return (
    <div className="flex flex-col gap-1">
      {/**Assignable List */}
      <div className="w-[90dvw] rounded-md border border-cyan-500 bg-cyan-50 p-1 dark:bg-cyan-950">
        <h1 className="relative py-2 text-center">
          <span className="absolute top-2 left-0 rounded-full bg-cyan-500 px-1">
            {assignableArray.length} / {assignableCollection.size}
          </span>
          Assignables
          <button
            className="absolute top-1 right-0 rounded-md border-4 border-double border-cyan-500 bg-cyan-200 px-2 dark:bg-cyan-800"
            onClick={openAssignableForm}
          >
            +
          </button>
        </h1>
        {/**Assignable Sort & Reverse */}
        <div className="flex flex-row place-content-end">
          {/**Assignable Sort */}
          <select
            className={
              "rounded-sm border " + (!assignableSort && "text-neutral-500")
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
                  <optgroup className="dark:text-black" key={key} label={key}>
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
          {/**Assignable Reverse */}
          <button
            className="ml-1 font-bold text-neutral-500"
            onClick={() => setAssignableReverse(!assignableReverse)}
          >
            {assignableReverse ? <span>&uarr;</span> : <span>&darr;</span>}
          </button>
        </div>
        {/**Assignable Filter */}
        {!!assignableFilterSize && (
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
                size={assignableFilterSize}
              >
                {unassignedCollection.size > 0 && (
                  <option value={DEFAULTASSIGNABLEFILT.UNASSIGNED}>
                    Unassigned
                  </option>
                )}
                {settings.getUseLeader() && (
                  <option value={DEFAULTASSIGNABLEFILT.LEADER}>Leader</option>
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
                onClick={() => setShowAssignableFilter(!showAssignableFilter)}
              >
                {assignableFilter.length < 1
                  ? "-Filter-"
                  : assignableFilter.toLocaleString()}
              </p>
            )}
            <button
              className="ml-1 font-bold text-neutral-500"
              onClick={() => setShowAssignableFilter(!showAssignableFilter)}
            >
              {showAssignableFilter ? (
                <span>&times;</span>
              ) : (
                <span>&hellip;</span>
              )}
            </button>
          </div>
        )}
        {/**Assignable List */}
        {assignableArray.length > 0 ? (
          <div className="mt-1 flex max-h-[70svh] max-w-full flex-col gap-1 overflow-auto min-[30rem]:flex-row">
            {assignableArray.map((value) => (
              <AssignableComponent
                assignableID={value}
                assignableCollection={assignableCollection}
                assignableDispatch={assignableDispatch}
                settings={settings}
                modalDispatch={modalDispatch}
                key={value}
              />
            ))}
          </div>
        ) : (
          <h2 className="text-center">No Assignables</h2>
        )}
      </div>
    </div>
  );
};
