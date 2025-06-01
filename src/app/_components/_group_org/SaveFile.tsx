import { useState } from "react";
import { utils, writeFile } from "xlsx";
import { Assignable } from "../../_classes/Assignable";
import { Group } from "../../_classes/Group";
import { saveCollegeRides } from "../../_functions/CollegeRidesFileFunctions";

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
