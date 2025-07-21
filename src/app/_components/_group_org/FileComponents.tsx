import { ChangeEvent, useMemo, useRef, useState } from "react";
import { read, utils, WorkBook, writeFile } from "xlsx";
import { Assignable, AssignableManagerAction } from "../../_classes/Assignable";
import { Group, GroupManagerAction } from "../../_classes/Group";
import { Setting } from "@/app/_classes/settings";
import { loadFile, saveFile } from "@/app/_functions/FileFunctions";
import { useMapReducer } from "@/app/_functions/helpers";

export const LoadFile = ({
  assignableDispatch,
  groupDispatch,
  settings,
}: {
  assignableDispatch: (action: AssignableManagerAction) => void;
  groupDispatch: (action: GroupManagerAction) => void;
  settings: Setting;
}) => {
  const fileSelectorRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(
      event.target.files && event.target.files.length > 0
        ? event.target.files[0]
        : null
    );
  };
  const clearFile = () => {
    setSelectedFile(null);
    if (fileSelectorRef.current) fileSelectorRef.current.value = "";
  };

  const [workBook, setWorkBook] = useState<WorkBook>();
  const usePlaceholder = async () => {
    const file = await fetch("/placeholdersheet.xlsx");
    const ab = await file.arrayBuffer();
    const wb = read(ab);
    setWorkBook(wb);
  };
  useMemo(async () => {
    if (selectedFile) {
      const ab = await selectedFile.arrayBuffer();
      const wb = read(ab);
      setWorkBook(wb);
    }
  }, [selectedFile]);

  let assignableFields = new Set<string>(["Name"]);
  if (settings.getAssignableIDSource() == "id") assignableFields.add("ID");
  assignableFields = assignableFields.union(
    new Set(settings.getAssignableFields().keys())
  );
  if (settings.getAssignableNotes()) assignableFields.add("Notes");

  const FileTable = ({ wb }: { wb: WorkBook }) => {
    const [workBookMappings, workBookMappingsDispatch] = useMapReducer<
      string,
      { mappings: Map<string, string>; leader: boolean; group: boolean }
    >();
    const [sheetName, setSheetName] = useState<string>(wb.SheetNames[0]);
    const [sheetMappings, sheetMappingsDispatch] = useMapReducer<
      string,
      string
    >(workBookMappings.get(sheetName)?.mappings);
    const currentSheet = wb.Sheets[sheetName];
    const [leaderCheck, setLeaderCheck] = useState<boolean>(
      workBookMappings.get(sheetName)?.leader || false
    );
    const [groupCheck, setGroupCheck] = useState<boolean>(
      workBookMappings.get(sheetName)?.group || false
    );
    const sheetHeaders: string[] = Object.values(
      (
        utils.sheet_to_json(currentSheet, {
          header: 1,
        }) as string[]
      )[0]
    ).filter((val) =>
      val.trim().toLocaleLowerCase().localeCompare("timestamp")
    );
    const currentSheetFirstRow: any = utils.sheet_to_json(currentSheet)[0];
    const updateSheet = (newSheetName: string) => {
      setSheetName(newSheetName);
      sheetMappingsDispatch({
        type: "replace",
        value:
          workBookMappings.get(newSheetName)?.mappings ||
          new Map<string, string>(),
      });
      setLeaderCheck(workBookMappings.get(newSheetName)?.leader || false);
    };
    return (
      <div className="flex flex-col place-content-center gap-1">
        <div className="flex flex-row place-content-center gap-1 overflow-auto">
          {wb.SheetNames.map((name, index) => (
            <button
              className={
                "rounded-full border px-2" +
                (!sheetName.localeCompare(name)
                  ? workBookMappings.has(name)
                    ? " bg-green-800 dark:bg-green-200"
                    : " bg-neutral-500"
                  : workBookMappings.has(name)
                    ? " bg-green-500"
                    : "")
              }
              disabled={!sheetName.localeCompare(name)}
              onClick={() => updateSheet(name)}
              key={index}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="flex flex-row place-content-center">
          <label>
            Groups
            <input
              type="checkbox"
              checked={groupCheck}
              onChange={(e) => setGroupCheck(e.target.checked)}
            />
          </label>
          <label>
            Leaders
            <input
              type="checkbox"
              checked={leaderCheck}
              onChange={(e) => setLeaderCheck(e.target.checked)}
            />
          </label>
        </div>
        <table className="max-h-1/2 overflow-x-auto border-2 text-center">
          <tbody className="max-h-1/4 overflow-auto">
            {sheetHeaders.map((header, index) => (
              <tr key={index}>
                <th className="border border-gray-300">{header}</th>
                <td className="border border-gray-300">
                  {currentSheetFirstRow[header]}
                </td>
                <td className="border border-gray-300">
                  <select
                    className={
                      "rounded-sm border" +
                      (workBookMappings.get(sheetName)?.mappings.get(header) &&
                      sheetMappings.get(header) ==
                        workBookMappings.get(sheetName)?.mappings.get(header)
                        ? " bg-green-500"
                        : "")
                    }
                    value={sheetMappings.get(header) || ""}
                    onChange={(e) => {
                      if (e.target.value)
                        sheetMappingsDispatch({
                          type: "create",
                          key: header,
                          value: e.target.value,
                        });
                      else
                        sheetMappingsDispatch({
                          type: "delete",
                          key: header,
                        });
                    }}
                  >
                    <option className="text-black" value="">
                      -
                    </option>
                    {groupCheck ? (
                      <>
                        <option className="text-black" value="Leader">
                          Leader
                        </option>
                        <option className="text-black" value="Members">
                          Members
                        </option>
                      </>
                    ) : (
                      <>
                        {Array.from(assignableFields).map(
                          (value, fieldindex) => (
                            <option
                              className="text-black"
                              value={value}
                              key={fieldindex}
                            >
                              {value}
                            </option>
                          )
                        )}
                        {settings.getGroupSizeSource() == "leadersize" &&
                          leaderCheck && (
                            <option className="text-black" value="Size">
                              Size
                            </option>
                          )}
                      </>
                    )}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="rounded-full border px-2"
          onClick={() => {
            workBookMappingsDispatch({
              type: "create",
              key: sheetName,
              value: {
                mappings: sheetMappings,
                leader: leaderCheck || false,
                group: groupCheck || false,
              },
            });
          }}
        >
          Save Sheet Info
        </button>
        <button
          className="rounded-full border px-2 disabled:bg-neutral-500"
          disabled={workBookMappings.size == 0}
          onClick={() => {
            loadFile(
              wb,
              workBookMappings,
              settings,
              assignableDispatch,
              groupDispatch
            );
          }}
        >
          Load Sheet
        </button>
      </div>
    );
  };

  return (
    <div className="my-1">
      <h1 className="text-center">Load File</h1>
      <label className="block">
        <span className="text-neutral-500">Choose a sheet to upload:</span>
        <br />
        <input
          className="w-full file:rounded-sm file:border file:px-2"
          type="file"
          onChange={handleFileChange}
          accept=".xlsx,.xls,.csv,.ods,.gsheet"
          ref={fileSelectorRef}
        />
        {selectedFile ? (
          <button className="rounded-full border px-2" onClick={clearFile}>
            Clear File
          </button>
        ) : workBook ? (
          <button
            className="rounded-full border px-2"
            onClick={() => setWorkBook(undefined)}
          >
            Clear Table
          </button>
        ) : (
          <button
            className="rounded-full border px-2"
            onClick={usePlaceholder}
          >
            Use placeholder.xlsx
          </button>
        )}
      </label>
      {workBook && <FileTable wb={workBook} />}
    </div>
  );
};

export const SaveFile = ({
  assignableCollection,
  groupCollection,
}: {
  assignableCollection: Map<string, Assignable>;
  groupCollection: Map<string, Group>;
}) => {
  /* const [saveErrorGiven, setSaveErrorGiven] = useState<boolean>(false); */
  /* const checkSaveSheet = () => {
    const problems = [];
    for (const ride of groupCollection.values()) {
      if (!ride.updateValid()) {
        problems.push(
          ride.getDriver().getName() +
            "'s RIDE HAS " +
            ride.getInvalid().length +
            " PROBLEM(S)!"
        );
        problems.push(ride.getInvalid());
        problems.push(" ");
      }
    }
    if (problems.length > 0 && !saveErrorGiven) {
      alert(problems.join("\n"));
      setSaveErrorGiven(true);
    } else {
      saveSheet();
      setSaveErrorGiven(false);
    }
  }; */
  const [saveSheetName, setSaveSheetName] = useState<string>("ridesheet");
  const saveSheet = () => {
    const wb = utils.book_new();
    saveFile(wb, assignableCollection, groupCollection);
    writeFile(
      wb,
      (saveSheetName.length > 1 ? saveSheetName : "savedsheet") + ".xlsx"
    );
  };

  return (
    <div className="my-1">
      <h1 className="text-center">Save Data</h1>
      <div className="flex flex-row">
        <input
          className="w-full rounded-sm border"
          type="text"
          value={saveSheetName}
          placeholder="Set Sheet Name"
          onChange={(e) => setSaveSheetName(e.target.value)}
        />
        .xlsx
      </div>
      <button className="rounded-full border px-2" onClick={saveSheet}>
        Save Data to Sheet
      </button>
    </div>
  );
};
