import { ChangeEvent, useState } from "react";
import { Assignable, AssignableManagerAction } from "./Assignable";

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
}: {
  data: Assignable;
  toggleEdit: () => void;
  assignableDispatch: (action: AssignableManagerAction) => void;
}) => {
  const [name, setName] = useState<string>(data.getName());
  const [newData, setNewData] = useState<
    Map<string, string | number | boolean | string[]>
  >(data.getAttributes());
  const updateName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const removeAssignable = () =>
    assignableDispatch({ type: "delete", assignableID: data.getID() });
  const updateAssignable = () => {
    assignableDispatch({
      type: "create",
      assignable: new Assignable({ id: data.getID(), name: name }),
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
      <label className="flex flex-row place-content-between">
        Name*
        <input
          className="rounded-sm border"
          type="text"
          name="name"
          value={name}
          placeholder="Name"
          required
          minLength={1}
          onChange={updateName}
        />
      </label>
      {Array.from(newData).map(([name, value]) => (
        <label key={name} className="flex flex-row place-content-between">
          {name}
          {Array.isArray(value) ? (
            <select
              className="rounded-sm border"
              name={name}
              defaultValue={value}
              multiple
              size={Math.min(value.length, 4)}
            >
              {value.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              className="rounded-sm border"
              type={typeof value == "number" ? "number" : "text"}
              name={name}
              defaultValue={
                typeof value != "boolean"
                  ? (newData.get(name) as string)
                  : undefined
              }
              placeholder={name}
              required
              minLength={1}
              /* onChange={updateName} */
            />
          )}
        </label>
      ))}
      {data.getSize() && <label className="flex flex-row place-content-between">
        Size*
        <input
          className="rounded-sm border"
          type="number"
          name="leadersize"
          defaultValue={data.getSize()}
          placeholder="Size"
          required
          minLength={1}
        />
      </label>}
      <textarea
          className="m-1 w-full rounded-sm border bg-cyan-300 dark:bg-cyan-700"
          defaultValue={data.getNotes()}
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
}: {
  assignableID: string;
  assignableCollection: Map<string, Assignable>;
  assignableDispatch: (action: AssignableManagerAction) => void;
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
        />
      ) : (
        <AssignableDisplay data={data} toggleEdit={toggleEditMode} />
      )}
    </div>
  );
};
