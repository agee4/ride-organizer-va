import { ChangeEvent, useRef, useState } from "react";
import { read, utils, writeFile } from "xlsx";
import { Assignable, AssignableManagerAction } from "../../_classes/Assignable";
import { Group, GroupManagerAction } from "../../_classes/Group";
import { loadCollegeRides, saveCollegeRides } from "../../_functions/CollegeRidesFileFunctions";

export const LoadFile = ({
  assignableCollection,
  assignableDispatch,
  groupDispatch,
}: {
  assignableCollection: Map<string, Assignable>;
  assignableDispatch: (action: AssignableManagerAction) => void;
  groupDispatch: (action: GroupManagerAction) => void;
}) => {
  const fileSelectorRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileSelectorRef.current) fileSelectorRef.current.value = "";
  };

  const clearAssignables = () => {
    assignableCollection.forEach((value) =>
      assignableDispatch({
        type: "delete",
        assignableID: value.getID(),
      })
    );
  };
  const loadSheet = async () => {
    clearAssignables();
    const f = selectedFile
      ? selectedFile
      : await fetch("/placeholdersheet.xlsx");
    const ab = await f.arrayBuffer();
    const wb = read(ab);

    loadCollegeRides(wb, assignableDispatch, groupDispatch);
  };

  return (
    <div className="my-1">
      <h1 className="text-center">Load Data</h1>
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
        {selectedFile && (
          <button className="rounded-full border px-2" onClick={clearFile}>
            Clear File
          </button>
        )}
      </label>
      <div className="flex flex-row gap-1">
        <button
          className="rounded-full border px-2 disabled:text-neutral-500"
          onClick={loadSheet}
        >
          Load Data
        </button>
        <button className="rounded-full border px-2" onClick={clearAssignables}>
          Clear Data
        </button>
      </div>
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
  const [saveSheetName, setSaveSheetName] = useState<string>("ridesheet");
  const checkSaveSheet = () => {
    /* const problems = [];
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
    } else { */
    saveSheet();
    /* setSaveErrorGiven(false);
    } */
  };
  const saveSheet = () => {
    const wb = utils.book_new();
    saveCollegeRides(wb, assignableCollection, groupCollection);
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
      <button className="rounded-full border px-2" onClick={checkSaveSheet}>
        Save Data to Sheet
      </button>
    </div>
  );
};
