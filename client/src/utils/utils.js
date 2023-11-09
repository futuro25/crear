import {clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';
import axios from 'axios';
import {config} from '../config';
import { replace } from 'lodash';

export const tw = String.raw;

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getRequest = async (url) => {
  return await axios.get(url)
    .then(function (response) {
      return response
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
}

export const postRequest = async (url, body) => {
  return await axios.post(url, body)
    .then(function (response) {
      return response
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
}

export const patchRequest = async (url, body) => {
  return await axios.patch(url, body)
    .then(function (response) {
      return response
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
}

export const deleteRequest = async (url, body) => {
  return await axios.delete(url, body)
    .then(function (response) {
      return response
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
}

export const uploadResource = async (data) => {
  const formData = new FormData();
  formData.append("file", data.file[0]);

  const res = await fetch(config.resourcesLink, {
      method: "POST",
      body: formData,
  }).then((res) => res.json());

  return res;
}

export const getDatePickerOptions = (ArrowLeftIcon, ArrowRightIcon) => {
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
    defaultDate: "",
    language: "en",
    disabledDates: [],
    weekDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    inputNameProp: "date",
    inputIdProp: "date",
    inputPlaceholderProp: "Seleccione Fecha",
    inputDateFormatProp: {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  }

  return options;
}

export const getYears = () => {
  
  const currentYear = 2023;
  const maximumYear = currentYear + 5;
  const years = [];

  for (var i = currentYear; i < maximumYear; i++) {
    years.push({id: i, name: i.toString()})
  }
  return years;
}

export const getMonths = () => {
  return [ { id: 1, name: 'Enero' }, { id: 2, name: 'Febrero' }, { id: 3, name: 'Marzo' }, { id: 4, name: 'Abril' }, { id: 5, name: 'Mayo' }, { id: 6, name: 'Junio' }, { id: 7, name: 'Julio' }, { id: 8, name: 'Agosto' }, { id: 9, name: 'Septiembre' }, { id: 10, name: 'Octubre' }, { id: 11, name: 'Noviembre' }, { id: 12, name: 'Diciembre' }];
}

export const getInvoiceNumber = () => {
  return '00001-' + Math.floor(100000 + Math.random() * 900000);
}


export const getInviteLink = (userId) => {
  return config.inviteLink + userId;
}

export const delay = ms => new Promise(res => setTimeout(res, ms));

export const formatPrice = (number) => {

  return new Intl.NumberFormat("ar", {
    style: "decimal",
    currency: "ARS",
    useGrouping:false,
  }).format(number)
}

export const formatPriceSimbol = (number) => {

  let price = "$" + new Intl.NumberFormat("ar", {
    style: "decimal",
    currency: "ARS",
    useGrouping:true,
    minimumFractionDigits:2,
    maximumFractionDigits:2,
  }).format(number)

  // price = replace(price, "", "")
  // price = replace(price, "", "")
  // price = replace(price, "", "")
  return price;
}