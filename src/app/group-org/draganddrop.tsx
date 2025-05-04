import { useDragLayer } from "react-dnd";
import { Assignable } from "./Assignable";

export enum DNDType {
  ASSIGNABLE = "Assignable",
}
export interface AssignableDragItem {
  id: Array<string>;
}

export const AssignableDragLayer = ({
  assignableCollection,
}: {
  assignableCollection: Map<string, Assignable>;
}) => {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem() as AssignableDragItem,
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  const data =
    assignableCollection.get(item.id[0]) ||
    new Assignable({
      id: "!ERROR!",
      name: "!ERROR!",
    });

  return (
    <div
      className="fixed top-0 left-0 z-50 h-full w-full"
      style={{
        pointerEvents: "none",
        transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
      }}
    >
      {item.id.length <= 1 ? (
        <div className="my-1 max-w-[248px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
          <ul>
            <div className="font-bold">{data.getName()}</div>
            <ul className="flex flex-row place-content-between text-xs italic">
              <li>{data.getID()}</li>
              <li>{data.getLeader() && "Leader"}</li>
            </ul>
            <ul className="m-1">
              {data.getContact() &&
                Array.from(data.getContact() as Map<string, string>)
                  .filter(([, value]) => value)
                  .map(([key, value]) => (
                    <li
                      className="flex flex-row place-content-between gap-1"
                      key={key}
                    >
                      <span>{key}:</span>
                      <span>{value}</span>
                    </li>
                  ))}
              {data.getAvailability() &&
                Array.from(
                  data.getAvailability() as Map<
                    string,
                    string | number | boolean | Array<string>
                  >
                )
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
              {data.getLocation() &&
                Array.from(
                  data.getLocation() as Map<
                    string,
                    string | number | boolean | Array<string>
                  >
                )
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
              {data.getAffinity() &&
                Array.from(
                  data.getAffinity() as Map<
                    string,
                    string | number | boolean | Array<string>
                  >
                )
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
              {data.getMiscellaneous() &&
                Array.from(
                  data.getMiscellaneous() as Map<
                    string,
                    string | number | boolean | Array<string>
                  >
                )
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
            </ul>
            {data.getSize() != undefined && (
              <li className="m-1 flex flex-row place-content-between gap-1">
                <span>Size:</span>
                <span>{data.getSize()}</span>
              </li>
            )}
            {data.getNotes() && (
              <textarea
                className="m-1 rounded-sm border bg-cyan-300 dark:bg-cyan-700"
                disabled
                defaultValue={data.getNotes()}
              />
            )}
          </ul>
        </div>
      ) : (
        <>
          <div className="w-[248px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
            <ul>
              <div className="font-bold">{data.getName()}</div>
              <ul className="flex flex-row place-content-between text-xs italic">
                <li>{data.getID()}</li>
                <li>{data.getLeader() && "Leader"}</li>
              </ul>
              <ul className="m-1">
                {data.getContact() &&
                  Array.from(data.getContact() as Map<string, string>)
                    .filter(([, value]) => value)
                    .map(([key, value]) => (
                      <li
                        className="flex flex-row place-content-between gap-1"
                        key={key}
                      >
                        <span>{key}:</span>
                        <span>{value}</span>
                      </li>
                    ))}
                {data.getAvailability() &&
                  Array.from(
                    data.getAvailability() as Map<
                      string,
                      string | number | boolean | Array<string>
                    >
                  )
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
                {data.getLocation() &&
                  Array.from(
                    data.getLocation() as Map<
                      string,
                      string | number | boolean | Array<string>
                    >
                  )
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
                {data.getAffinity() &&
                  Array.from(
                    data.getAffinity() as Map<
                      string,
                      string | number | boolean | Array<string>
                    >
                  )
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
                {data.getMiscellaneous() &&
                  Array.from(
                    data.getMiscellaneous() as Map<
                      string,
                      string | number | boolean | Array<string>
                    >
                  )
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
              </ul>
              {data.getSize() != undefined && (
                <li className="m-1 flex flex-row place-content-between gap-1">
                  <span>Size:</span>
                  <span>{data.getSize()}</span>
                </li>
              )}
              {data.getNotes() && (
                <textarea
                  className="m-1 rounded-sm border bg-cyan-300 dark:bg-cyan-700"
                  disabled
                  defaultValue={data.getNotes()}
                />
              )}
            </ul>
          </div>
          <div className="fixed top-10 left-2 -z-10 w-[232px] rounded-md bg-cyan-300 pl-2 dark:bg-cyan-900">
            &hellip;
          </div>
          <div className="fixed top-12 left-60 rounded-full bg-amber-500 px-1 dark:text-black">
            {item.id.length}
          </div>
        </>
      )}
    </div>
  );
};
