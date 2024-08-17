export type FieldError = {
  message: string;
  field: string;
};

export type APIErrorResult = {
  errorsMessages: FieldError[];
};

/*
const request1 = new Request("/blogs", {
  method: "POST",
  body: JSON.stringify({
    name: "Arthas",
    description:
      "gaming and lifestyle blog of Vitalii Tsal' - a Ukrainian streamer from Vinnytsia 5",
    websiteUrl: "https://www.youtube.com/SpitefulDick",
  }),
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YWRtaW46cXdlcnR5",
  },
});
*/
