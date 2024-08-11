import moment from "moment-timezone";
import { Verifiers as V } from "..";

const vdate = new V.VDate({
    minDate: moment("2023-01-01"),
    maxDate: moment("2023-12-31")
});
console.log(vdate.check("2021-08-09")?.format("YYYY-MM-DD")); // Output: "2023-08-09"