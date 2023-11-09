import React, {useState} from "react";
import Datepicker from "tailwind-datepicker-react"
import { ArrowLeftIcon, ArrowRightIcon } from "../icons";

const options = {
	title: "",
	autoHide: true,
	todayBtn: true,
	clearBtn: false,
	clearBtnText: "Clear",
	maxDate: new Date("2030-01-01"),
	minDate: new Date("1950-01-01"),
	theme: {
		background: "",
		todayBtn: "",
		clearBtn: "",
		icons: "",
		text: "",
		disabledText: "",
		input: "",
		inputIcon: "",
		selected: "",
	},
	icons: {
		prev: () => <ArrowLeftIcon />,
		next: () => <ArrowRightIcon />,
	},
	datepickerClassNames: "top-12",
	defaultDate: new Date("2022-01-01"),
	language: "en",
	disabledDates: [],
	weekDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
	inputNameProp: "date",
	inputIdProp: "date",
	inputPlaceholderProp: "Select Date",
	inputDateFormatProp: {
		day: "numeric",
		month: "long",
		year: "numeric"
	}
}

function DatepickerComponent({handleChange}) {
  const [show, setShow] = useState(false)

	const handleClose = (state) => {
		setShow(state)
	}

  return (
    <Datepicker options={options} onChange={handleChange} show={show} setShow={handleClose} />
  );
}

export default DatepickerComponent;