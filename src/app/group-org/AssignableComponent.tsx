import { ChangeEvent, useState } from "react";
import {
  Assignable,
  AssignableManagerAction,
  DEFAULTASSIGNABLEFIELDS,
} from "./Assignable";
import { Setting } from "./settings";

const AssignableDisplay = ({
  data,
  toggleEdit,
}: {
  data: Assignable;
  toggleEdit: () => void;
}) => {
  return (
    <>
      <div className="flex flex-row place-content-between gap-1 font-bold">
        {data.getName()}
        <button className="rounded-sm border px-1" onClick={toggleEdit}>
          &hellip;
        </button>
      </div>
      <div className="flex flex-row place-content-between text-xs italic">
        <span>{data.getID()}</span>
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
                    <span>{value}</span>
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
  );
};

const AssignableEdit = ({
  data,
  toggleEdit,
  assignableDispatch,
  settings,
}: {
  data: Assignable;
  toggleEdit: () => void;
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
    toggleEdit();
  };

  return (
    <>
      <div className="flex flex-row place-content-between gap-1 font-bold">
        <div>
          Editing <span className="italic">{data.getID()}</span>
        </div>
        <button className="rounded-sm border px-1" onClick={toggleEdit}>
          &hellip;
        </button>
      </div>
      {settings.getAssignableIDSource() != DEFAULTASSIGNABLEFIELDS.NAME && (
        <label className="flex flex-row place-content-between">
          Name*:
          <input
            className="rounded-sm border"
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
            <label key={name} className="flex flex-row place-content-between">
              {name}
              {field.getRequired() ? "*" : ""}:
              {field.getType() == "select" ? (
                <select
                  className="rounded-sm border"
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
                  className="rounded-sm border"
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
        <label className="flex flex-row place-content-between">
          Size*:
          <input
            className="rounded-sm border"
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
        className="m-1 w-full rounded-sm border bg-cyan-300 dark:bg-cyan-700"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex flex-row place-content-evenly">
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
    </>
  );
};

export const AssignableComponent = ({
  assignableID,
  assignableCollection,
  assignableDispatch,
  settings,
}: {
  assignableID: string;
  assignableCollection: Map<string, Assignable>;
  assignableDispatch: (action: AssignableManagerAction) => void;
  settings: Setting;
}) => {
  const data =
    assignableCollection.get(assignableID) ||
    new Assignable({ id: assignableID, name: "!ERROR!" });

  const [editMode, setEditMode] = useState<boolean>(false);
  const toggleEditMode = () => setEditMode(!editMode);

  return (
    <div className="rounded-md border border-cyan-500 bg-cyan-200 p-2 dark:bg-cyan-800">
      {editMode ? (
        <AssignableEdit
          data={data}
          toggleEdit={toggleEditMode}
          assignableDispatch={assignableDispatch}
          settings={settings}
        />
      ) : (
        <AssignableDisplay data={data} toggleEdit={toggleEditMode} />
      )}
    </div>
  );
};
