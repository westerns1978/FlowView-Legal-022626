
// This data represents the authoritative list of active users from Freshdesk (or a similar user directory).
// It's used to cross-reference with performance data to ensure only active, relevant users are displayed.

export const fdUsersUuidMap: { [uuid: string]: string } = {
  "73ed394d-15d8-4b23-9840-bc741c8075d3": "Finley Thompson",
  "7fce00b0-37a6-42ff-b725-4f905e393e70": "System Admin",
  "16209721-1fff-46db-8e1e-0a2444039705": "Hayden Jackson",
  "556a8f00-a81d-4f41-b7c7-d7246d2f9877": "Emerson Wood",
  "e486aad9-de1e-4566-b200-679e9260af7f": "Super Admin",
  "2c788bcd-49c3-4497-8db2-3afd19b4c851": "Rowan White",
  "511b4e55-4de7-42fc-bde5-28858c7dcc20": "Drew Moore",
  "ff750021-a44b-4a88-a5af-523f1be8a200": "Logan Scott",
  "3a26529a-6ee9-4656-980f-044326d74882": "Kevin (Support Lead)",
  "c8a05a62-5581-45d7-8271-d1b81396e86e": "Kendall Green",
  "24d729ae-7cfc-42f8-960f-be002bc2f8b6": "Developer Test ID",
  "fab5c806-a77c-466d-85aa-a5f454c67333": "Jesse Nelson",
  "10a0ccfc-26fe-4361-a0fb-0f2d46901e3b": "Skyler Thomas",
  "05354455-5469-495a-9f7a-cd19b3af0fb3": "Support Agent 01",
  "60d9c4ad-d770-4999-9468-a7953fbc42a3": "Global Admin",
  "aa2bf4f9-d98d-4a9d-babc-fc4454c60da2": "Peyton Hall",
  "27d051e4-f9dc-4c8f-919c-f189db3c701c": "Taylor Jones",
  "2c184852-86c3-4bd0-865a-f89369a6febc": "Riley Brown",
  "8b3f74e3-19b6-4a89-a7f5-67c3c7c31b79": "Dakota Martinez",
  "087df0b9-bd32-4bb9-a228-10b069fded2b": "Alex Rivera",
  "0d01a060-9024-4c93-ba9e-db107c882834": "Casey Smith - Field Tech",
  "c00519fc-3956-4c1c-a5ff-3f2140f9be4c": "Dakota Martinez",
  "31999cd6-3064-44b3-a24a-453e7581c3be": "Sawyer Harris",
  "0cb1effa-929d-4155-a8db-b94a6493ab3c": "Cameron Rodriguez (Field Agent)",
  "347238f5-2e74-4815-bc94-5c08f6fe2383": "Jordan Lee",
  "51473058-5820-42fb-8903-2e960dcfee93": "Morgan Davis",
  "56a28cba-114e-4461-a817-1cf526805076": "Quinn Wilson",
  "735667f7-743a-439f-9cca-43eeedb60e09": "Avery Garcia",
  "a1dcb64e-ca90-48a0-a6bf-0fdddaa03153": "Jamie Taylor",
  "0b573618-bdab-4d7c-bdb4-dd406d1da5a9": "Micah Baker",
  "120a3f34-7d64-49f6-a4d5-547897e8ea3a": "Frankie Wright",
  "160849df-2c2f-42ec-9eb1-3e2fab0bf1c2": "Test User 01",
  "1aeb8f9f-8fdc-4f26-adb5-f67b6f59cce9": "Rory Allen",
  "2ba9b05e-16c4-4edd-9e81-fbdf8d4e2f31": "Parker Martin",
  "3518c158-eede-493f-b947-6e9eccb81d6a": "Charlie Young",
  "68561a5f-22ea-436d-94e0-24765020531c": "Sydney King"
};

// Exporting an array of names for easy cross-referencing against other user lists.
export const fdUserNames: string[] = Object.values(fdUsersUuidMap);
