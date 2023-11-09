import { useNavigate, useParams } from "react-router-dom";
import React, {useEffect, useState} from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from 'swr'
import {useSWRConfig} from 'swr'
import Button from "./common/Button";
import Spinner from "./common/Spinner";
import {TrashIcon, EyeIcon} from "./icons";
import * as utils from '../utils/utils'
import Datepicker from "tailwind-datepicker-react"
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";
import { split } from "lodash";
var moment = require('moment');
const conversor = require('conversor-numero-a-letras-es-ar');


const options = utils.getDatePickerOptions(ArrowLeftIcon, ArrowRightIcon)

export default function Invoice() {
  const params = useParams();
  const [insuranceInfo, setInsuranceInfo] = useState(null);

  const API_URL = '/api/billings/' + params.invoiceId;
  const API_URL_STUDENTS = '/api/students';
  const API_URL_COURSES = '/api/courses';
  const API_URL_INSURANCES = '/api/insurances';

  const { register, handleSubmit, trigger, control, reset, formState: { errors } } = useForm();
  const { data, error, isLoading, isValidating } = useSWR(API_URL, (url) => fetch(url).then(res => res.json()))
  const {data: dataStudents, isLoading: isLoadingStudents} = useSWR(API_URL_STUDENTS, (url) => fetch(url).then(res => res.json()))
  const {data: dataCourses} = useSWR(API_URL_COURSES, (url) => fetch(url).then(res => res.json()))
  const {data: dataInsurances, isLoading: isLoadingInsurances} = useSWR(API_URL_INSURANCES, (url) => fetch(url).then(res => res.json()))

  const months = utils.getMonths();
  const years = utils.getYears();

  if (error) console.log(error)


  const getPeriod = (period) => {
    const data = split(period, " ");
    return months[data[0]].name + " " + data[1];
  }

  const getStudentName = (studentId) => {
    const student = dataStudents ? dataStudents.find(student => student._id === studentId) : "";
    return student?.name + " " + student?.lastName;
  }

  const numberToLetter = (number) => {
    const data = split(number, ".");
    const cents = data[1] || 0;
    let ClaseConversor = conversor.conversorNumerosALetras;
    let miConversor = new ClaseConversor();
    return miConversor.convertToText(data[0]) + " con " + cents + "/100";
  }

  const getInsuranceInfo = (insuranceId) => {
    setInsuranceInfo(dataInsurances.find(insurance => insurance._id === insuranceId))
  }

  useEffect(() => {
    if (data && data.insurance) {
      getInsuranceInfo(data.insurance)
    }
  }, [])


  return (
    <div className="px-4 h-full overflow-auto mt-4">


      {
        (isLoadingInsurances || isLoading || isValidating) && (
          <div>
            <Spinner />
          </div>
        )
      }
      {
        error && (
          <div className="text-red-500">
            {/* ERROR... */}
          </div>
        )
      }
      {
        data && !isValidating && (
          <div className="my-4">
            <div className="w-full flex items-center justify-center max-w-[1200px] -mb-[62px]">
              <div className="p-4 border w-12 relative font-bold text-xl">C</div>
            </div>
            
            <div className="flex flex-col items-center justify-between max-w-[1200px] w-full">
              <div className="flex items-center justify-between max-w-[1200px] w-full">

                {/* COL A */}
                <div className="border-l border-b border-t w-full h-[220px] p-4 pb-8">
                  <h2 className=" mb-4 text-2xl font-bold">Centro de Recup Adaptac y Recreacion SRL</h2>
                  <h2 className=" mb-4 text-base font-bold">Instituto Educativo CREAR A-975</h2>
                  <div className="flex gap-2">
                    <label>Juramento 4751 (C1431CKE) Cdad Aut de Bs As</label>
                  </div>
                  <div className="flex gap-2">
                    <label>Tel/Fax 4522-6666 Lineas rotativas</label>
                  </div>
                  <div className="flex gap-2">
                    <label>Email: instcrear@hotmail.com</label>
                  </div>
                  <div className="flex gap-2">
                    <label>IVA EXENTO</label>
                  </div>
                </div>

                {/* COL B */}
                <div className="border-r border-b border-t w-full h-[220px] flex items-start justify-end p-4 pb-8">
                  <div className="w-[400px]">
                    <div className="flex gap-2">
                      <label>CUIT: 30-64024169-8 ING BRUTOS: 785573-07</label>
                    </div>
                    <div className="flex gap-2">
                      <label>Subvencion estatal N Inicial y EGB: 80%</label>
                    </div>
                    <div className="flex gap-2">
                    <label>Subvencion estatal Post Primaria: 80%</label>
                    </div>
                    <div className="flex gap-2">
                      <label>Inicio de actividades: 01/07/1990</label>
                    </div>
                    <div className="flex gap-2">
                      <label className="font-bold">TE gratuito 147 CABA Defensa y protecc al</label>
                    </div>
                  </div>
                </div>
              </div>


              

              <div className="flex items-center justify-between max-w-[1200px] w-full">

                {/* COL A */}
                <div className="border-l border-b border-t w-full h-[160px] p-4 pb-8">
                  <div className="flex gap-2">
                    <label>{insuranceInfo?.name}</label>
                  </div>
                  <div className="flex gap-2">
                    <label>{insuranceInfo?.address}</label>
                  </div>
                  <div className="flex gap-2">
                    <label>{insuranceInfo?.city}</label>
                  </div>
                  <div className="flex gap-2">
                    <label>CUIT: {insuranceInfo?.cuit}</label>
                  </div>
                  <div className="flex gap-2">
                    <label>Categoria: {insuranceInfo?.category}</label>
                  </div>
                </div>

                {/* COL B */}
                <div className="border-r border-b border-t w-full h-[160px] flex items-start justify-end p-4 pb-8">
                  <div className="w-[400px]">
                    <div className="flex gap-2">
                      <label>FACTURA: {data.invoiceNumber}</label>
                    </div>
                    <div className="flex gap-2">
                      <label>Fecha de Emision {moment(data.invoiceDate).format('DD/MM/YYYY')}</label>
                    </div>
                    <div className="flex gap-2 bg-slate-300 border justify-between pr-8">
                      <label>Fecha de Vencimiento {moment(data.invoiceDate).format('DD/MM/YYYY')}</label> 
                      <div>${data.invoiceAmount}</div>
                    </div>
                  </div>
                </div>
              </div>


              <div className="border w-full h-18 p-4 bg-slate-300">
                <div className="flex gap-2 items-center justify-between">
                  <div className="flex gap-2">
                    <label className="font-bold">Periodo Facturado</label>
                    <label>{getPeriod(data.period)}</label>
                  </div>
                  <div className="flex gap-2">
                    <label className="font-bold">Cond de Venta:</label>
                    <label>CONTADO</label>
                  </div>
                  <div className="flex gap-2">
                    <label className="font-bold">PLAN RM 717/88 2do CICLO</label>
                  </div>
                  <div className="flex gap-2">
                    <label className="font-bold">SUBTOTAL</label>
                  </div>
                </div>
              </div>
              
              <div className="flex border w-full h-[200px] p-4">
                <div className="w-full p-4">
                  Facturacion por Julio 2023 Resolucion 4/2023
                  Jornada Doble, Categoria A
                </div>
                <div className="w-[120px] p-4">
                  ${data.invoiceAmount}
                </div>
              </div>

              <div className="flex border text-sm w-full px-4 justify-end">
                <div className="w-full py-4"></div>
                <div className="w-[250px] py-4 flex justify-end">
                  FACTURA: ${data.invoiceAmount}
                </div>
              </div>

              <div className="flex border text-sm w-full px-4">
                <div className="w-full p-4">
                  <label className="italic">Son Pesos: {numberToLetter(data.invoiceAmount)}</label>
                </div>
              </div>

              <div className="flex border text-sm w-full px-4">
                <div className="flex text-sm w-full px-4">
                  <div className="w-full py-4 flex justify-start">
                    <label>CAE: {data.cae} Fecha de Vto del CAE: {moment(data.caeDueDate).format('DD/MM/YYYY')}</label>
                  </div>
                </div>
                <div className="w-full py-4 flex justify-end">
                  <label className="">Total a pagar ${data.invoiceAmount}</label>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}
