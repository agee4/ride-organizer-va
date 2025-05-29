import { ReactNode, useState } from "react";
import {
  Assignable,
  AssignableManagerAction,
  DEFAULTASSIGNABLEFIELDS,
} from "./Assignable";
import { Setting } from "./settings";

const AssignableEdit = ({
  data,
  assignableDispatch,
  settings,
}: {
  data: Assignable;
  assignableDispatch: (action: AssignableManagerAction) => void;
  settings: Setting;
}) => {
  const [name, setName] = useState<string>(data.getName());
  const [size, setSize] = useState<number>(data.getSize() || 0);
  const [notes, setNotes] = useState<string>(data.getNotes() || "");
  const newAttributes = new Map(data.getAttributes());

  const removeAssignable = () =>
    assignableDispatch({ type: "delete", assignableID: data.getID() });
  const updateAssignable = () => {
    assignableDispatch({
      type: "create",
      assignable: new Assignable({
        id: data.getID(),
        name: name,
        attributes: newAttributes,
        attributeGroups: data.getAttributeGroups(),
        leader: data.getLeader(),
        size: size ? size : undefined,
        notes: notes ? notes : undefined,
      }),
    });
  };

  return (
    <div className="rounded-md border border-cyan-500 bg-cyan-200 p-2 dark:bg-cyan-800">
      <div className="flex flex-row place-content-between gap-1 font-bold">
        <div className="truncate">
          Editing{" "}
          <span className="italic" title={data.getID()}>
            {data.getID()}
          </span>
        </div>
      </div>
      {settings.getAssignableIDSource() != DEFAULTASSIGNABLEFIELDS.NAME && (
        <label className="flex flex-row flex-wrap place-content-between rounded-md bg-cyan-300 dark:bg-cyan-700">
          Name*:
          <input
            className="max-w-35 rounded-sm border"
            type="text"
            name={DEFAULTASSIGNABLEFIELDS.NAME}
            value={name}
            placeholder="Name"
            required
            minLength={1}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      )}
      {Array.from(settings.getAssignableFields())
        .filter(([name]) => settings.getAssignableIDSource() != name)
        .map(([name, field]) => {
          const value = newAttributes.get(name);
          return (
            <label
              key={name}
              className="mt-1 flex flex-row flex-wrap place-content-between rounded-md bg-cyan-300 dark:bg-cyan-700"
            >
              {name}
              {field.getRequired() ? "*" : ""}:
              {field.getType() == "select" ? (
                <select
                  className="max-w-35 rounded-sm border"
                  name={name}
                  value={
                    Array.isArray(value)
                      ? (value as Array<string>)
                      : (value as string)
                  }
                  required={field.getRequired()}
                  multiple={field.getMultiple()}
                  size={
                    field.getMultiple()
                      ? Math.min(field.getOptions().size, 4)
                      : 0
                  }
                  onChange={(e) =>
                    newAttributes.set(
                      e.target.name,
                      field.getMultiple()
                        ? Array.from(e.target.selectedOptions).map(
                            (o) => o.value
                          )
                        : e.target.value
                    )
                  }
                >
                  {Array.from(field.getOptions()).map((option) => (
                    <option
                      className={field.getMultiple() ? "" : "text-black"}
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="max-w-35 rounded-sm border"
                  type={field.getType()}
                  name={name}
                  value={
                    field.getType() != "boolean"
                      ? (newAttributes.get(name) as string)
                      : undefined
                  }
                  checked={typeof value == "boolean" ? value : undefined}
                  placeholder={name}
                  required={field.getRequired()}
                  minLength={1}
                  onChange={(e) =>
                    newAttributes.set(
                      e.target.name,
                      typeof value == "number"
                        ? e.target.valueAsNumber
                        : e.target.value
                    )
                  }
                />
              )}
            </label>
          );
        })}
      {!!data.getSize() && (
        <label className="mt-1 flex flex-row flex-wrap place-content-between rounded-md bg-cyan-300 dark:bg-cyan-700">
          Size*:
          <input
            className="max-w-35 rounded-sm border"
            type="number"
            name={DEFAULTASSIGNABLEFIELDS.SIZE}
            defaultValue={size}
            placeholder="Size"
            required
            min={1}
            onChange={(e) => setSize(e.target.valueAsNumber)}
          />
        </label>
      )}
      <textarea
        name={DEFAULTASSIGNABLEFIELDS.NOTES}
        className="mt-1 w-full rounded-sm border bg-cyan-300 dark:bg-cyan-700"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex flex-row place-content-evenly sm:flex-col-reverse">
        <button
          className="m-1 rounded-full border px-2 text-lg font-bold"
          onClick={removeAssignable}
        >
          &times; DELETE
        </button>
        <button
          className="m-1 rounded-full border px-2 text-lg font-bold"
          onClick={updateAssignable}
        >
          SAVE
        </button>
      </div>
    </div>
  );
};

export const AssignableComponent = ({
  assignableID,
  assignableCollection,
  assignableDispatch,
  settings,
  modalDispatch,
}: {
  assignableID: string;
  assignableCollection: Map<string, Assignable>;
  assignableDispatch: (action: AssignableManagerAction) => void;
  settings: Setting;
  modalDispatch: (element: ReactNode) => void;
}) => {
  const data =
    assignableCollection.get(assignableID) ||
    new Assignable({ id: assignableID, name: "!ERROR!" });

  return (
    <div className="h-full w-full rounded-md border border-cyan-500 bg-cyan-200 p-2 min-[30rem]:w-[160px] dark:bg-cyan-800">
      <div className="flex flex-row place-content-between gap-1 font-bold">
        <div className="truncate py-1 sm:max-w-[70dvw]" title={data.getName()}>
          {data.getName()}
        </div>
        <button
          className="rounded-sm border-4 border-double px-1"
          onClick={() =>
            modalDispatch(
              <AssignableEdit
                data={data}
                assignableDispatch={assignableDispatch}
                settings={settings}
              />
            )
          }
        >
          &hellip;
        </button>
      </div>
      <div className="flex flex-row flex-wrap place-content-between text-xs italic">
        <span className="truncate sm:max-w-[73dvw]" title={data.getID()}>
          {data.getID()}
        </span>
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
    </div>
  );
};
