export class Field {
  private name: string;
  private type: string;
  private group: string;
  private required: boolean;
  private options: Set<string>;
  private multiple: boolean;

  constructor({
    name,
    type,
    group,
    required,
    options,
    multiple,
  }: {
    name: string;
    type: string;
    group: string;
    required?: boolean;
    options?: Set<string>;
    multiple?: boolean;
  }) {
    this.name = name;
    this.type = type;
    this.group = group;
    this.required = required || false;
    this.options = options || new Set<string>();
    this.multiple = multiple || false;
  }

  getName() {
    return this.name;
  }

  getType() {
    return this.type;
  }

  getGroup() {
    return this.group;
  }

  getRequired() {
    return this.required;
  }

  getOptions() {
    return this.options;
  }

  getMultiple() {
    return this.multiple;
  }

  getPlaceholderName() {
    return (
      this.name +
      (this.required ? "*" : "") +
      (this.group != "miscellaneous" ? " (" + this.group + ")" : "") +
      (" [" + this.type + "]")
    );
  }

  equals(other: Field | undefined) {
    function optionsEquals(first: Set<string>, second: Set<string>) {
      return first.symmetricDifference(second).size == 0;
    }
    return (
      !!other &&
      this.name == other.name &&
      this.type == other.type &&
      this.group == other.group &&
      this.required == other.required &&
      optionsEquals(this.getOptions(), other.getOptions()) &&
      this.multiple == other.multiple
    );
  }
}

export class Setting {
  private name?: string;
  private assignableIDSource: string;
  private assignableFields: Map<string, Field>;
  private assignableNotes: boolean;
  private useLeader: boolean;
  private groupIDSource: string;
  private groupCustomName: boolean;
  private groupUseSize: boolean;
  private groupSizeSource: string;
  private groupNotes: boolean;
  private autoGroups: boolean;

  constructor({
    name,
    assignableIDSource,
    assignableFields,
    assignableNotes,
    useLeader,
    groupIDSource,
    groupCustomName,
    groupUseSize,
    groupSizeSource,
    groupNotes,
    autoGroups,
  }: {
    name?: string;
    assignableIDSource?: string;
    assignableFields?: Map<string, Field>;
    assignableNotes?: boolean;
    useLeader?: boolean;
    groupIDSource?: string;
    groupCustomName?: boolean;
    groupUseSize?: boolean;
    groupSizeSource?: string;
    groupNotes?: boolean;
    autoGroups?: boolean;
  }) {
    this.name = name;
    this.assignableIDSource = assignableIDSource || "name";
    this.assignableFields = assignableFields || new Map<string, Field>();
    this.assignableNotes = assignableNotes || false;
    this.useLeader = useLeader || false;
    this.groupIDSource = groupIDSource || "id";
    this.groupCustomName = groupCustomName || false;
    this.groupUseSize = groupUseSize || false;
    this.groupSizeSource = groupSizeSource || "groupsize";
    this.groupNotes = groupNotes || false;
    this.autoGroups = autoGroups || false;
  }

  getName() {
    return this.name;
  }

  setName(name: string) {
    this.name = name;
  }

  getAssignableIDSource() {
    return this.assignableIDSource;
  }

  getAssignableFields() {
    return this.assignableFields;
  }

  getAssignableNotes() {
    return this.assignableNotes;
  }

  getUseLeader() {
    return this.useLeader;
  }

  getGroupIDSource() {
    return this.groupIDSource;
  }

  getGroupCustomName() {
    return this.groupCustomName;
  }

  getGroupUseSize() {
    return this.groupUseSize;
  }

  getGroupSizeSource() {
    return this.groupSizeSource;
  }

  getGroupNotes() {
    return this.groupNotes;
  }

  getAutoGroups() {
    return this.autoGroups;
  }

  equals(other: Setting | undefined) {
    function fieldsEquals(
      first: Map<string, Field>,
      second: Map<string, Field>
    ) {
      if (first.size != second.size) return false;
      for (const [key, value] of first) {
        if (!value.equals(second.get(key))) return false;
      }
      return true;
    }
    return (
      other &&
      this.assignableIDSource == other.assignableIDSource &&
      fieldsEquals(this.assignableFields, other.assignableFields) &&
      this.assignableNotes == other.assignableNotes &&
      this.useLeader == other.useLeader &&
      this.groupIDSource == other.groupIDSource &&
      this.groupCustomName == other.groupCustomName &&
      this.groupUseSize == other.groupUseSize &&
      this.groupSizeSource == other.groupSizeSource &&
      this.groupNotes == other.groupNotes &&
      this.autoGroups == other.autoGroups
    );
  }
}

export const defaultSettings = new Setting({ name: "Default" });

const bereanCollegeRidesSettings = new Setting({
  name: "College Rides",
  assignableIDSource: "Email",
  assignableFields: new Map<string, Field>([
    [
      "Email",
      new Field({
        name: "Email",
        type: "email",
        group: "contact",
        required: true,
      }),
    ],
    [
      "Phone",
      new Field({
        name: "Phone",
        type: "tel",
        group: "contact",
        required: true,
      }),
    ],
    [
      "Main Rides",
      new Field({
        name: "Main Rides",
        type: "select",
        group: "availability",
        options: new Set<string>([
          "Friday",
          "Sunday First",
          "Sunday Second",
          "Sunday Third",
        ]),
        multiple: true,
        required: true,
      }),
    ],
    [
      "Address",
      new Field({
        name: "Address",
        type: "text",
        group: "location",
        required: true,
      }),
    ],
    [
      "Campus",
      new Field({
        name: "Campus",
        type: "select",
        group: "location",
        options: new Set<string>(["UCI", "CSULB", "Biola", "Chapman"]),
      }),
    ],
    [
      "Year",
      new Field({
        name: "Year",
        type: "select",
        group: "affinity",
        options: new Set<string>(["Freshman", "Sophomore", "Junior", "Senior"]),
      }),
    ],
    [
      "Backup Rides",
      new Field({
        name: "Backup Rides",
        type: "select",
        group: "availability",
        options: new Set<string>([
          "Friday",
          "Sunday First",
          "Sunday Second",
          "Sunday Third",
        ]),
        multiple: true,
      }),
    ],
  ]),
  assignableNotes: true,
  useLeader: true,
  groupIDSource: "leader",
  groupUseSize: true,
  groupSizeSource: "leadersize",
  autoGroups: true,
});

const bibleStudyTablesSettings = new Setting({
  name: "Bible Study Tables",
  assignableIDSource: "Email",
  assignableFields: new Map<string, Field>([
    [
      "Email",
      new Field({
        name: "Email",
        type: "email",
        group: "contact",
        required: true,
      }),
    ],
    [
      "Phone",
      new Field({
        name: "Phone",
        type: "tel",
        group: "contact",
        required: true,
      }),
    ],
    [
      "Affinity",
      new Field({
        name: "Affinity",
        type: "select",
        group: "affinity",
        options: new Set<string>(["College", "BAM", "FAM"]),
      }),
    ],
  ]),
  useLeader: true,
  groupIDSource: "name",
  groupCustomName: true,
  groupUseSize: true,
});

const noLeaderGroupsSettings = new Setting({
  name: "No Leader Groups",
  assignableIDSource: "Email",
  assignableFields: new Map<string, Field>([
    [
      "Email",
      new Field({
        name: "Email",
        type: "email",
        group: "contact",
        required: true,
      }),
    ],
    [
      "Phone",
      new Field({
        name: "Phone",
        type: "tel",
        group: "contact",
        required: true,
      }),
    ],
    [
      "Affinity",
      new Field({
        name: "Affinity",
        type: "select",
        group: "affinity",
        options: new Set<string>(["College", "BAM", "FAM"]),
      }),
    ],
  ]),
});

const testSettings = new Setting({
  name: "test",
  assignableIDSource: "name",
  useLeader: true,
  groupIDSource: "leader",
  autoGroups: true,
});

export const presetArray = [
  defaultSettings,
  bereanCollegeRidesSettings,
  bibleStudyTablesSettings,
  noLeaderGroupsSettings,
  testSettings,
];

export interface SettingJSON {
  name?: string;
  assignableIDSource?: string;
  assignableFields?: Array<string>;
  assignableNotes?: boolean;
  useLeader?: boolean;
  groupIDSource?: string;
  groupCustomName?: boolean;
  groupUseSize?: boolean;
  groupSizeSource?: string;
  groupNotes?: boolean;
  autoGroups?: boolean;
}

export interface FieldJSON {
  name: string;
  type: string;
  group: string;
  required: boolean;
  options: Array<string>;
  multiple: boolean;
}
