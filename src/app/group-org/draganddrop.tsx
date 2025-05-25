import { ConnectDragSource, ConnectDropTarget, useDragLayer } from "react-dnd";
import { Assignable } from "./Assignable";
import { SetStateAction, useRef } from "react";

export enum DNDType {
  ASSIGNABLE = "Assignable",
}
export interface AssignableDragItem {
  id: Array<string>;
}

export const handleSelectHelper = (
  index: number,
  assignableArray: Array<string>,
  prevSelectedIndex: number,
  selectedAssignables: Array<string>,
  setSelectedAssignables: (value: SetStateAction<string[]>) => void,
  setPrevSelectedIndex: (value: SetStateAction<number>) => void,
  shiftKey?: boolean,
  ctrlKey?: boolean,
  selectMode?: boolean
) => {
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
  } else if (ctrlKey || selectMode) {
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

/**Generate and connect a ref to a drop target or drag source. */
export const useDNDRef = (connect: ConnectDropTarget | ConnectDragSource) => {
  const dndRef = useRef<HTMLDivElement>(null);
  connect(dndRef);
  return dndRef;
};

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
        <div className="w-[42%] max-w-[248px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
          <div className="truncate font-bold">{data.getName()}</div>
          <div className="flex flex-row place-content-between text-xs italic">
            <span className="truncate">{data.getID()}</span>
            <span>{data.getLeader() && "Leader"}</span>
          </div>
          {Array.from(data.getAttributes() as Map<string, string>)
            .filter(([key]) => data.getAttributeGroups().get(key) == "contact")
            .map(([key, value]) => (
              <div
                className="m-1 flex flex-row place-content-between gap-1 rounded-md bg-cyan-300 p-1 dark:bg-cyan-700"
                key={key}
              >
                <span>{key}:</span>
                <span>{value}</span>
              </div>
            ))}
          {Array.from(
            data.getAttributes() as Map<
              string,
              string | number | boolean | string[]
            >
          )
            .filter(([key]) =>
              ["availability", "location"].includes(
                data.getAttributeGroups().get(key) || ""
              )
            )
            .filter(
              ([, value]) => (Array.isArray(value) && value.length > 0) || value
            )
            .map(([key, value]) => (
              <div
                className="m-1 flex flex-row place-content-between gap-1 rounded-md bg-cyan-300 p-1 dark:bg-cyan-700"
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
            <div className="m-1 flex flex-row place-content-between gap-1">
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
        </div>
      ) : (
        <div className="w-[42%] max-w-[248px]">
          {/**Top */}
          <div className="rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
            <div>
              <div className="truncate font-bold">{data.getName()}</div>
              <div className="flex flex-row place-content-between text-xs italic">
                <span className="truncate">{data.getID()}</span>
                <span>{data.getLeader() && "Leader"}</span>
              </div>
              <ul className="m-1">
                {Array.from(data.getAttributes() as Map<string, string>)
                  .filter(
                    ([key]) => data.getAttributeGroups().get(key) == "contact"
                  )
                  .map(([key, value]) => (
                    <li
                      className="flex flex-row place-content-between gap-1"
                      key={key}
                    >
                      <span>{key}:</span>
                      <span>{value}</span>
                    </li>
                  ))}
                {Array.from(data.getAttributes() as Map<string, string>)
                  .filter(([key]) =>
                    ["availability", "location"].includes(
                      data.getAttributeGroups().get(key) || ""
                    )
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
                        <span className="text-right">{value}</span>
                      )}
                    </li>
                  ))}
              </ul>
              {data.getSize() != undefined && (
                <li className="my-1 flex flex-row place-content-between gap-1">
                  <span>Size:</span>
                  <span>{data.getSize()}</span>
                </li>
              )}
              {data.getNotes() && (
                <textarea
                  className="w-full rounded-sm border bg-cyan-300 dark:bg-cyan-700"
                  disabled
                  defaultValue={data.getNotes()}
                />
              )}
            </div>
          </div>
          <div className="fixed top-10 left-2 -z-10 w-[40%] max-w-[232px] rounded-md bg-cyan-300 pl-2 dark:bg-cyan-900">
            &hellip;
          </div>
          <div className="fixed top-12 left-[38%] rounded-full bg-amber-500 px-1 dark:text-black">
            {item.id.length}
          </div>
        </div>
      )}
    </div>
  );
};
