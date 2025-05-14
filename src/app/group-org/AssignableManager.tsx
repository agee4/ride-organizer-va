import { useMemo, useState } from "react";
import { Setting } from "./settings";
import { Assignable, filterAssignables, sortAssignables } from "./Assignable";
import { AssignableArrayComponent } from "./AssignableComponent";
import { AssignableForm } from "./AssignableForm";

export const AssignableManager = ({
  settings,
  assignableCollection,
  unassignedCollection,
  createAssignable,
  deleteAssignable,
}: {
  settings: Setting;
  assignableCollection: Map<string, Assignable>;
  unassignedCollection: Set<string>;
  createAssignable: (assignable: Assignable) => void;
  deleteAssignable: (assignable: string) => void;
}) => {
  const [assignableSort, setAssignableSort] = useState<string>("");
  const [assignableReverse, setAssignableReverse] = useState<boolean>(false);
  const [assignableFilter, setAssignableFilter] = useState<Array<string>>(
    new Array<string>()
  );
  const assignableArray = useMemo(() => {
    let newAssignableArray = sortAssignables(
      filterAssignables(
        Array.from(assignableCollection.values()),
        unassignedCollection,
        assignableFilter
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
  }, [settings]);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [showAssignableFilter, setShowAssignableFilter] =
    useState<boolean>(false);

  return (
    <div className="flex flex-col gap-1">
      <div className={showForm ? "relative p-1" : "flex flex-col items-center"}>
        <button
          className={
            showForm
              ? "absolute top-1 right-2"
              : "w-full rounded-md border bg-cyan-200 dark:bg-cyan-800"
          }
          type="button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <>&times;</> : "Add Assignable"}
        </button>
        {showForm && (
          <AssignableForm
            settings={settings}
            createAssignable={createAssignable}
          />
        )}
      </div>
      <div className="relative rounded-md border p-1">
        <h1 className="text-center">Assignables</h1>
        <div className="flex flex-row place-content-end">
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
            <option className="dark:text-black" value="name">
              Name
            </option>
            {settings.getUseLeader() && (
              <option className="dark:text-black" value="leader">
                Leader
              </option>
            )}
            {settings.getUseLeader() &&
              settings.getGroupSizeSource() != "groupsize" && (
                <option className="dark:text-black" value="size">
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
          <button
            className="ml-1 font-bold text-neutral-500"
            onClick={() => setAssignableReverse(!assignableReverse)}
          >
            {assignableReverse ? <span>&uarr;</span> : <span>&darr;</span>}
          </button>
        </div>
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
                  <option value="_unassigned">Unassigned</option>
                )}
                {settings.getUseLeader() && (
                  <option value="_leader">Leader</option>
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
        <AssignableArrayComponent
          assignableArray={assignableArray}
          assignableCollection={assignableCollection}
          deleteAssignable={deleteAssignable}
        />
      </div>
    </div>
  );
};
