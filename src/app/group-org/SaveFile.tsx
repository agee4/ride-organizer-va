import { useState } from "react";
import { utils, writeFile } from "xlsx";
import { Assignable } from "./Assignable";
import { Group } from "./Group";

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
    const passengerJSON = [];
    for (const passenger of assignableCollection
      .values()
      .filter((a) => !a.getLeader())) {
      passengerJSON.push({
        "Email Address": passenger.getAttributes().get("Email"),
        Name: passenger.getName(),
        "Phone Number": passenger.getAttributes().get("Phone"),
        Rides: passenger.getAttributes().get("Main Rides")?.toLocaleString(),
        Address: passenger.getAttributes().get("Address"),
        College: passenger.getAttributes().get("Campus"),
        Year: passenger.getAttributes().get("Year"),
        "Backup Rides": passenger
          .getAttributes()
          .get("Backup Rides")
          ?.toLocaleString(),
        Notes: passenger.getNotes(),
      });
    }
    const ws_p = utils.json_to_sheet(passengerJSON);
    utils.book_append_sheet(wb, ws_p, "Passengers");
    const driverJSON = [];
    for (const driver of assignableCollection
      .values()
      .filter((a) => !a.getLeader())) {
      driverJSON.push({
        "Email Address": driver.getAttributes().get("Email"),
        Name: driver.getName(),
        "Phone Number": driver.getAttributes().get("Phone"),
        Seats: driver.getSize(),
        College: driver.getAttributes().get("Campus"),
        Rides: driver.getAttributes().get("Main Rides")?.toLocaleString(),
        Address: driver.getAttributes().get("Address"),
        Notes: driver.getNotes(),
      });
    }
    const ws_d = utils.json_to_sheet(driverJSON);
    utils.book_append_sheet(wb, ws_d, "Drivers");
    if (groupCollection.size > 0) {
      const rideJSON = [];
      for (const ride of groupCollection.values()) {
        const rideRecord: Record<string, string | number> = {};
        const rideDriver = assignableCollection.get(ride.getLeader() || "");
        rideRecord["Driver"] =
          rideDriver?.getName() + "(" + rideDriver?.getID() + ")";
        Array.from(ride.getAllMembers().values()).forEach(
          (passengerID, index) => {
            const passenger = assignableCollection.get(passengerID || "");
            rideRecord["Passenger " + (index + 1)] =
              passenger?.getName() + "(" + passengerID + ")";
          }
        );
        rideJSON.push(rideRecord);
      }
      const ws_r = utils.json_to_sheet(rideJSON);
      utils.book_append_sheet(wb, ws_r, "Rides");
    }
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
