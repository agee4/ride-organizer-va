import { Assignable, AssignableManagerAction } from "./Assignable";

const AssignableComponent = ({
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

  return (
    <div className="rounded-md border border-cyan-500 bg-cyan-200 p-2 dark:bg-cyan-800">
      <div className="flex flex-row place-content-between font-bold">
        {data.getName()}
        <div className="flex flex-row gap-1">
          <button className="rounded-sm border px-1">&hellip;</button>
          <button
            className="rounded-sm border px-1"
            onClick={() =>
              assignableDispatch({ type: "delete", assignableID: assignableID })
            }
          >
            &times;
          </button>
        </div>
      </div>
      <div className="flex flex-row place-content-between text-xs italic">
        <span>{assignableID}</span>
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
              className="m-1 flex flex-row flex-wrap place-content-between gap-1 rounded-md bg-cyan-300 p-1 dark:bg-cyan-700"
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
        <div className="m-1 flex flex-row flex-wrap place-content-between gap-1 rounded-md bg-cyan-300 p-1 dark:bg-cyan-700">
          <span>Size:</span>
          <span>{data.getSize()}</span>
        </div>
      )}
      {data.getNotes() && (
        <textarea
          className="m-1 w-full rounded-sm border bg-cyan-300 dark:bg-cyan-700"
          disabled
          defaultValue={data.getNotes()}
        />
      )}
    </div>
  );
};

export const AssignableArrayComponent = ({
  assignableArray,
  assignableCollection,
  assignableDispatch,
}: {
  assignableArray: Array<string>;
  assignableCollection: Map<string, Assignable>;
  assignableDispatch: (action: AssignableManagerAction) => void;
}) => {
  return (
    <ul className="flex max-h-[70svh] flex-col gap-1 overflow-auto sm:flex-row">
      {assignableArray.length > 0 ? (
        assignableArray.map((value) => (
          <li key={value}>
            <AssignableComponent
              assignableID={value}
              assignableCollection={assignableCollection}
              assignableDispatch={assignableDispatch}
            />
          </li>
        ))
      ) : (
        <li className="text-center">Empty</li>
      )}
    </ul>
  );
};
